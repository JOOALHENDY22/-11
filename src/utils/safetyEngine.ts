import { SafetyAlert, MedicationItem } from '../types';
import { MOCK_MEDICATION_CATALOG } from '../data/mockMedications';

export function runClinicalSafetyCheck(
  medications: MedicationItem[],
  patientAllergies: string[],
  patientConditions: string[]
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];

  // 1. ALLERGY CHECKS
  medications.forEach((med) => {
    // Find catalog entry for extra metadata
    const catalogItem = MOCK_MEDICATION_CATALOG.find(
      (c) => c.name.toLowerCase().includes(med.name.toLowerCase()) || 
             med.name.toLowerCase().includes(c.genericName.toLowerCase()) ||
             c.genericName.toLowerCase().includes(med.genericName.toLowerCase())
    );

    const allergensToCheck = [
      med.name,
      med.genericName,
      med.drugClass || '',
      ...(catalogItem ? catalogItem.knownAllergens : [])
    ].filter(Boolean);

    patientAllergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase().trim();
      const isMatch = allergensToCheck.some(item => 
        item.toLowerCase().includes(allergyLower) || allergyLower.includes(item.toLowerCase())
      );

      // Special cross-reactivity mapping: Penicillin -> Amoxicillin, Augmentin, Ampicillin
      const isPenicillinCross = 
        (allergyLower.includes('penicillin') || allergyLower.includes('بنسلين')) &&
        (med.name.toLowerCase().includes('amox') || 
         med.name.toLowerCase().includes('augmentin') || 
         med.genericName.toLowerCase().includes('amoxicillin') ||
         (med.drugClass && med.drugClass.toLowerCase().includes('penicillin')));

      if (isMatch || isPenicillinCross) {
        alerts.push({
          id: `allergy-${med.id}-${Date.now()}-${Math.random()}`,
          type: 'allergy',
          severity: 'critical',
          title: `CRITICAL ALLERGY CONFLICT: ${med.name}`,
          description: `Patient has a documented severe allergy to "${allergy}". Prescribing "${med.name}" (${med.genericName}) carries high risk of anaphylaxis or severe hypersensitivity reaction.`,
          involvedItems: [med.name, allergy],
          recommendation: `Discontinue "${med.name}" immediately and switch to a non-beta-lactam alternative (e.g., Azithromycin or Clarithromycin after checking macrolide tolerance).`
        });
      }
    });
  });

  // 2. DRUG-DRUG INTERACTIONS
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const medA = medications[i];
      const medB = medications[j];

      const catA = MOCK_MEDICATION_CATALOG.find(c => c.name.toLowerCase().includes(medA.name.toLowerCase()) || c.genericName.toLowerCase().includes(medA.genericName.toLowerCase()));
      const catB = MOCK_MEDICATION_CATALOG.find(c => c.name.toLowerCase().includes(medB.name.toLowerCase()) || c.genericName.toLowerCase().includes(medB.genericName.toLowerCase()));

      // Check interaction catalog
      if (catA && catA.interactions) {
        catA.interactions.forEach(inter => {
          if (
            medB.name.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()) ||
            medB.genericName.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()) ||
            (medB.drugClass && medB.drugClass.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()))
          ) {
            alerts.push({
              id: `interaction-${medA.id}-${medB.id}`,
              type: 'drug_interaction',
              severity: inter.severity,
              title: `DRUG INTERACTION: ${medA.name} + ${medB.name}`,
              description: inter.description,
              involvedItems: [medA.name, medB.name],
              recommendation: `Review dosage or consider spaced administration / safer alternative under close monitoring.`
            });
          }
        });
      }

      // Check reverse
      if (catB && catB.interactions) {
        catB.interactions.forEach(inter => {
          if (
            medA.name.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()) ||
            medA.genericName.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()) ||
            (medA.drugClass && medA.drugClass.toLowerCase().includes(inter.interactingDrugClassOrName.toLowerCase()))
          ) {
            // Avoid duplicates
            if (!alerts.some(a => a.id === `interaction-${medA.id}-${medB.id}` || a.id === `interaction-${medB.id}-${medA.id}`)) {
              alerts.push({
                id: `interaction-${medB.id}-${medA.id}`,
                type: 'drug_interaction',
                severity: inter.severity,
                title: `DRUG INTERACTION: ${medB.name} + ${medA.name}`,
                description: inter.description,
                involvedItems: [medB.name, medA.name],
                recommendation: `Monitor clinical parameters closely or substitute one of the interacting agents.`
              });
            }
          }
        });
      }

      // 3. DUPLICATE THERAPY CHECK (e.g. same class)
      if (medA.drugClass && medB.drugClass && medA.drugClass.toLowerCase() === medB.drugClass.toLowerCase() && medA.name !== medB.name) {
        alerts.push({
          id: `duplicate-${medA.id}-${medB.id}`,
          type: 'duplicate_therapy',
          severity: 'warning',
          title: `DUPLICATE THERAPY DETECTED: ${medA.drugClass}`,
          description: `Both ${medA.name} and ${medB.name} belong to the same therapeutic class (${medA.drugClass}). Combining multiple agents from this class may increase toxicity without added therapeutic efficacy.`,
          involvedItems: [medA.name, medB.name],
          recommendation: `Confirm whether dual therapy is clinically intentional or consolidate to single agent optimization.`
        });
      }
    }
  }

  // 4. CONTRAINDICATION WITH CHRONIC CONDITIONS
  medications.forEach(med => {
    const catalogItem = MOCK_MEDICATION_CATALOG.find(c => c.name.toLowerCase().includes(med.name.toLowerCase()) || c.genericName.toLowerCase().includes(med.genericName.toLowerCase()));
    if (catalogItem && catalogItem.contraindicatedConditions) {
      patientConditions.forEach(cond => {
        const match = catalogItem.contraindicatedConditions.find(c => 
          c.toLowerCase().includes(cond.toLowerCase()) || cond.toLowerCase().includes(c.toLowerCase())
        );
        if (match) {
          alerts.push({
            id: `condition-${med.id}-${cond}`,
            type: 'dosage_warning',
            severity: 'warning',
            title: `DISEASE CONTRAINDICATION: ${med.name} with ${cond}`,
            description: `${med.name} carries contraindications or precaution warnings for patients with documented ${cond}.`,
            involvedItems: [med.name, cond],
            recommendation: `Assess renal/hepatic/cardiac status before administering.`
          });
        }
      });
    }
  });

  return alerts;
}
