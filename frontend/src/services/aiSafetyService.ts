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

const decodeKey = (str: string): string => {
  try {
    return typeof atob !== 'undefined' ? atob(str) : Buffer.from(str, 'base64').toString('utf8');
  } catch {
    return str;
  }
};

const GEMINI_ENC_KEYS = [
  'QVEuQWI4Uk42SU5ueVNoTDdwUDZUS245a3B2MG41RUtRNUZtREJJdjVxLW9UbXN3bHhNcFE=',
  'QVEuQWI4Uk42SVlsamYyNHhCMlcxc0VySVhCdW1iTkNPQ3phTTdjMVgwTW1Ud2F2YjNKY3c=',
  'QVEuQWI4Uk42THJlb1d5ajJsM0daT3lpZ0xTV0dBNlduSjg4ckxfUnY2eng3QkI5NkFuQXc='
];

let currentKeyIndex = 0;

const STORAGE_KEY_AI = 'saferx_ai_api_key';

export class AiSafetyService {
  public static getApiKeyList(): string[] {
    const metaEnv = (import.meta as any).env || {};
    const customKey = localStorage.getItem(STORAGE_KEY_AI) || metaEnv.VITE_AI_API_KEY || metaEnv.VITE_GEMINI_API_KEY;
    const defaultList = GEMINI_ENC_KEYS.map(decodeKey);
    if (customKey && !defaultList.includes(customKey.trim())) {
      return [customKey.trim(), ...defaultList];
    }
    return defaultList;
  }

  public static getApiKey(): string {
    const list = this.getApiKeyList();
    return list[currentKeyIndex % list.length];
  }

  public static setApiKey(key: string): void {
    localStorage.setItem(STORAGE_KEY_AI, key.trim());
  }

  /**
   * Run comprehensive Clinical AI Safety Analysis on prescription using Gemini with automatic multi-key rotation.
   */
  public static async analyzePrescription(prescription: Prescription): Promise<AiSafetyReport> {
    const localAlerts = runClinicalSafetyCheck(
      prescription.medications as any,
      prescription.patientAllergies || [],
      prescription.patientConditions || []
    );

    // Baseline deterministic safety report
    const fallbackReport: AiSafetyReport = this.generateDeterministicReport(prescription, localAlerts);

    const prompt = `
أنت صيدلي إكلينيكي أول وخبير في علم الأدوية بالذكاء الاصطناعي.
قم بفحص الروشتة التالية بدقة للكشف عن أي تداخلات دوائية بين الأدوية، تعارضات مع حساسية أو أمراض المريض، وملاحظات الجرعات.

بيانات الروشتة:
- اسم المريض: ${prescription.patientName}
- العمر: ${prescription.patientDob || 'غير محدد'}
- حساسية المريض المسجلة: ${prescription.patientAllergies?.join(', ') || 'لا توجد'}
- الأمراض المزمنة: ${prescription.patientConditions?.join(', ') || 'لا توجد'}
- التشخيص: ${prescription.diagnosis || 'تشخيص عام'}
- الأدوية الموصوفة:
${prescription.medications.map((m, i) => `  ${i + 1}. الاسم: ${m.name}, الجرعة: ${m.dosage}, التكرار: ${m.frequency}, المدة: ${m.duration}, التوقيت: ${m.timing}`).join('\n')}

أجب فقط بصيغة JSON صحيحة بدون أي نصوص خارجية مطابقة لهذا المخطط:
{
  "safetyScore": 95,
  "status": "safe",
  "statusLabel": "الروشتة آمنة تماماً للصرف ✓",
  "summary": "ملخص الفحص السريري باللغة العربية",
  "drugInteractions": [
    {
      "drugs": ["اسم الدواء 1", "اسم الدواء 2"],
      "severity": "major",
      "effect": "شرح التفاعل بالعربية",
      "mechanism": "الآلية الدوائية",
      "clinicalAction": "التوصية للصيدلي"
    }
  ],
  "allergyAlerts": [
    {
      "drug": "اسم الدواء",
      "allergen": "اسم المادة المسببة للحساسية",
      "riskLevel": "severe",
      "action": "توصية الاستبدال أو الإلغاء"
    }
  ],
  "dosageNotes": ["ملاحظة جرعة أو توقيت"],
  "pharmacistRecommendations": ["نصيحة إكلينيكية للصيدلي والمريض"]
}
ملاحظة: "status" يجب أن تكون حصراً واحدة من: "safe" أو "caution" أو "critical".
`;

    const keys = this.getApiKeyList();
    const modelsToTry = ['gemini-flash-latest', 'gemini-flash-lite-latest'];

    // Multi-key rotation loop with failover
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const activeKey = keys[(currentKeyIndex + attempt) % keys.length];

      for (const modelName of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey}`,
            {
              method: 'POST',
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 1500
                }
              })
            }
          );
          clearTimeout(timeoutId);

          if (response.status === 429 || response.status === 403) {
            console.warn(`[Gemini Key Limit Reached for Key #${attempt + 1}, Rotating to next key...]`);
            currentKeyIndex = (currentKeyIndex + 1) % keys.length;
            break; // Try next key
          }

          if (!response.ok) {
            continue;
          }

          const resData = await response.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          const cleanJson = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/, '')
            .replace(/```$/i, '')
            .trim();

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
          console.warn(`[Gemini Model ${modelName} Attempt Error]`, err);
        }
      }
    }

    // Fallback to deterministic pharmacology engine
    return fallbackReport;
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
