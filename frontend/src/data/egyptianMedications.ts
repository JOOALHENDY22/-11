export interface EgyptianMedication {
  id: string;
  name: string;
  nameAr: string;
  generic: string;
  category: string;
  categoryAr: string;
  defaultDosage: string;
  dosages: string[];
  defaultFrequency: string;
  defaultTiming: 'before_meal' | 'after_meal' | 'with_meal' | 'bedtime' | 'anytime';
}

export const EGYPTIAN_MEDICATIONS: EgyptianMedication[] = [
  // Antibiotics (مضادات حيوية)
  {
    id: 'eg-med-1',
    name: 'Augmentin',
    nameAr: 'أوجمنتين',
    generic: 'Amoxicillin / Clavulanate',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g (1000mg)',
    dosages: ['1g (1000mg)', '625mg', '375mg', '457mg Syrup'],
    defaultFrequency: 'مرتين يومياً (كل 12 ساعة)',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-2',
    name: 'Curam',
    nameAr: 'كيورام',
    generic: 'Amoxicillin / Clavulanate',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g (1000mg)',
    dosages: ['1g', '625mg', '457mg Syrup'],
    defaultFrequency: 'مرتين يومياً (كل 12 ساعة)',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-3',
    name: 'Hibiotic',
    nameAr: 'هاي بيوتك',
    generic: 'Amoxicillin / Clavulanate',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g',
    dosages: ['1g', '625mg', '375mg', '457mg Syrup'],
    defaultFrequency: 'مرتين يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-4',
    name: 'Megamox',
    nameAr: 'ميجاموكس',
    generic: 'Amoxicillin / Clavulanate',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g',
    dosages: ['1g', '625mg', '457mg Syrup'],
    defaultFrequency: 'مرتين يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-5',
    name: 'Zithromax',
    nameAr: 'زيزروماكس',
    generic: 'Azithromycin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '500mg',
    dosages: ['500mg (3 أقراص)', '250mg', '200mg/5ml Syrup'],
    defaultFrequency: 'قرص واحد يومياً لمدة 3 أيام',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-6',
    name: 'Zisukan',
    nameAr: 'زيسوكان',
    generic: 'Azithromycin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '500mg',
    dosages: ['500mg', '250mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-7',
    name: 'Ciprofar',
    nameAr: 'سبروفار',
    generic: 'Ciprofloxacin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '500mg',
    dosages: ['500mg', '750mg', '250mg'],
    defaultFrequency: 'قرص كل 12 ساعة',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-8',
    name: 'Ciprocin',
    nameAr: 'سبروسين',
    generic: 'Ciprofloxacin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '500mg',
    dosages: ['500mg', '750mg'],
    defaultFrequency: 'مرتين يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-9',
    name: 'Tavanic',
    nameAr: 'تافانيك',
    generic: 'Levofloxacin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '500mg',
    dosages: ['500mg', '750mg'],
    defaultFrequency: 'قرص مرة واحدة يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-10',
    name: 'Unictam',
    nameAr: 'يونيكتام',
    generic: 'Sultamicillin / Ampicillin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1500mg (1.5g)',
    dosages: ['1.5g حقن', '750mg حقن', '375mg أقراص'],
    defaultFrequency: 'حقنة عضل أو وريد كل 12 ساعة',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-11',
    name: 'Cefotax',
    nameAr: 'سيفوتاكس',
    generic: 'Cefotaxime',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g Vial',
    dosages: ['1g Vial', '500mg Vial', '250mg Vial'],
    defaultFrequency: 'حقنة كل 12 ساعة',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-12',
    name: 'Ceftriaxone',
    nameAr: 'سفترياكسون',
    generic: 'Ceftriaxone',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g Vial',
    dosages: ['1g Vial IM/IV', '500mg Vial', '2g Vial'],
    defaultFrequency: 'حقنة واحدة يومياً (كل 24 ساعة)',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-13',
    name: 'Velosef',
    nameAr: 'فيلوسيف',
    generic: 'Cephradine',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '1g',
    dosages: ['1g', '500mg', '250mg Syrup'],
    defaultFrequency: 'كبسولة كل 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-14',
    name: 'Flagyl',
    nameAr: 'فلاجيل',
    generic: 'Metronidazole',
    category: 'Antiprotozoal / Antibacterial',
    categoryAr: 'مطهر معوي ومضاد بكتيريا لا هوائية',
    defaultDosage: '500mg',
    dosages: ['500mg', '250mg', '125mg/5ml Syrup'],
    defaultFrequency: 'قرص 3 مرات يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-15',
    name: 'Amrizole',
    nameAr: 'أمريزول',
    generic: 'Metronidazole',
    category: 'Antiprotozoal',
    categoryAr: 'مطهر معوي',
    defaultDosage: '500mg',
    dosages: ['500mg', '250mg', 'Syrup'],
    defaultFrequency: 'قرص 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-16',
    name: 'Dalacin C',
    nameAr: 'دالاسين سي',
    generic: 'Clindamycin',
    category: 'Antibiotic',
    categoryAr: 'مضاد حيوي',
    defaultDosage: '300mg',
    dosages: ['300mg', '150mg', '600mg Amp'],
    defaultFrequency: 'كبسولة كل 8 ساعات مع كوب ماء كامل',
    defaultTiming: 'after_meal'
  },

  // Analgesics & Anti-inflammatory (مسكنات ومضادات التهاب)
  {
    id: 'eg-med-17',
    name: 'Panadol Extra',
    nameAr: 'بنادول إكسترا (الأحمر)',
    generic: 'Paracetamol + Caffeine',
    category: 'Analgesic',
    categoryAr: 'مسكن وخافض حرارة',
    defaultDosage: '500mg / 65mg',
    dosages: ['500mg / 65mg (أحمر)'],
    defaultFrequency: 'قرصين عند اللزوم (بحد أقصى 4 مرات يومياً)',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-18',
    name: 'Panadol Advance',
    nameAr: 'بنادول أدفانس (الأزرق)',
    generic: 'Paracetamol',
    category: 'Analgesic',
    categoryAr: 'مسكن وخافض حرارة آمن',
    defaultDosage: '500mg',
    dosages: ['500mg'],
    defaultFrequency: '1-2 قرص كل 6 ساعات عند اللزوم',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-19',
    name: 'Panadol Joint',
    nameAr: 'بنادول جوينت (للمفاصل)',
    generic: 'Paracetamol Extended Release',
    category: 'Analgesic',
    categoryAr: 'مسكن آلام المفاصل ممتد المفعول',
    defaultDosage: '665mg',
    dosages: ['665mg'],
    defaultFrequency: 'قرصين كل 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-20',
    name: 'Panadol Cold & Flu',
    nameAr: 'بنادول كولد آند فلو (الأخضر/الأصفر)',
    generic: 'Paracetamol + Phenylephrine + Chlorpheniramine',
    category: 'Cold & Flu',
    categoryAr: 'علاج نزلات البرد والانفلونزا',
    defaultDosage: '500mg / 5mg / 2mg',
    dosages: ['قرص عادي', 'أكياس بودرة'],
    defaultFrequency: 'قرص كل 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-21',
    name: 'Panadol Night',
    nameAr: 'بنادول نايت',
    generic: 'Paracetamol + Diphenhydramine',
    category: 'Analgesic',
    categoryAr: 'مسكن ليلي ومساعد على النوم',
    defaultDosage: '500mg / 25mg',
    dosages: ['500mg / 25mg'],
    defaultFrequency: 'قرصين قبل النوم بنصف ساعة',
    defaultTiming: 'bedtime'
  },
  {
    id: 'eg-med-22',
    name: 'Cataflam',
    nameAr: 'كاتافلام',
    generic: 'Diclofenac Potassium',
    category: 'NSAID Analgesic',
    categoryAr: 'مسكن قوي ومضاد للالتهاب وسريع المفعول',
    defaultDosage: '50mg',
    dosages: ['50mg', '25mg', '75mg Amp', 'Drops'],
    defaultFrequency: 'قرص مرتين إلى 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-23',
    name: 'Voltaren',
    nameAr: 'فولتارين',
    generic: 'Diclofenac Sodium',
    category: 'NSAID Analgesic',
    categoryAr: 'مسكن ومضاد للروماتيزم',
    defaultDosage: '100mg SR',
    dosages: ['100mg SR', '75mg Amp', '50mg', '25mg', 'Gel 1% / 2%'],
    defaultFrequency: 'قرص واحد يومياً بعد الأكل أو حقنة عضل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-24',
    name: 'Brufen',
    nameAr: 'بروفين',
    generic: 'Ibuprofen',
    category: 'NSAID Analgesic',
    categoryAr: 'مسكن ومضاد التهاب وخافض حرارة',
    defaultDosage: '600mg',
    dosages: ['600mg', '400mg', '200mg', '100mg/5ml Syrup', 'Effervescent'],
    defaultFrequency: 'قرص أو كيس فوار 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-25',
    name: 'Bi-Profenid',
    nameAr: 'باي بروفينيد',
    generic: 'Ketoprofen',
    category: 'NSAID Analgesic',
    categoryAr: 'مسكن قوي ومضاد لالتهاب المفاصل والفقرات',
    defaultDosage: '150mg',
    dosages: ['150mg'],
    defaultFrequency: 'قرص مرتين يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-26',
    name: 'Ketofan',
    nameAr: 'كيتوفان',
    generic: 'Ketoprofen',
    category: 'NSAID Analgesic',
    categoryAr: 'مسكن لآلام العظام والأسنان',
    defaultDosage: '50mg',
    dosages: ['50mg', '75mg SR', '100mg Amp', 'Syrup'],
    defaultFrequency: 'كبسولة 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-27',
    name: 'Celebrex',
    nameAr: 'سيليبريكس',
    generic: 'Celecoxib',
    category: 'Cox-2 Selective NSAID',
    categoryAr: 'مسكن آمن للمعدة لآلام العظام والمفاصل',
    defaultDosage: '200mg',
    dosages: ['200mg', '100mg'],
    defaultFrequency: 'كبسولة مرة أو مرتين يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-28',
    name: 'Arcoxia',
    nameAr: 'أركوكسيا',
    generic: 'Etoricoxib',
    category: 'Cox-2 Inhibitor',
    categoryAr: 'مسكن قوي لآلام المفاصل والعمود الفقري',
    defaultDosage: '90mg',
    dosages: ['90mg', '60mg', '120mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-29',
    name: 'Cetal',
    nameAr: 'سيتال',
    generic: 'Paracetamol',
    category: 'Analgesic',
    categoryAr: 'خافض حرارة ومسكن',
    defaultDosage: '500mg',
    dosages: ['500mg', '250mg/5ml Syrup', '120mg Suppositories'],
    defaultFrequency: 'قرص كل 6 إلى 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-30',
    name: 'Paramol',
    nameAr: 'بارامول',
    generic: 'Paracetamol',
    category: 'Analgesic',
    categoryAr: 'مسكن وخافض حرارة',
    defaultDosage: '500mg',
    dosages: ['500mg', '1000mg'],
    defaultFrequency: 'قرص كل 6 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-31',
    name: 'Congestal',
    nameAr: 'كونجستال',
    generic: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'Cold & Flu',
    categoryAr: 'علاج أعراض نزلات البرد والاحتقان',
    defaultDosage: 'Tablet',
    dosages: ['أقراص', 'شراب للأطفال'],
    defaultFrequency: 'قرص 3 مرات يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-32',
    name: '123 (One Two Three)',
    nameAr: 'وان تو ثري (123)',
    generic: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'Cold & Flu',
    categoryAr: 'علاج نزلات البرد والرشح والزكام',
    defaultDosage: 'Tablet',
    dosages: ['أقراص', 'شراب'],
    defaultFrequency: 'قرص كل 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-33',
    name: 'Comtrex',
    nameAr: 'كومتركس',
    generic: 'Acetaminophen + Pseudoephedrine + Brompheniramine',
    category: 'Cold & Flu',
    categoryAr: 'علاج البرد والجيوب الأنفية',
    defaultDosage: 'Tablet',
    dosages: ['أقراص'],
    defaultFrequency: 'قرص أو قرصين كل 6 ساعات',
    defaultTiming: 'after_meal'
  },

  // Gastrointestinal & Stomach (الجهاز الهضمي والمعدة)
  {
    id: 'eg-med-34',
    name: 'Antinal',
    nameAr: 'أنتينال',
    generic: 'Nifuroxazide',
    category: 'Intestinal Antiseptic',
    categoryAr: 'مطهر معوي واسع المجال لحالات الإسهال',
    defaultDosage: '200mg',
    dosages: ['200mg Capsules', '220mg/5ml Syrup'],
    defaultFrequency: 'كبسولة 4 مرات يومياً (كل 6 ساعات)',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-35',
    name: 'Controloc',
    nameAr: 'كنترولوك',
    generic: 'Pantoprazole',
    category: 'Proton Pump Inhibitor (PPI)',
    categoryAr: 'علاج قرحة المعدة وارتجاع المريء وحرقة الفؤاد',
    defaultDosage: '40mg',
    dosages: ['40mg', '20mg', '40mg IV Vial'],
    defaultFrequency: 'قرص واحد يومياً صباحاً قبل الإفطار بنصف ساعة',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-36',
    name: 'Nexium',
    nameAr: 'نيكسيوم',
    generic: 'Esomeprazole',
    category: 'PPI Stomach Protectant',
    categoryAr: 'مثبط مضخة البروتون لعلاج الحموضة الشديدة',
    defaultDosage: '40mg',
    dosages: ['40mg', '20mg', '40mg IV'],
    defaultFrequency: 'قرص واحد يومياً قبل الإفطار',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-37',
    name: 'Pantozol',
    nameAr: 'بانتوزول',
    generic: 'Pantoprazole',
    category: 'PPI Stomach Protectant',
    categoryAr: 'علاج التهابات وحموضة المعدة',
    defaultDosage: '40mg',
    dosages: ['40mg', '20mg'],
    defaultFrequency: 'قرص مرة واحدة يومياً قبل الأكل',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-38',
    name: 'Gastrazole',
    nameAr: 'جاسترازول',
    generic: 'Omeprazole',
    category: 'PPI Stomach Protectant',
    categoryAr: 'علاج حموضة وقرحة المعدة',
    defaultDosage: '20mg',
    dosages: ['20mg', '40mg'],
    defaultFrequency: 'كبسولة واحدة يومياً قبل الإفطار',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-39',
    name: 'Motilium',
    nameAr: 'موتيليوم',
    generic: 'Domperidone',
    category: 'Antiemetic / Prokinetic',
    categoryAr: 'منظم حركة المعدة ومضاد للغثيان والقيء والانتفاخ',
    defaultDosage: '10mg',
    dosages: ['10mg Tablets', 'Syrup'],
    defaultFrequency: 'قرص قبل الوجبات بـ 15 دقيقة (3 مرات يومياً)',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-40',
    name: 'Colona',
    nameAr: 'كولونا',
    generic: 'Sulpiride + Mebeverine',
    category: 'IBS Antispasmodic',
    categoryAr: 'علاج تقلصات القولون العصبي والانتفاخ والتوتر المصاحب',
    defaultDosage: 'Tablet',
    dosages: ['أقراص'],
    defaultFrequency: 'قرص قبل الوجبات بـ 20 دقيقة (3 مرات يومياً)',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-41',
    name: 'Librax',
    nameAr: 'ليبراكس',
    generic: 'Chlordiazepoxide + Clidinium Bromide',
    category: 'IBS Antispasmodic',
    categoryAr: 'مهدئ ومضاد لتقلصات القولون والمعدة العصبية',
    defaultDosage: 'Tablet',
    dosages: ['أقراص'],
    defaultFrequency: 'قرص 3-4 مرات يومياً قبل الوجبات وقبل النوم',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-42',
    name: 'Duspatalin Retard',
    nameAr: 'ديسباتالين ريتارد',
    generic: 'Mebeverine HCl',
    category: 'Antispasmodic',
    categoryAr: 'مضاد لتقلصات واضطرابات القولون والمغص المعوي',
    defaultDosage: '200mg Retard',
    dosages: ['200mg Retard', '135mg'],
    defaultFrequency: 'كبسولة مرتين يومياً قبل الأكل بنصف ساعة',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-43',
    name: 'Spasmodigestin',
    nameAr: 'سبازموديجستين',
    generic: 'Digestive Enzymes + Antispasmodic',
    category: 'Digestive & Antiflatulent',
    categoryAr: 'مهضم ومهدئ لتقلصات المعدة وطارد للغازات',
    defaultDosage: 'Tablet',
    dosages: ['أقراص'],
    defaultFrequency: 'قرص أثناء أو بعد الوجبات مباشرة',
    defaultTiming: 'with_meal'
  },
  {
    id: 'eg-med-44',
    name: 'Digestin',
    nameAr: 'ديجستين',
    generic: 'Papain + Sanzyme',
    category: 'Digestive Enzymes',
    categoryAr: 'مهضم ومساعد على الهضم في حالات عسر الهضم والامتلاء',
    defaultDosage: 'Tablet',
    dosages: ['أقراص', 'شراب'],
    defaultFrequency: 'قرص أثناء الوجبات 3 مرات يومياً',
    defaultTiming: 'with_meal'
  },

  // Cardiovascular & Hypertension (الضغط والقلب والسيولة)
  {
    id: 'eg-med-45',
    name: 'Concor',
    nameAr: 'كونكور',
    generic: 'Bisoprolol Fumarate',
    category: 'Beta Blocker',
    categoryAr: 'خافض لضغط الدم ومنظم لضربات القلب',
    defaultDosage: '5mg',
    dosages: ['2.5mg', '5mg', '10mg'],
    defaultFrequency: 'قرص واحد يومياً صباحاً',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-46',
    name: 'Concor Plus',
    nameAr: 'كونكور بلس',
    generic: 'Bisoprolol + Hydrochlorothiazide',
    category: 'Beta Blocker + Diuretic',
    categoryAr: 'علاج ارتفاع ضغط الدم المركب مع مدر بول',
    defaultDosage: '5/12.5mg',
    dosages: ['5/12.5mg', '10/25mg'],
    defaultFrequency: 'قرص واحد يومياً صباحاً',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-47',
    name: 'Bisocard',
    nameAr: 'بيسوكارد',
    generic: 'Bisoprolol',
    category: 'Beta Blocker',
    categoryAr: 'علاج ضغط الدم المرتفع',
    defaultDosage: '5mg',
    dosages: ['2.5mg', '5mg', '10mg'],
    defaultFrequency: 'قرص يومياً',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-48',
    name: 'Cozaar',
    nameAr: 'كوزار',
    generic: 'Losartan Potassium',
    category: 'ARB Antihypertensive',
    categoryAr: 'خافض لضغط الدم وحامي لوظائف الكلى',
    defaultDosage: '50mg',
    dosages: ['50mg', '100mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-49',
    name: 'Exforge',
    nameAr: 'إكسفوردج',
    generic: 'Amlodipine + Valsartan',
    category: 'Combined Antihypertensive',
    categoryAr: 'علاج ضغط الدم المرتفع ثنائي المفعول',
    defaultDosage: '5/160mg',
    dosages: ['5/160mg', '10/160mg', '10/320mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-50',
    name: 'Norvasc',
    nameAr: 'نورفاسك',
    generic: 'Amlodipine',
    category: 'Calcium Channel Blocker',
    categoryAr: 'خافض لضغط الدم وموسع للشرايين التاجية',
    defaultDosage: '5mg',
    dosages: ['5mg', '10mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-51',
    name: 'Lipitor',
    nameAr: 'ليبيتور',
    generic: 'Atorvastatin Calcium',
    category: 'Statin / Lipid Lowering',
    categoryAr: 'خافض للكوليسترول والدهون الثلاثية الضارة',
    defaultDosage: '20mg',
    dosages: ['10mg', '20mg', '40mg', '80mg'],
    defaultFrequency: 'قرص واحد يومياً مساءً قبل النوم',
    defaultTiming: 'bedtime'
  },
  {
    id: 'eg-med-52',
    name: 'Ator',
    nameAr: 'أتور',
    generic: 'Atorvastatin',
    category: 'Statin',
    categoryAr: 'خافض للكوليسترول والدهون',
    defaultDosage: '20mg',
    dosages: ['10mg', '20mg', '40mg'],
    defaultFrequency: 'قرص واحد مساءً',
    defaultTiming: 'bedtime'
  },
  {
    id: 'eg-med-53',
    name: 'Crestor',
    nameAr: 'كريستور',
    generic: 'Rosuvastatin',
    category: 'Statin',
    categoryAr: 'علاج ارتفاع دهون وكوليسترول الدم',
    defaultDosage: '10mg',
    dosages: ['10mg', '20mg', '5mg'],
    defaultFrequency: 'قرص واحد يومياً مساءً',
    defaultTiming: 'bedtime'
  },
  {
    id: 'eg-med-54',
    name: 'Aspirin Protect',
    nameAr: 'أسبيرين بروتكت',
    generic: 'Acetylsalicylic Acid (Low Dose)',
    category: 'Antiplatelet',
    categoryAr: 'سيولة الدم للوقاية من الجلطات القلبية والدماغية',
    defaultDosage: '100mg',
    dosages: ['100mg', '81mg', '75mg'],
    defaultFrequency: 'قرص واحد يومياً بعد الغداء',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-55',
    name: 'Plavix',
    nameAr: 'بلافيكس',
    generic: 'Clopidogrel',
    category: 'Antiplatelet',
    categoryAr: 'مضاد لتجمع الصفائح الدموية لمنع الجلطات',
    defaultDosage: '75mg',
    dosages: ['75mg'],
    defaultFrequency: 'قرص واحد يومياً',
    defaultTiming: 'after_meal'
  },

  // Diabetes (السكر والغدد)
  {
    id: 'eg-med-56',
    name: 'Glucophage',
    nameAr: 'جلوكوفاج',
    generic: 'Metformin HCl',
    category: 'Antidiabetic',
    categoryAr: 'منظم السكر في الدم وتحسين حساسية الأنسولين',
    defaultDosage: '1000mg',
    dosages: ['1000mg', '850mg', '500mg', '1000mg XR ممتد المفعول'],
    defaultFrequency: 'قرص مرتين يومياً مع أو بعد الأكل مباشرة',
    defaultTiming: 'with_meal'
  },
  {
    id: 'eg-med-57',
    name: 'Cidophage',
    nameAr: 'سيدوفاج',
    generic: 'Metformin',
    category: 'Antidiabetic',
    categoryAr: 'علاج السكر من النوع الثاني وضبط الوزن',
    defaultDosage: '850mg',
    dosages: ['850mg', '500mg', '1000mg'],
    defaultFrequency: 'قرص مرتين يومياً مع الأكل',
    defaultTiming: 'with_meal'
  },
  {
    id: 'eg-med-58',
    name: 'Amaryl',
    nameAr: 'أماريل',
    generic: 'Glimepiride',
    category: 'Sulfonylurea Antidiabetic',
    categoryAr: 'محفز لإفراز الأنسولين لمرضى السكر النوع الثاني',
    defaultDosage: '2mg',
    dosages: ['1mg', '2mg', '3mg', '4mg'],
    defaultFrequency: 'قرص واحد يومياً قبل الإفطار مباشرة',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-59',
    name: 'Janumet',
    nameAr: 'جانوميت',
    generic: 'Sitagliptin + Metformin',
    category: 'Combined Antidiabetic',
    categoryAr: 'علاج السكر المزدوج الذكي',
    defaultDosage: '50/1000mg',
    dosages: ['50/500mg', '50/1000mg', '50/850mg'],
    defaultFrequency: 'قرص مرتين يومياً مع الوجبات',
    defaultTiming: 'with_meal'
  },
  {
    id: 'eg-med-60',
    name: 'Jardiance',
    nameAr: 'جارديانس',
    generic: 'Empagliflozin',
    category: 'SGLT2 Inhibitor',
    categoryAr: 'علاج السكر وحماية عضلة القلب والكلى',
    defaultDosage: '10mg',
    dosages: ['10mg', '25mg'],
    defaultFrequency: 'قرص واحد صباحاً مع كوب ماء',
    defaultTiming: 'anytime'
  },

  // Respiratory & Cough & Allergies (التنفس والكحة والحساسية)
  {
    id: 'eg-med-61',
    name: 'Ventolin Inhaler',
    nameAr: 'بخاخ فنتولين',
    generic: 'Salbutamol',
    category: 'Bronchodilator',
    categoryAr: 'موسع للشعب الهوائية سريع المفعول للأزمات التنفسية',
    defaultDosage: '100mcg/dose',
    dosages: ['100mcg بخاخ (200 جرعة)', 'Syrup', 'Solution for Nebulizer'],
    defaultFrequency: 'بختين بالفم عند الشعور بضيق التنفس',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-62',
    name: 'Zyrtec',
    nameAr: 'زيرتك',
    generic: 'Cetirizine HCl',
    category: 'Antihistamine',
    categoryAr: 'مضاد للحساسية والرشح وحكة الجلد والجيوب الأنفية',
    defaultDosage: '10mg',
    dosages: ['10mg Tablets', 'Syrup', 'Oral Drops'],
    defaultFrequency: 'قرص واحد يومياً مساءً قبل النوم',
    defaultTiming: 'bedtime'
  },
  {
    id: 'eg-med-63',
    name: 'Telfast',
    nameAr: 'تلفاست',
    generic: 'Fexofenadine HCl',
    category: 'Non-Sedating Antihistamine',
    categoryAr: 'مضاد للحساسية والجيوب الأنفية لا يسبب النعاس',
    defaultDosage: '120mg',
    dosages: ['120mg', '180mg (للحساسية الشديدة)', '60mg', 'Syrup'],
    defaultFrequency: 'قرص واحد يومياً صباحاً',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-64',
    name: 'Toplexil',
    nameAr: 'توبلكسيل شراب',
    generic: 'Oxomemazine + Guaifenesin',
    category: 'Cough Sedative & Expectorant',
    categoryAr: 'علاج الكحة الجافة والكحة المصحوبة ببلغم ومهدئ للسعال',
    defaultDosage: 'Syrup',
    dosages: ['شراب 125 مل'],
    defaultFrequency: 'ملعقة كبيرة 3 مرات يومياً وقبل النوم',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-65',
    name: 'Fluimucil / Acetylcysteine',
    nameAr: 'أستيل سستايين فوار / فلويموسيل',
    generic: 'Acetylcysteine',
    category: 'Mucolytic',
    categoryAr: 'مذيب وطارد للبلغم ومضاد للأكسدة',
    defaultDosage: '600mg Effervescent',
    dosages: ['600mg فوار', '200mg أكياس فوارة'],
    defaultFrequency: 'كيس على نصف كوب ماء مرتين يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-66',
    name: 'Otrivin Adult Nasal Spray',
    nameAr: 'بخاخ أوترفين كبار',
    generic: 'Xylometazoline HCl',
    category: 'Nasal Decongestant',
    categoryAr: 'مزيل لاحتقان وانسداد الأنف والجيوب الأنفية',
    defaultDosage: '0.1% Spray',
    dosages: ['0.1% كبار', '0.05% أطفال'],
    defaultFrequency: 'بخة في كل فتحة أنف مرتين إلى 3 مرات يومياً (لمدة 5 أيام فقط)',
    defaultTiming: 'anytime'
  },

  // Neuro, Vitamins & Tonics (الأعصاب والمقويات والفيتامينات)
  {
    id: 'eg-med-67',
    name: 'Milga Advance',
    nameAr: 'ميلجا أدفانس',
    generic: 'Benfotiamine + B6 + B12',
    category: 'Neurotonic Vitamin B',
    categoryAr: 'مقوي للأعصاب وعلاج آلام والتهاب الأعصاب الطرفية',
    defaultDosage: 'Tablet',
    dosages: ['أقراص'],
    defaultFrequency: 'قرص واحد مرتين إلى 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-68',
    name: 'Neurobion',
    nameAr: 'نيوروبيون',
    generic: 'Vitamin B1 + B6 + B12',
    category: 'Neurotonic Vitamin B',
    categoryAr: 'علاج التهابات الأعصاب والأنيميا',
    defaultDosage: 'Ampoules',
    dosages: ['حقن عضل', 'أقراص'],
    defaultFrequency: 'حقنة عضل كل 3 أيام أو قرص يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-69',
    name: 'Feroglobin',
    nameAr: 'فيروجلوبين',
    generic: 'Iron + Zinc + B-Complex + Folic Acid',
    category: 'Iron & Blood Tonic',
    categoryAr: 'علاج الأنيميا ونقص الحديد والمقوي العام للجسم',
    defaultDosage: 'Capsules',
    dosages: ['كبسولات', 'شراب'],
    defaultFrequency: 'كبسولة واحدة يومياً بعد الوجبة الرئيسية',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-70',
    name: 'Sanso D3',
    nameAr: 'سانسو دي 3 (فيتامين د)',
    generic: 'Cholecalciferol (Vitamin D3)',
    category: 'Vitamin D Supplement',
    categoryAr: 'علاج نقص فيتامين د وتقوية العظام والمناعة',
    defaultDosage: '10,000 IU',
    dosages: ['10,000 IU', '50,000 IU أسبوعياً', '1000 IU'],
    defaultFrequency: 'قرص واحد أسبوعياً أو يومياً حسب التركيز بعد وجبة دسمة',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-71',
    name: 'Omega 3 Plus',
    nameAr: 'أوميجا 3 بلس',
    generic: 'Fish Oil (EPA + DHA) + Wheat Germ Oil',
    category: 'Nutritional Supplement',
    categoryAr: 'صحة القلب والمخ والذاكرة وخفض الدهون',
    defaultDosage: '1000mg',
    dosages: ['كبسولات جيلاتينية'],
    defaultFrequency: 'كبسولة واحدة يومياً بعد الغداء',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-72',
    name: 'Betaserc',
    nameAr: 'بيتاسيرك لدوار الأذن والدوخة',
    generic: 'Betahistine Dihydrochloride',
    category: 'Antivertigo',
    categoryAr: 'علاج الدوخة والدوار وطنين الأذن وضعف التوازن',
    defaultDosage: '16mg',
    dosages: ['16mg', '24mg', '8mg'],
    defaultFrequency: 'قرص مرتين إلى 3 مرات يومياً مع الوجبات',
    defaultTiming: 'with_meal'
  },
  {
    id: 'eg-med-73',
    name: 'Stugeron',
    nameAr: 'ستوجيرون',
    generic: 'Cinnarizine',
    category: 'Vasodilator / Antivertigo',
    categoryAr: 'علاج دوار الحركة والدوخة وتنشيط الدورة الدموية المخية',
    defaultDosage: '25mg',
    dosages: ['25mg', '75mg Forte'],
    defaultFrequency: 'قرص 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-74',
    name: 'Daflon 500',
    nameAr: 'دافلون 500 للبواسير والأوردة',
    generic: 'Purified Flavonoid Fraction (Diosmin + Hesperidin)',
    category: 'Phlebotropic',
    categoryAr: 'علاج البواسير الشديدة ودوالي الساقين ونزيف الأوردة',
    defaultDosage: '500mg',
    dosages: ['500mg', '1000mg'],
    defaultFrequency: 'قرصين يومياً بعد الغداء والعشاء',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-75',
    name: 'Reparil Dragees',
    nameAr: 'ريباريل أقراص للتورم',
    generic: 'Aescin (Escin) 40mg',
    category: 'Anti-edema & Anti-inflammatory',
    categoryAr: 'علاج التورم والارتشاح ودوالي الساقين والبواسير والرضوض',
    defaultDosage: '40mg Dragees',
    dosages: ['40mg', '20mg'],
    defaultFrequency: 'قرصين 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-76',
    name: 'Kenacomb Cream / Ointment',
    nameAr: 'كيناكورم كريم / مرهم',
    generic: 'Triamcinolone + Neomycin + Gramicidin + Nystatin',
    category: 'Topical Steroid / Antibacterial / Antifungal',
    categoryAr: 'علاج التهابات الجلد والتسلخات الشديدة والإكزيما',
    defaultDosage: 'Cream / Ointment 15g / 30g',
    dosages: ['كريم', 'مرهم'],
    defaultFrequency: 'دهان موضعي على المكان المصاب مرتين إلى 3 مرات يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-77',
    name: 'Fucidin Cream / Ointment',
    nameAr: 'فيوسيدين كريم (الخط الأحمر/البرتقالي)',
    generic: 'Fusidic Acid / Sodium Fusidate',
    category: 'Topical Antibiotic',
    categoryAr: 'مضاد حيوي موضعي للدمامل وحب الشباب والجروح والعدوى الجلدية',
    defaultDosage: '2% Cream / Ointment',
    dosages: ['كريم (خط أحمر)', 'مرهم (خط برتقالي)'],
    defaultFrequency: 'دهان مرتين إلى 3 مرات يومياً بعد تنظيف المكان',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-78',
    name: 'Fucicort Cream',
    nameAr: 'فيوسيكورت كريم (الخط البرتقالي والأحمر)',
    generic: 'Fusidic Acid + Betamethasone',
    category: 'Topical Antibiotic + Corticosteroid',
    categoryAr: 'علاج الإكزيما والتهابات الجلد التحسسية واللدغات',
    defaultDosage: 'Cream 15g / 30g',
    dosages: ['كريم 15 جم', 'كريم 30 جم'],
    defaultFrequency: 'دهان طبقة رقيقة مرتين يومياً لمدة أسبوع فقط',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-79',
    name: 'Betaderm Cream / Ointment',
    nameAr: 'بيتاديرم كريم / مرهم',
    generic: 'Betamethasone Valerate 0.1%',
    category: 'Topical Corticosteroid',
    categoryAr: 'علاج الحكة الشديدة والصدفية والإكزيما والتحسس الجلدي',
    defaultDosage: '0.1% Cream / Ointment',
    dosages: ['كريم', 'مرهم'],
    defaultFrequency: 'دهان موضعي مرة إلى مرتين يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-80',
    name: 'Mebo Ointment',
    nameAr: 'ميبو مرهم حروق',
    generic: 'Beta-Sitosterol + Sesame Oil + Beeswax',
    category: 'Burns & Wound Healing',
    categoryAr: 'علاج الحروق بمختلف درجاتها وترميم وتجديد خلايا الجلد والجروح',
    defaultDosage: 'Ointment 15g / 30g / 75g',
    dosages: ['مرهم 15 جم', 'مرهم 30 جم', 'مرهم 75 جم'],
    defaultFrequency: 'وضع طبقة رقيقة على الحرق كل 4 إلى 6 ساعات',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-81',
    name: 'Panthenol Cream',
    nameAr: 'بانثينول كريم مرطب وملطف',
    generic: 'D-Panthenol (Pro-Vitamin B5)',
    category: 'Moisturizer & Skin Repair',
    categoryAr: 'ترطيب وتنعيم الجلد الجاف والتئام التشققات وتسلخات الحفاض',
    defaultDosage: 'Cream 20g / 50g',
    dosages: ['كريم 20 جم', 'كريم 50 جم'],
    defaultFrequency: 'دهان مرتين إلى 3 مرات يومياً عند الحاجة',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-82',
    name: 'Voltaren Emulgel',
    nameAr: 'فولتارين إيمولجيل موضعي',
    generic: 'Diclofenac Diethylamine',
    category: 'Topical NSAID Analgesic',
    categoryAr: 'مسكن ومضاد لالتهاب العضلات والمفاصل والكدمات والالتواء',
    defaultDosage: 'Gel 50g / 100g',
    dosages: ['جل 50 جم', 'جل 100 جم', 'فولتارين إكسترا فورت'],
    defaultFrequency: 'تدليك مكان الألم برفق من 3 إلى 4 مرات يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-83',
    name: 'Reparil-Gel N',
    nameAr: 'ريباريل جل للكدمات والورم',
    generic: 'Aescin + Diethylamine Salicylate',
    category: 'Anti-inflammatory & Anti-edema Gel',
    categoryAr: 'إزالة التورم والكدمات وتجمعات الدم والالتواءات وآلام الظهر',
    defaultDosage: 'Gel 40g',
    dosages: ['جل 40 جم'],
    defaultFrequency: 'دهان وتدليك لطيف على الكدمة أو الورم 3 مرات يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-84',
    name: 'Tobradex Eye Drops',
    nameAr: 'توبزادكس قطرة عين',
    generic: 'Tobramycin + Dexamethasone',
    category: 'Ophthalmic Antibiotic + Steroid',
    categoryAr: 'علاج التهابات العين المصحوبة بعدوى بكتيرية',
    defaultDosage: 'Eye Drops 5ml',
    dosages: ['قطرة عين 5 مل', 'مرهم عين'],
    defaultFrequency: 'نقطة واحدة في العين المصابة كل 4 إلى 6 ساعات',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-85',
    name: 'Systane Ultra Eye Drops',
    nameAr: 'سيستان ألترا قطرة ترطيب العين',
    generic: 'Polyethylene Glycol + Propylene Glycol',
    category: 'Lubricant Eye Drops',
    categoryAr: 'ترطيب وحماية العين من الجفاف والإجهاد واحمرار الشاشات',
    defaultDosage: 'Eye Drops 10ml',
    dosages: ['قطرة 10 مل'],
    defaultFrequency: 'نقطة في كل عين عند اللزوم',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-86',
    name: 'Otal Ear Drops',
    nameAr: 'أوتال قطرة أذن',
    generic: 'Framycetin + Dexamethasone + Cinchocaine',
    category: 'Otic Drops',
    categoryAr: 'مسكن لآلام الأذن وعلاج التهاب الأذن الخارجية والوسطى',
    defaultDosage: 'Ear Drops 10ml',
    dosages: ['قطرة أذن'],
    defaultFrequency: '3 إلى 4 نقط في الأذن المصابة 3 مرات يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-87',
    name: 'Viotic Ear Drops',
    nameAr: 'فيوتيك قطرة أذن',
    generic: 'Fludrocortisone + Polymyxin B + Neomycin + Lidocaine',
    category: 'Otic Drops',
    categoryAr: 'مضاد لالتهاب والآم الأذن والفطريات',
    defaultDosage: 'Ear Drops 10ml',
    dosages: ['قطرة 10 مل'],
    defaultFrequency: '3 نقط مرتين يومياً',
    defaultTiming: 'anytime'
  },
  {
    id: 'eg-med-88',
    name: 'Alzental',
    nameAr: 'الزنتال لطرد الديدان',
    generic: 'Albendazole',
    category: 'Anthelmintic',
    categoryAr: 'علاج الديدان المعوية والدبوسية والشريطية',
    defaultDosage: '200mg',
    dosages: ['200mg أقراص مضغ', 'شراب الزنتال'],
    defaultFrequency: 'قرصين للمضغ جرعة واحدة وتكرر بعد أسبوعين',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-89',
    name: 'Vermizole',
    nameAr: 'فيرميزول',
    generic: 'Mebendazole',
    category: 'Anthelmintic',
    categoryAr: 'طارد لديدان البطن',
    defaultDosage: '100mg',
    dosages: ['100mg أقراص', 'شراب'],
    defaultFrequency: 'قرص صباحاً ومساءً لمدة 3 أيام',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-90',
    name: 'Motinorm',
    nameAr: 'موتينورم',
    generic: 'Domperidone',
    category: 'Antiemetic',
    categoryAr: 'منظم للمعدة ومانع للقيء والغثيان',
    defaultDosage: '10mg',
    dosages: ['10mg', 'شراب'],
    defaultFrequency: 'قرص قبل الأكل بـ 15 دقيقة',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-91',
    name: 'Cipralex',
    nameAr: 'سيبرالكس',
    generic: 'Escitalopram',
    category: 'SSRI Antidepressant',
    categoryAr: 'علاج القلق والاكتئاب والهلع ونوبات التوتر والوسواس',
    defaultDosage: '10mg',
    dosages: ['10mg', '20mg'],
    defaultFrequency: 'قرص واحد يومياً في نفس الموعد صباحاً أو مساءً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-92',
    name: 'Deanxit',
    nameAr: 'ديانكسيت',
    generic: 'Flupentixol + Melitracen',
    category: 'Anxiolytic',
    categoryAr: 'علاج القلق والتوتر العصبي والقولون العصبي النفسي',
    defaultDosage: 'Sugar-Coated Tablet',
    dosages: ['أقراص مغلفة'],
    defaultFrequency: 'قرص صباحاً وظهراً قبل الأكل',
    defaultTiming: 'before_meal'
  },
  {
    id: 'eg-med-93',
    name: 'Doliprane',
    nameAr: 'دوليبران',
    generic: 'Paracetamol 1000mg (1g)',
    category: 'Analgesic',
    categoryAr: 'مسكن قوي وخافض حرارة تركيز 1000 ملجم',
    defaultDosage: '1000mg',
    dosages: ['1000mg أقراص', '500mg', 'أكياس فوارة'],
    defaultFrequency: 'قرص كل 8 ساعات بعد الأكل عند اللزوم',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-94',
    name: 'Novaldol',
    nameAr: 'نوفالدول 1000',
    generic: 'Paracetamol 1000mg',
    category: 'Analgesic',
    categoryAr: 'مسكن آمن للصداع وآلام الجسم تركيز 1 جرام',
    defaultDosage: '1000mg',
    dosages: ['1000mg أقراص'],
    defaultFrequency: 'قرص عند اللزوم كل 6 إلى 8 ساعات',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-95',
    name: 'Movalis',
    nameAr: 'موفاليس',
    generic: 'Meloxicam',
    category: 'NSAID',
    categoryAr: 'مسكن لالتهاب المفاصل والروماتويد والفقرات',
    defaultDosage: '15mg',
    dosages: ['15mg', '7.5mg', '15mg أمبولات عضل'],
    defaultFrequency: 'قرص واحد يومياً بعد وجبة الغداء',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-96',
    name: 'Arcoxia',
    nameAr: 'أركوكسيا',
    generic: 'Etoricoxib',
    category: 'COX-2 Selective NSAID',
    categoryAr: 'مسكن سريع ومضاد للالتهاب لآلام النقرس والمفاصل والأسنان',
    defaultDosage: '90mg',
    dosages: ['60mg', '90mg', '120mg'],
    defaultFrequency: 'قرص واحد يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-97',
    name: 'Xefo',
    nameAr: 'زيفو',
    generic: 'Lornoxicam',
    category: 'Potent NSAID',
    categoryAr: 'مسكن قوي لآلام العمود الفقري وجراحات العظام والأسنان',
    defaultDosage: '8mg',
    dosages: ['8mg أقراص', '8mg حقن عضل/وريد'],
    defaultFrequency: 'قرص كل 12 ساعة بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-98',
    name: 'Mucosolvan',
    nameAr: 'ميوكوسولفان',
    generic: 'Ambroxol',
    category: 'Mucolytic',
    categoryAr: 'مذيب للبلغم وتحسين التنفس',
    defaultDosage: '30mg / 15mg',
    dosages: ['شراب', 'أقراص 30mg', 'نقط'],
    defaultFrequency: 'ملعقة كبيرة 3 مرات يومياً بعد الأكل',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-99',
    name: 'Bisolvon',
    nameAr: 'بيسولفون',
    generic: 'Bromhexine HCl',
    category: 'Mucolytic',
    categoryAr: 'طارد ومذيب للإفرازات المخاطية التنفسية',
    defaultDosage: '8mg Tablet / Syrup',
    dosages: ['أقراص 8mg', 'شراب 4mg/5ml', 'نقط'],
    defaultFrequency: 'قرص 3 مرات يومياً',
    defaultTiming: 'after_meal'
  },
  {
    id: 'eg-med-100',
    name: 'Claritine',
    nameAr: 'كلاريتين',
    generic: 'Loratadine',
    category: 'Antihistamine',
    categoryAr: 'مضاد للحساسية والرشح لا يسبب النعاس',
    defaultDosage: '10mg',
    dosages: ['10mg أقراص', 'شراب'],
    defaultFrequency: 'قرص واحد يومياً صباحاً',
    defaultTiming: 'anytime'
  }
];

/**
 * Fast search helper for autocomplete matching both English and Arabic
 */
export function searchEgyptianMedications(query: string, limit: number = 15): EgyptianMedication[] {
  const q = (query || '').trim();
  if (!q || q.length < 1) return [];

  // Normalize Arabic letters and remove diacritics
  const normalize = (str: string): string =>
    str
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/[\u064B-\u065F\u0640]/g, '') // Remove tashkeel and tatweel
      .replace(/[-_]/g, ' ')
      .trim();

  const normQ = normalize(q);
  const qWords = normQ.split(/\s+/).filter(Boolean);

  const matched = EGYPTIAN_MEDICATIONS.filter((med) => {
    const normName = normalize(med.name);
    const normAr = normalize(med.nameAr);
    const normGeneric = normalize(med.generic);
    const normCat = normalize(med.categoryAr + ' ' + med.category);
    const combined = `${normName} ${normAr} ${normGeneric} ${normCat}`;

    // Direct match on commercial or Arabic name or generic
    if (normName.includes(normQ) || normAr.includes(normQ) || normGeneric.includes(normQ)) {
      return true;
    }

    // Multi-word matching
    return qWords.length > 0 && qWords.every((word) => combined.includes(word));
  });

  // Sort: exact/prefix matches first
  return matched.sort((a, b) => {
    const aStarts = normalize(a.name).startsWith(normQ) || normalize(a.nameAr).startsWith(normQ);
    const bStarts = normalize(b.name).startsWith(normQ) || normalize(b.nameAr).startsWith(normQ);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return 0;
  }).slice(0, limit);
}
