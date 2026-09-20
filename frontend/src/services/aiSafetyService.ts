import { MedicationItem, Prescription } from '../App';
import { runClinicalSafetyCheck } from '../utils/safetyEngine';

export interface DrugInteractionDetail {
  drugs: string[];
  severity: 'minor' | 'moderate' | 'major';
  effect: string;
  mechanism?: string;
  clinicalAction: string;
}

export interface AllergyAlertDetail {
  drug: string;
  allergen: string;
  riskLevel: 'moderate' | 'severe';
  action: string;
}

export interface AiSafetyReport {
  safetyScore: number; // 0 to 100
  status: 'safe' | 'caution' | 'critical';
  statusLabel: string;
  summary: string;
  drugInteractions: DrugInteractionDetail[];
  allergyAlerts: AllergyAlertDetail[];
  dosageNotes: string[];
  pharmacistRecommendations: string[];
  analyzedAt: string;
  isAiGenerated: boolean;
}

const DEFAULT_AI_KEY = 'sk-apx03e529ddb8d3f2593717e7dd28ae089541729074420aef9';
const STORAGE_KEY_AI = 'saferx_ai_api_key';

export class AiSafetyService {
  public static getApiKey(): string {
    const metaEnv = (import.meta as any).env || {};
    return (
      localStorage.getItem(STORAGE_KEY_AI) ||
      metaEnv.VITE_AI_API_KEY ||
      metaEnv.VITE_OPENAI_API_KEY ||
      DEFAULT_AI_KEY
    );
  }

  public static getBaseUrl(): string {
    const metaEnv = (import.meta as any).env || {};
    return (
      localStorage.getItem('saferx_ai_base_url') ||
      metaEnv.VITE_AI_BASE_URL ||
      metaEnv.VITE_OPENAI_BASE_URL ||
      'https://api.openai.com/v1'
    );
  }

  public static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY_AI, key.trim());
  }

  /**
   * Run comprehensive Clinical AI Safety Analysis on prescription.
   */
  public static async analyzePrescription(prescription: Prescription): Promise<AiSafetyReport> {
    const apiKey = this.getApiKey();
    const localAlerts = runClinicalSafetyCheck(
      prescription.medications as any,
      prescription.patientAllergies || [],
      prescription.patientConditions || []
    );

    // Baseline deterministic safety report
    const fallbackReport: AiSafetyReport = this.generateDeterministicReport(prescription, localAlerts);

    if (!apiKey) {
      return fallbackReport;
    }

    try {
      const prompt = `
You are a Senior Clinical Pharmacist and AI Pharmacology Expert.
Analyze the following prescription for potential Drug-Drug Interactions (DDI), Drug-Allergy conflicts, dosage/timing risks, and clinical precautions.

Prescription Details:
- Patient Name: ${prescription.patientName}
- Patient Age/DOB: ${prescription.patientDob || 'Not specified'}
- Known Allergies: ${prescription.patientAllergies?.join(', ') || 'None recorded'}
- Known Conditions: ${prescription.patientConditions?.join(', ') || 'None recorded'}
- Clinical Diagnosis: ${prescription.diagnosis || 'General clinical diagnosis'}
- Medications:
${prescription.medications.map((m, i) => `  ${i + 1}. Name: ${m.name}, Dosage: ${m.dosage}, Frequency: ${m.frequency}, Duration: ${m.duration}, Timing: ${m.timing}`).join('\n')}

Respond ONLY with valid JSON (no markdown formatting, no code fences, no extra text) matching this schema:
{
  "safetyScore": 95,
  "status": "safe",
  "statusLabel": "الروشتة آمنة تماماً للصرف",
  "summary": "ملخص الفحص السريري باللغة العربية",
  "drugInteractions": [
    {
      "drugs": ["Drug A", "Drug B"],
      "severity": "major",
      "effect": "وصف تأثير التفاعل بالعربية",
      "mechanism": "الآلية الدوائية",
      "clinicalAction": "التوصية للصيدلي"
    }
  ],
  "allergyAlerts": [
    {
      "drug": "Drug Name",
      "allergen": "Allergen",
      "riskLevel": "severe",
      "action": "توصية الإلغاء أو التبديل"
    }
  ],
  "dosageNotes": ["ملاحظة توقيت أو جرعة بالعربية"],
  "pharmacistRecommendations": ["نصيحة إكلينيكية للصيدلي والمريض"]
}
Note: "status" must be one of: "safe" | "caution" | "critical".
`;

      const baseUrl = this.getBaseUrl().replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an elite clinical pharmacology AI engine. Always return concise, accurate medical safety evaluations in valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1200
        })
      });

      if (!response.ok) {
        throw new Error(`AI API responded with status ${response.status}`);
      }

      const resData = await response.json();
      const rawContent = resData.choices?.[0]?.message?.content?.trim() || '';
      const cleanJson = rawContent.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        safetyScore: typeof parsed.safetyScore === 'number' ? parsed.safetyScore : fallbackReport.safetyScore,
        status: ['safe', 'caution', 'critical'].includes(parsed.status) ? parsed.status : fallbackReport.status,
        statusLabel: parsed.statusLabel || fallbackReport.statusLabel,
        summary: parsed.summary || fallbackReport.summary,
        drugInteractions: Array.isArray(parsed.drugInteractions) ? parsed.drugInteractions : fallbackReport.drugInteractions,
        allergyAlerts: Array.isArray(parsed.allergyAlerts) ? parsed.allergyAlerts : fallbackReport.allergyAlerts,
        dosageNotes: Array.isArray(parsed.dosageNotes) ? parsed.dosageNotes : fallbackReport.dosageNotes,
        pharmacistRecommendations: Array.isArray(parsed.pharmacistRecommendations) ? parsed.pharmacistRecommendations : fallbackReport.pharmacistRecommendations,
        analyzedAt: new Date().toISOString(),
        isAiGenerated: true
      };
    } catch (err) {
      console.warn('[AiSafetyService Live Call Fallback]', err);
      return fallbackReport;
    }
  }

  /**
   * Deterministic local clinical safety engine.
   */
  private static generateDeterministicReport(rx: Prescription, localAlerts: any[]): AiSafetyReport {
    const criticalAlerts = localAlerts.filter(a => a.severity === 'critical');
    const warningAlerts = localAlerts.filter(a => a.severity === 'warning');

    const drugInteractions: DrugInteractionDetail[] = localAlerts
      .filter(a => a.type === 'drug_interaction' || a.type === 'duplicate_therapy')
      .map(a => ({
        drugs: a.involvedItems || [],
        severity: a.severity === 'critical' ? 'major' : 'moderate',
        effect: a.description,
        clinicalAction: a.recommendation
      }));

    const allergyAlerts: AllergyAlertDetail[] = localAlerts
      .filter(a => a.type === 'allergy')
      .map(a => ({
        drug: a.involvedItems?.[0] || 'علاج موصوف',
        allergen: a.involvedItems?.[1] || 'حساسية مسجلة',
        riskLevel: 'severe',
        action: a.recommendation
      }));

    let status: 'safe' | 'caution' | 'critical' = 'safe';
    let safetyScore = 100;
    let statusLabel = 'الروشتة آمنة تماماً للصرف ✓';
    let summary = 'تم فحص جميع الأدوية الموصوفة والجرعات ومطابقتها مع بيانات المريض، ولم يتم رصد أي تداخلات أو تعارضات خطيرة.';

    if (criticalAlerts.length > 0) {
      status = 'critical';
      safetyScore = 40;
      statusLabel = 'تحذير عالي الخطورة: تعارض دوائي أو حساسية ⛔';
      summary = `تم رصد (${criticalAlerts.length}) تعارض خطير يتطلب تدخل الصيدلي ومراجعة الطبيب المعالج قبل صرف العلاج.`;
    } else if (warningAlerts.length > 0 || drugInteractions.length > 0) {
      status = 'caution';
      safetyScore = 75;
      statusLabel = 'تنبيه إكلينيكي: يوجد تداخل دوائي يستوجب التوجيه ⚠️';
      summary = `توجد تفاعلات دوائية متوسطة. يرجى توجيه المريض بفصل مواعيد تناول الأدوية ومتابعة الأعراض.`;
    }

    const defaultRecs: string[] = [];
    if (status === 'safe') {
      defaultRecs.push('صرف الروشتة وفقاً لتعليمات الطبيب مع التأكيد على الالتزام بمواعيد الوجبات.');
      defaultRecs.push('تقديم إرشادات حفظ الدواء بعيداً عن الرطوبة وأشعة الشمس المباشرة.');
    } else if (status === 'caution') {
      defaultRecs.push('التأكيد على المريض بترك فاصل زمني لا يقل عن ساعتين بين الأدوية المتداخلة.');
      defaultRecs.push('مراقبة الضغط أو النبض أو مستويات السكر حسب الأدوية الموصوفة.');
    } else {
      defaultRecs.push('التواصل مع الطبيب المعالج فوراً لاقتراح بديل آمن لتجنب التحسس أو التسمم الدوائي.');
      defaultRecs.push('عدم صرف الدواء المسبب للتعارض الحرج حتى تأكيد التعديل.');
    }

    return {
      safetyScore,
      status,
      statusLabel,
      summary,
      drugInteractions,
      allergyAlerts,
      dosageNotes: rx.medications.map(m => `${m.name}: ${m.dosage} (${m.frequency})`),
      pharmacistRecommendations: defaultRecs,
      analyzedAt: new Date().toISOString(),
      isAiGenerated: false
    };
  }
}
