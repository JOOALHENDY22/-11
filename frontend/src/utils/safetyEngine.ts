import { SafetyAlert, MedicationItem } from '../types';
import { MOCK_MEDICATION_CATALOG } from '../data/mockMedications';
import { EGYPTIAN_MEDICATIONS } from '../data/egyptianMedications';

// Helper to normalize drug names for comparison
function cleanDrugName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[0-9]+(\.[0-9]+)?(mg|g|mcg|ml|iu|sr|xr)?/g, '')
    .replace(/[\/\+\-_]/g, ' ')
    .trim();
}

export function runClinicalSafetyCheck(
  medications: MedicationItem[],
  patientAllergies: string[] = [],
  patientConditions: string[] = []
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  const getCleanedMeds = medications.map((m) => {
    const raw = (m.name || '').toLowerCase();
    const clean = cleanDrugName(m.name);
    
    // Check in Egyptian meds
    const egMed = EGYPTIAN_MEDICATIONS.find(
      (e) => clean.includes(e.name.toLowerCase()) || 
             raw.includes(e.name.toLowerCase()) || 
             raw.includes(e.nameAr.toLowerCase())
    );

    // Check in mock catalog
    const mockMed = MOCK_MEDICATION_CATALOG.find(
      (c) => clean.includes(c.name.toLowerCase()) ||
             raw.includes(c.name.toLowerCase()) ||
             clean.includes(c.genericName.toLowerCase())
    );

    const generic = egMed?.generic || mockMed?.genericName || m.genericName || clean;
    const category = egMed?.category || mockMed?.category || m.drugClass || '';
    const allergens = [
      ...(mockMed?.knownAllergens || []),
      ...(egMed?.category ? [egMed.category] : [])
    ];

    return {
      original: m,
      clean,
      raw,
      generic: generic.toLowerCase(),
      category: category.toLowerCase(),
      allergens
    };
  });

  // 1. ALLERGY CHECKS
  getCleanedMeds.forEach((item) => {
    patientAllergies.forEach((allergy) => {
      const allg = allergy.toLowerCase().trim();
      if (!allg) return;

      const isPenicillinAllergy = allg.includes('penicillin') || allg.includes('بنسلين') || allg.includes('amox');
      const isSulfaAllergy = allg.includes('sulfa') || allg.includes('سلفا');
      const isNsaidAllergy = allg.includes('aspirin') || allg.includes('nsaid') || allg.includes('اسبرين') || allg.includes('مسكن');

      const isPenicillinDrug = 
        item.clean.includes('augmentin') || 
        item.clean.includes('curam') || 
        item.clean.includes('hibiotic') || 
        item.clean.includes('megamox') || 
        item.clean.includes('amox') || 
        item.clean.includes('unictam') ||
        item.raw.includes('أوجمنتين') || 
        item.raw.includes('كيورام') || 
        item.raw.includes('هاي بيوتك');

      const isNsaidDrug =
        item.clean.includes('cataflam') ||
        item.clean.includes('voltaren') ||
        item.clean.includes('brufen') ||
        item.clean.includes('ketofan') ||
        item.clean.includes('biprofenid') ||
        item.clean.includes('aspirin') ||
        item.raw.includes('كاتافلام') ||
        item.raw.includes('فولتارين') ||
        item.raw.includes('بروفين');

      if ((isPenicillinAllergy && isPenicillinDrug) || (isNsaidAllergy && isNsaidDrug) || item.clean.includes(allg) || item.generic.includes(allg)) {
        alerts.push({
          id: `allergy-${item.original.id}-${Date.now()}`,
          type: 'allergy',
          severity: 'critical',
          title: `تحذير حساسية حرج: ${item.original.name}`,
          description: `المريض لديه حساسية مسجلة تجاه (${allergy}). وصف (${item.original.name}) قد يسبب تفاعلات تحسسية شديدة (Anaphylaxis).`,
          involvedItems: [item.original.name, allergy],
          recommendation: `إيقاف الدواء فوراً واستبداله ببديل آمن لا ينتمي لنفس العائلة الدوائية.`
        });
      }
    });
  });

  // 2. DRUG-DRUG INTERACTIONS (DDI)
  for (let i = 0; i < getCleanedMeds.length; i++) {
    for (let j = i + 1; j < getCleanedMeds.length; j++) {
      const a = getCleanedMeds[i];
      const b = getCleanedMeds[j];

      // A: NSAID + NSAID (Duplicate NSAID toxicity)
      const isNsaidA = a.clean.includes('cataflam') || a.clean.includes('voltaren') || a.clean.includes('brufen') || a.clean.includes('ketofan') || a.clean.includes('biprofenid') || a.raw.includes('كاتافلام') || a.raw.includes('فولتارين');
      const isNsaidB = b.clean.includes('cataflam') || b.clean.includes('voltaren') || b.clean.includes('brufen') || b.clean.includes('ketofan') || b.clean.includes('biprofenid') || b.raw.includes('كاتافلام') || b.raw.includes('فولتارين');
      if (isNsaidA && isNsaidB) {
        alerts.push({
          id: `interaction-nsaid-double-${i}-${j}`,
          type: 'duplicate_therapy',
          severity: 'critical',
          title: `تعارض دوائي ومضاعفة مسكنات (NSAIDs Toxicity)`,
          description: `وصف مسكنين من عائلة مضادات الالتهاب غير الستيرويدية (${a.original.name} + ${b.original.name}) يضاعف خطر قرحة ونزيف المعدة والفشل الكلوي الحاد دون فائدة علاجية إضافية.`,
          involvedItems: [a.original.name, b.original.name],
          recommendation: `الاكتفاء بمسكن واحد فقط مع إضافة واقي معدة (مثل كنترولوك أو نيكسيوم) عند الضرورة.`
        });
      }

      // B: NSAID + Blood Thinners (Aspirin/Warfarin/Plavix)
      const isBloodThinnerA = a.clean.includes('warfarin') || a.clean.includes('plavix') || a.clean.includes('aspirin') || a.clean.includes('clexane') || a.clean.includes('xarelto');
      const isBloodThinnerB = b.clean.includes('warfarin') || b.clean.includes('plavix') || b.clean.includes('aspirin') || b.clean.includes('clexane') || b.clean.includes('xarelto');
      if ((isNsaidA && isBloodThinnerB) || (isNsaidB && isBloodThinnerA)) {
        alerts.push({
          id: `interaction-nsaid-bleeding-${i}-${j}`,
          type: 'drug_interaction',
          severity: 'critical',
          title: `خطر نزيف هضمي مرتفع (Bleeding Risk)`,
          description: `تناول (${a.original.name} مع ${b.original.name}) يرفع بشدة احتمال النزيف المعدي المعوي والسيولة المفرطة.`,
          involvedItems: [a.original.name, b.original.name],
          recommendation: `استبدال المسكن بالباراسيتامول (بنادول) الآمن مع أدوية السيولة.`
        });
      }

      // C: Beta-Blocker (Concor) + Verapamil/Diltiazem
      const isBetaBlockerA = a.clean.includes('concor') || a.clean.includes('bisocard') || a.generic.includes('bisoprolol');
      const isBetaBlockerB = b.clean.includes('concor') || b.clean.includes('bisocard') || b.generic.includes('bisoprolol');
      const isCCBA = a.clean.includes('verapamil') || a.clean.includes('diltiazem');
      const isCCBB = b.clean.includes('verapamil') || b.clean.includes('diltiazem');
      if ((isBetaBlockerA && isCCBB) || (isBetaBlockerB && isCCBA)) {
        alerts.push({
          id: `interaction-heart-block-${i}-${j}`,
          type: 'drug_interaction',
          severity: 'critical',
          title: `تداخل قلبي خطير (Bradycardia & Heart Block)`,
          description: `الجمع بين (${a.original.name} و ${b.original.name}) يسبب هبوط حاد في ضربات القلب وضغط الدم وخطر توقف القلب.`,
          involvedItems: [a.original.name, b.original.name],
          recommendation: `تجنب الجمع بينهما واستشارة طبيب القلب المعالج.`
        });
      }

      // D: Metformin + Contrast or Ciprofloxacin + Dairy/Antacids
      const isQuinoloneA = a.clean.includes('cipro') || a.clean.includes('tavanic') || a.clean.includes('tarivid');
      const isQuinoloneB = b.clean.includes('cipro') || b.clean.includes('tavanic') || b.clean.includes('tarivid');
      const isAntacidA = a.clean.includes('caltrate') || a.clean.includes('osteocare') || a.clean.includes('feroglobin');
      const isAntacidB = b.clean.includes('caltrate') || b.clean.includes('osteocare') || b.clean.includes('feroglobin');
      if ((isQuinoloneA && isAntacidB) || (isQuinoloneB && isAntacidA)) {
        alerts.push({
          id: `interaction-absorption-${i}-${j}`,
          type: 'drug_interaction',
          severity: 'warning',
          title: `نقص امتصاص المضاد الحيوي (Chelation Interaction)`,
          description: `تناول المكملات أو المعادن مع سيبروفلوكساسين/تافانيك يمنع امتصاص المضاد الحيوي في المعدة.`,
          involvedItems: [a.original.name, b.original.name],
          recommendation: `الفصل بفاصل زمني لا يقل عن ساعتين إلى 3 ساعات بين الدوائين.`
        });
      }
    }
  }

  // 3. CHRONIC CONDITIONS CONTRAINDICATIONS
  getCleanedMeds.forEach((item) => {
    patientConditions.forEach((cond) => {
      const c = cond.toLowerCase().trim();
      if (!c) return;

      const isAsthma = c.includes('asthma') || c.includes('حساسية صدر') || c.includes('ربو');
      const isUlcer = c.includes('ulcer') || c.includes('قرحة') || c.includes('gerd');
      const isHypertension = c.includes('hypertension') || c.includes('ضغط');
      const isKidney = c.includes('renal') || c.includes('kidney') || c.includes('كلى');

      if (isAsthma && (item.clean.includes('concor') || item.clean.includes('inderal') || item.clean.includes('cataflam') || item.clean.includes('voltaren') || item.clean.includes('aspirin'))) {
        alerts.push({
          id: `condition-asthma-${item.original.id}`,
          type: 'dosage_warning',
          severity: 'warning',
          title: `تحذير مع حساسية الصدر / الربو: ${item.original.name}`,
          description: `الدواء (${item.original.name}) قد يحفز انقباض الشعب الهوائية أو نوبة ربو حادة لدى مرضى حساسية الصدر.`,
          involvedItems: [item.original.name, cond],
          recommendation: `المتابعة الدقيقة واستخدام موسع الشعب المناسب.`
        });
      }

      if (isUlcer && (item.clean.includes('cataflam') || item.clean.includes('voltaren') || item.clean.includes('brufen') || item.clean.includes('aspirin'))) {
        alerts.push({
          id: `condition-ulcer-${item.original.id}`,
          type: 'dosage_warning',
          severity: 'warning',
          title: `تحذير قرحة المعدة: ${item.original.name}`,
          description: `المسكنات غير الستيرويدية تزيد من تهيج ونزيف جدار المعدة لدى مرضى القرحة.`,
          involvedItems: [item.original.name, cond],
          recommendation: `وصف باراسيتامول أو حماية المعدة بمثبط مضخة بروتون.`
        });
      }
    });
  });

  return alerts;
}
