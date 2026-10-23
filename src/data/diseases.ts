import { DiseaseCandidateRef, DiseaseContext } from '../types';

export interface DiseaseDefinition {
  id: string;
  name: string;
  synonyms: string[];
  category: 'Oncology' | 'Cardiovascular' | 'Metabolic' | 'Neurology' | 'Immunology' | 'Infectious Disease' | 'Psychiatry' | 'Respiratory' | 'Gastroenterology';
  targetName: string;
  targetGene?: string;
  uniprotId?: string;
  indication: string;
  description: string;
  primaryCompound: string;
  primaryCid: number;
  candidates: DiseaseCandidateRef[];
}

export const POPULAR_DISEASES: DiseaseDefinition[] = [
  {
    id: 'lung-cancer',
    name: 'Non-Small Cell Lung Cancer (NSCLC)',
    synonyms: [
      'lung cancer',
      'nsclc',
      'lung adenocarcinoma',
      'lung squamous cell carcinoma',
      'egfr lung cancer',
      'non small cell lung cancer',
      'lung carcinoma',
      'pulmonary neoplasm',
      'bronchogenic carcinoma'
    ],
    category: 'Oncology',
    targetName: 'Epidermal Growth Factor Receptor (EGFR Tyrosine Kinase)',
    targetGene: 'EGFR',
    uniprotId: 'P00533',
    indication: 'First-line & resistance management in EGFR mutation-positive (Exon 19 del, L858R, T790M) advanced NSCLC',
    description: 'EGFR kinase hyperactivation drives oncogenic signaling through MAPK and PI3K/Akt pathways in 15-50% of NSCLC cases. Targeted tyrosine kinase inhibitors bind the ATP-binding cleft to suppress receptor phosphorylation and trigger apoptosis.',
    primaryCompound: 'Osimertinib',
    primaryCid: 71496458,
    candidates: [
      {
        name: 'Osimertinib',
        cid: 71496458,
        role: '3rd Gen Irreversible Covalent EGFR TKI',
        stage: 'FDA Approved (First-Line Standard of Care)',
        indicationNote: 'Selectively targets sensitizing mutations and T790M resistance gatekeeper'
      },
      {
        name: 'Gefitinib',
        cid: 123631,
        role: '1st Gen Reversible ATP-Competitive EGFR TKI',
        stage: 'FDA Approved',
        indicationNote: 'First-in-class quinazoline inhibitor for Exon 19 del and L858R'
      },
      {
        name: 'Erlotinib',
        cid: 176870,
        role: '1st Gen Quinazoline EGFR Inhibitor',
        stage: 'FDA Approved',
        indicationNote: 'Reversible binding to ATP cleft of kinase domain'
      },
      {
        name: 'Afatinib',
        cid: 24776445,
        role: '2nd Gen Irreversible Pan-HER Inhibitor',
        stage: 'FDA Approved',
        indicationNote: 'Covalently targets Cys797 in EGFR, HER2, and HER4'
      }
    ]
  },
  {
    id: 'hypertension',
    name: 'Essential Hypertension (High Blood Pressure)',
    synonyms: [
      'hypertension',
      'high blood pressure',
      'elevated blood pressure',
      'arterial hypertension',
      'bp',
      'hypertensive vascular disease'
    ],
    category: 'Cardiovascular',
    targetName: 'L-Type Voltage-Gated Calcium Channels (Cav1.2) & Angiotensin System',
    targetGene: 'CACNA1C / ACE',
    uniprotId: 'Q13936',
    indication: 'Management of systemic arterial hypertension, angina pectoris, and stroke prevention',
    description: 'Arterial hypertension is a principal etiology for myocardial infarction, heart failure, and chronic renal disease. Dihydropyridine calcium channel blockers inhibit transmembrane influx of extracellular calcium into vascular smooth muscle, provoking peripheral arterial vasodilation.',
    primaryCompound: 'Amlodipine',
    primaryCid: 2162,
    candidates: [
      {
        name: 'Amlodipine',
        cid: 2162,
        role: 'Long-Acting Dihydropyridine Calcium Channel Blocker (CCB)',
        stage: 'FDA Approved (First-Line)',
        indicationNote: 'Inhibits L-type calcium channels causing potent arterial vasodilation'
      },
      {
        name: 'Atorvastatin',
        cid: 60823,
        role: 'HMG-CoA Reductase Inhibitor & Vasoprotective',
        stage: 'FDA Approved',
        indicationNote: 'Cardiovascular risk reduction and endothelial plaque stabilization'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Antiplatelet & COX-1 Inhibitor',
        stage: 'FDA Approved',
        indicationNote: 'Secondary arterial thromboprophylaxis in hypertensive cohorts'
      }
    ]
  },
  {
    id: 'type-2-diabetes',
    name: 'Type 2 Diabetes Mellitus (T2D)',
    synonyms: [
      'diabetes',
      'type 2 diabetes',
      'type ii diabetes',
      't2d',
      'hyperglycemia',
      'insulin resistance',
      'diabetic nephropathy',
      'non insulin dependent diabetes'
    ],
    category: 'Metabolic',
    targetName: 'AMP-Activated Protein Kinase (AMPK) & Mitochondrial Complex I',
    targetGene: 'PRKAA1 / SLC2A4',
    uniprotId: 'Q13131',
    indication: 'Glycemic control in adult and pediatric patients with type 2 diabetes mellitus',
    description: 'Type 2 diabetes involves progressive pancreatic beta-cell dysfunction combined with peripheral insulin resistance. Biguanides such as Metformin suppress hepatic gluconeogenesis via mitochondrial respiratory chain complex I inhibition and activate cellular AMPK signaling.',
    primaryCompound: 'Metformin',
    primaryCid: 4091,
    candidates: [
      {
        name: 'Metformin',
        cid: 4091,
        role: 'Biguanide Antihyperglycemic Agent',
        stage: 'FDA Approved (First-Line Gold Standard)',
        indicationNote: 'Inhibits hepatic gluconeogenesis and stimulates peripheral glucose uptake'
      },
      {
        name: 'Atorvastatin',
        cid: 60823,
        role: 'Cardiovascular Risk Prevention in Diabetics',
        stage: 'FDA Approved',
        indicationNote: 'Recommended primary prevention of diabetic dyslipidemia'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Vascular Thromboprophylaxis',
        stage: 'FDA Approved',
        indicationNote: 'Prevention of atherothrombotic events in high-risk diabetic patients'
      }
    ]
  },
  {
    id: 'cardiovascular-dyslipidemia',
    name: 'Cardiovascular Disease & Dyslipidemia',
    synonyms: [
      'cardiovascular disease',
      'cvd',
      'hypercholesterolemia',
      'high cholesterol',
      'dyslipidemia',
      'atherosclerosis',
      'coronary artery disease',
      'cad',
      'hyperlipidemia',
      'statin therapy'
    ],
    category: 'Cardiovascular',
    targetName: '3-Hydroxy-3-Methylglutaryl-CoA (HMG-CoA) Reductase',
    targetGene: 'HMGCR',
    uniprotId: 'P04035',
    indication: 'Primary and secondary prevention of myocardial infarction, stroke, and revascularization',
    description: 'Elevated low-density lipoprotein cholesterol (LDL-C) is causally linked to atherosclerotic plaque progression. HMG-CoA reductase inhibitors competitively block the rate-limiting enzyme in cholesterol biosynthesis, upregulating hepatic LDL receptors and clearance of circulating apolipoprotein B particles.',
    primaryCompound: 'Atorvastatin',
    primaryCid: 60823,
    candidates: [
      {
        name: 'Atorvastatin',
        cid: 60823,
        role: 'Synthetic Statin (HMG-CoA Reductase Inhibitor)',
        stage: 'FDA Approved (High-Intensity Standard)',
        indicationNote: 'Potent competitive inhibition of hepatic cholesterol biosynthesis'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Antiplatelet COX-1 Inhibitor',
        stage: 'FDA Approved',
        indicationNote: 'Prevents arterial thrombosis in coronary and cerebrovascular disease'
      },
      {
        name: 'Amlodipine',
        cid: 2162,
        role: 'Calcium Channel Blocker',
        stage: 'FDA Approved',
        indicationNote: 'Vasodilation and cardiac afterload reduction in ischemic coronary disease'
      }
    ]
  },
  {
    id: 'pain-inflammation',
    name: 'Acute & Chronic Pain, Inflammation & Arthritis',
    synonyms: [
      'pain',
      'inflammation',
      'arthritis',
      'osteoarthritis',
      'rheumatoid arthritis',
      'analgesic',
      'joint pain',
      'inflammatory pain',
      'musculoskeletal pain',
      'dysmenorrhea'
    ],
    category: 'Immunology',
    targetName: 'Cyclooxygenase-1 & Cyclooxygenase-2 (COX-1 / COX-2)',
    targetGene: 'PTGS1 / PTGS2',
    uniprotId: 'P23219 / P35354',
    indication: 'Relief of mild to moderate pain, inflammation, swelling, and arthritic joint tenderness',
    description: 'Prostaglandins synthesized via the arachidonic acid cascade mediate peripheral nociceptor sensitization and vascular inflammation. Non-steroidal anti-inflammatory drugs (NSAIDs) competitively inhibit cyclooxygenase enzymes, abolishing pro-inflammatory PGE2 and PGF2α production.',
    primaryCompound: 'Ibuprofen',
    primaryCid: 3672,
    candidates: [
      {
        name: 'Ibuprofen',
        cid: 3672,
        role: 'Reversible Non-Selective COX-1/COX-2 NSAID',
        stage: 'FDA Approved (OTC & Rx)',
        indicationNote: 'Propionic acid derivative for inflammatory analgesia and swelling'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Irreversible Serine-Acetylation COX Inhibitor',
        stage: 'FDA Approved',
        indicationNote: 'Covalent inhibitor of prostaglandin synthase and anti-inflammatory'
      },
      {
        name: 'Acetaminophen',
        cid: 1983,
        role: 'Centrally Acting Non-Opioid Analgesic',
        stage: 'FDA Approved',
        indicationNote: 'Inhibits peroxidase step of central COX enzymes with high gastric safety'
      }
    ]
  },
  {
    id: 'fever-pyrexia',
    name: 'Fever & Pyrexia',
    synonyms: [
      'fever',
      'pyrexia',
      'febrile state',
      'elevated temperature',
      'antipyretic'
    ],
    category: 'Immunology',
    targetName: 'Hypothalamic Thermoregulatory Center & Cyclooxygenase Enzymes',
    targetGene: 'PTGS1 / PTGS2',
    uniprotId: 'P23219',
    indication: 'Reduction of elevated core body temperature induced by microbial pyrogens and cytokines',
    description: 'Endogenous pyrogens (IL-1, TNF-alpha, IL-6) stimulate prostaglandin E2 (PGE2) synthesis within the preoptic area of the anterior hypothalamus, resetting the thermal set-point. Antipyretic agents suppress PGE2 generation to restore physiological normothermia.',
    primaryCompound: 'Acetaminophen',
    primaryCid: 1983,
    candidates: [
      {
        name: 'Acetaminophen',
        cid: 1983,
        role: 'First-Line Antipyretic Analgesic',
        stage: 'FDA Approved (First-Line Antipyretic)',
        indicationNote: 'Optimal pediatric and adult safety profile without Reye syndrome risk'
      },
      {
        name: 'Ibuprofen',
        cid: 3672,
        role: 'Potent Antipyretic NSAID',
        stage: 'FDA Approved',
        indicationNote: 'Rapid-onset antipyretic action via peripheral and central COX inhibition'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Classic Salicylate Antipyretic',
        stage: 'FDA Approved',
        indicationNote: 'Covalent prostaglandin synthesis suppression'
      }
    ]
  },
  {
    id: 'alzheimers-disease',
    name: "Alzheimer's Disease & Cognitive Dementia",
    synonyms: [
      'alzheimer',
      "alzheimer's",
      "alzheimer's disease",
      'ad',
      'dementia',
      'cognitive impairment',
      'memory loss',
      'cholinergic deficit',
      'neurodegeneration'
    ],
    category: 'Neurology',
    targetName: 'Acetylcholinesterase (AChE) & NMDA Glutamate Receptors',
    targetGene: 'ACHE / GRIN1',
    uniprotId: 'P22303',
    indication: 'Symptomatic treatment of mild, moderate, and severe dementia of the Alzheimer type',
    description: "Alzheimer's disease features loss of cholinergic basal forebrain neurons, leading to deficits in central neurotransmission. Reversible acetylcholinesterase inhibitors impede acetylcholine hydrolysis in synaptic clefts, enhancing cholinergic neurotransmission and stabilizing cognitive faculties.",
    primaryCompound: 'Donepezil',
    primaryCid: 3152,
    candidates: [
      {
        name: 'Donepezil',
        cid: 3152,
        role: 'Reversible Piperidine Acetylcholinesterase Inhibitor',
        stage: 'FDA Approved (First-Line)',
        indicationNote: 'High specificity for central AChE with 70-hour terminal half-life'
      },
      {
        name: 'Caffeine',
        cid: 2519,
        role: 'Adenosine A2A Antagonist & Neuroprotective',
        stage: 'Investigational / Dietary',
        indicationNote: 'Inhibits neuroinflammation and amyloid-beta aggregation in models'
      },
      {
        name: 'Dopamine',
        cid: 681,
        role: 'Monoaminergic Neurotransmitter Modulator',
        stage: 'Endogenous Benchmark',
        indicationNote: 'Explored in cortico-striatal reward and behavioral dementia symptoms'
      }
    ]
  },
  {
    id: 'depression',
    name: 'Major Depressive Disorder (MDD) & Anxiety',
    synonyms: [
      'depression',
      'major depressive disorder',
      'mdd',
      'depressive disorder',
      'clinical depression',
      'unipolar depression',
      'ssri',
      'dysthymia'
    ],
    category: 'Psychiatry',
    targetName: 'Serotonin Transporter (SERT / 5-HTT / SLC6A4)',
    targetGene: 'SLC6A4',
    uniprotId: 'P31645',
    indication: 'Acute and maintenance therapy of major depressive disorder, panic disorder, OCD, and bulimia',
    description: 'Monoaminergic hypothesis of depression posits inadequate synaptic serotonin (5-HT) and norepinephrine transmission in limbic circuits. Selective serotonin reuptake inhibitors (SSRIs) block SERT transporter proteins, raising extracellular serotonin concentrations and promoting neuroplastic BDNF expression.',
    primaryCompound: 'Fluoxetine',
    primaryCid: 3386,
    candidates: [
      {
        name: 'Fluoxetine',
        cid: 3386,
        role: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
        stage: 'FDA Approved (First-Line Standard)',
        indicationNote: 'High selectivity for SERT; active metabolite norfluoxetine sustains efficacy'
      },
      {
        name: 'Dopamine',
        cid: 681,
        role: 'Mesolimbic Reward Neurotransmitter',
        stage: 'Endogenous Benchmark',
        indicationNote: 'Key biomarker in anhedonia and motivational deficits of severe MDD'
      },
      {
        name: 'Caffeine',
        cid: 2519,
        role: 'Central Psychostimulant & A2A Antagonist',
        stage: 'Adjunctive',
        indicationNote: 'Modulates dopaminergic alertness and psychomotor energy'
      }
    ]
  },
  {
    id: 'parkinsons-disease',
    name: "Parkinson's Disease & Movement Disorders",
    synonyms: [
      'parkinson',
      "parkinson's",
      "parkinson's disease",
      'pd',
      'parkinsonism',
      'motor tremor',
      'substantia nigra',
      'dopaminergic degeneration'
    ],
    category: 'Neurology',
    targetName: 'Dopamine D2 / D3 Receptors & Dopamine Transporter (DAT)',
    targetGene: 'DRD2 / SLC6A3',
    uniprotId: 'P14416',
    indication: 'Idiopathic Parkinson disease, postencephalitic parkinsonism, and symptomatic tremor/bradykinesia',
    description: "Selective degeneration of neuromelanin-containing dopaminergic neurons in the substantia nigra pars compacta creates dopamine depletion in the striatum. Therapeutic strategies utilize dopamine precursors, receptor agonists, and metabolic inhibitors to restore striatal dopaminergic tone.",
    primaryCompound: 'Dopamine',
    primaryCid: 681,
    candidates: [
      {
        name: 'Dopamine',
        cid: 681,
        role: 'Endogenous Catecholamine Neurotransmitter',
        stage: 'Endogenous Benchmark / Emergency Inotrope',
        indicationNote: 'Core neurotransmitter deficient in nigrostriatal parkinsonian pathways'
      },
      {
        name: 'Caffeine',
        cid: 2519,
        role: 'Adenosine A2A Receptor Antagonist',
        stage: 'Epidemiological / Neuroprotective',
        indicationNote: 'Antagonism of striatal A2A receptors potentiates D2 receptor responsiveness'
      }
    ]
  },
  {
    id: 'covid-19',
    name: 'COVID-19 & Viral Respiratory Infections',
    synonyms: [
      'covid',
      'covid-19',
      'sars-cov-2',
      'coronavirus',
      'viral pneumonia',
      'respiratory viral infection',
      'rdrp'
    ],
    category: 'Infectious Disease',
    targetName: 'SARS-CoV-2 RNA-Dependent RNA Polymerase (RdRp / nsp12)',
    targetGene: 'nsp12',
    uniprotId: 'P0DTD1',
    indication: 'Treatment of COVID-19 in hospitalized and high-risk ambulatory patients',
    description: 'Coronaviruses depend on viral RNA-dependent RNA polymerase (nsp12-nsp7-nsp8 complex) for genome replication and subgenomic transcription. Nucleotide analog prodrugs incorporate into nascent viral RNA chains, inducing delayed chain termination at position i+3 and lethal viral mutagenesis.',
    primaryCompound: 'Remdesivir',
    primaryCid: 121304016,
    candidates: [
      {
        name: 'Remdesivir',
        cid: 121304016,
        role: 'Monophosphoramidate Adenosine Nucleotide Prodrug',
        stage: 'FDA Approved',
        indicationNote: 'Delayed chain termination against viral RNA polymerase nsp12'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Immunothrombosis & Antiplatelet Adjunct',
        stage: 'Clinical Adjunct',
        indicationNote: 'Mitigates microvascular pulmonary thrombosis in severe COVID-19'
      },
      {
        name: 'Acetaminophen',
        cid: 1983,
        role: 'Antipyretic Symptom Management',
        stage: 'Standard Symptomatic Care',
        indicationNote: 'First-line management of viral pyrexia and myalgia'
      }
    ]
  },
  {
    id: 'leukemia-cml',
    name: 'Chronic Myelogenous Leukemia (CML)',
    synonyms: [
      'leukemia',
      'cml',
      'chronic myelogenous leukemia',
      'chronic myeloid leukemia',
      'bcr-abl',
      'philadelphia chromosome',
      'blood cancer',
      'myeloid leukemia'
    ],
    category: 'Oncology',
    targetName: 'BCR-ABL1 Fusion Tyrosine Kinase',
    targetGene: 'BCR-ABL1',
    uniprotId: 'P00519',
    indication: 'Philadelphia chromosome-positive (Ph+) chronic myelogenous leukemia and Ph+ ALL',
    description: 'The reciprocal t(9;22)(q34;q11) chromosomal translocation generates the chimeric BCR-ABL1 oncogene, encoding a constitutively active cytoplasmic tyrosine kinase. Small-molecule BCR-ABL inhibitors occupy the ATP-binding pocket of the inactive kinase conformation, inducing cytogenetic remissions.',
    primaryCompound: 'Imatinib',
    primaryCid: 5291,
    candidates: [
      {
        name: 'Imatinib',
        cid: 5291,
        role: '1st Gen Competitive BCR-ABL / c-KIT / PDGFR TKI',
        stage: 'FDA Approved (Foundational Paradigm)',
        indicationNote: 'First targeted kinase inhibitor in modern precision oncology'
      },
      {
        name: 'Osimertinib',
        cid: 71496458,
        role: 'Kinase Inhibitor Benchmark',
        stage: 'Related Oncology Reference',
        indicationNote: 'Precision kinase covalent targeting benchmark'
      }
    ]
  },
  {
    id: 'asthma-copd',
    name: 'Asthma & Bronchospasm',
    synonyms: [
      'asthma',
      'bronchospasm',
      'copd',
      'bronchial asthma',
      'wheezing',
      'airway obstruction',
      'bronchoconstriction'
    ],
    category: 'Respiratory',
    targetName: 'Beta-2 Adrenergic Receptor (ADRB2)',
    targetGene: 'ADRB2',
    uniprotId: 'P07550',
    indication: 'Relief and prevention of bronchospasm in patients with reversible obstructive airway disease',
    description: 'Bronchial asthma is characterized by chronic airway inflammation and episodic smooth muscle hyperreactivity. Beta-2 adrenergic agonists stimulate adenylyl cyclase, raising intracellular cAMP and activating protein kinase A (PKA), which dephosphorylates myosin light chain kinase to effect bronchodilation.',
    primaryCompound: 'Albuterol',
    primaryCid: 2088,
    candidates: [
      {
        name: 'Albuterol',
        cid: 2088,
        role: 'Short-Acting Beta-2 Adrenergic Agonist (SABA)',
        stage: 'FDA Approved (First-Line Rescue)',
        indicationNote: 'Rapid-acting bronchial smooth muscle relaxation'
      },
      {
        name: 'Caffeine',
        cid: 2519,
        role: 'Weak Methylxanthine Bronchodilator',
        stage: 'Adjunctive Pharmacological Reference',
        indicationNote: 'Phosphodiesterase inhibition and adenosine antagonism relaxes bronchial tone'
      }
    ]
  },
  {
    id: 'gout-hyperuricemia',
    name: 'Gout & Hyperuricemia',
    synonyms: [
      'gout',
      'hyperuricemia',
      'gouty arthritis',
      'uric acid',
      'urate crystals',
      'podagra',
      'tophaceous gout'
    ],
    category: 'Metabolic',
    targetName: 'Xanthine Oxidase / Dehydrogenase (XOR)',
    targetGene: 'XDH',
    uniprotId: 'P47989',
    indication: 'Management of signs and symptoms of primary or secondary gout and urate nephropathy',
    description: 'Hyperuricemia causes supersaturation and intra-articular deposition of monosodium urate (MSU) crystals, triggering severe NLRP3 inflammasome activation. Purine analog inhibitors block xanthine oxidase, arresting purine catabolism at hypoxanthine and xanthine, which are readily excreted.',
    primaryCompound: 'Allopurinol',
    primaryCid: 2094,
    candidates: [
      {
        name: 'Allopurinol',
        cid: 2094,
        role: 'Purine Analog Xanthine Oxidase Inhibitor',
        stage: 'FDA Approved (First-Line Urate-Lowering)',
        indicationNote: 'Metabolized to oxypurinol, which persistently binds molybdenum active center'
      },
      {
        name: 'Ibuprofen',
        cid: 3672,
        role: 'NSAID for Acute Gout Flare Pain',
        stage: 'FDA Approved',
        indicationNote: 'Potent suppression of MSU crystal-induced neutrophil prostaglandin synthesis'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Salicylate Reference (Dose-Dependent Urate Retention)',
        stage: 'Clinical Caveat',
        indicationNote: 'Low-dose aspirin competes for renal URAT1, used for pharmacokinetics comparison'
      }
    ]
  },
  {
    id: 'gerd-peptic-ulcer',
    name: 'Gastroesophageal Reflux Disease (GERD) & Acid Reflux',
    synonyms: [
      'gerd',
      'acid reflux',
      'heartburn',
      'peptic ulcer',
      'gastric ulcer',
      'duodenal ulcer',
      'gastroesophageal reflux',
      'gastritis',
      'stomach acid'
    ],
    category: 'Gastroenterology',
    targetName: 'Gastric H+/K+-ATPase Proton Pump',
    targetGene: 'ATP4A',
    uniprotId: 'P20648',
    indication: 'Short-term and maintenance healing of erosive esophagitis, symptomatic GERD, and duodenal ulcers',
    description: 'Excess gastric acid secretion damages esophageal and gastroduodenal mucosa. Substituted benzimidazoles act as prodrugs that accumulate in the acidic secretory canaliculi of parietal cells, converting to active sulfenamides that covalently crosslink Cys813 in the H+/K+-ATPase enzyme.',
    primaryCompound: 'Omeprazole',
    primaryCid: 4614,
    candidates: [
      {
        name: 'Omeprazole',
        cid: 4614,
        role: 'Irreversible Proton Pump Inhibitor (PPI)',
        stage: 'FDA Approved (First-Line Acid Suppression)',
        indicationNote: 'Forms covalent disulfide bond with Cys813 of gastric H+/K+-ATPase'
      },
      {
        name: 'Aspirin',
        cid: 2244,
        role: 'Ulcerogenic Reference (Gastric Mucosal Barrier)',
        stage: 'Clinical Contrast',
        indicationNote: 'COX-1 inhibition reduces cytoprotective gastric mucus and bicarbonate'
      }
    ]
  }
];

export const POPULAR_DISEASE_CHIPS = [
  { label: 'Lung Cancer (NSCLC)', query: 'Lung Cancer' },
  { label: 'Hypertension', query: 'Hypertension' },
  { label: 'Type 2 Diabetes', query: 'Type 2 Diabetes' },
  { label: 'Pain & Arthritis', query: 'Pain' },
  { label: 'Cardiovascular / Statin', query: 'Cardiovascular' },
  { label: "Alzheimer's", query: "Alzheimer's" },
  { label: 'Depression', query: 'Depression' },
  { label: 'COVID-19', query: 'COVID-19' },
  { label: 'Leukemia (CML)', query: 'Leukemia' },
  { label: 'Asthma', query: 'Asthma' },
  { label: 'Gout', query: 'Gout' },
  { label: 'Acid Reflux / GERD', query: 'Acid Reflux' },
];

// Common disease keyword triggers
const DISEASE_TRIGGERS = [
  'cancer',
  'carcinoma',
  'neoplasm',
  'tumor',
  'tumour',
  'adenocarcinoma',
  'hypertension',
  'blood pressure',
  'diabetes',
  'hyperglycemia',
  'dyslipidemia',
  'hypercholesterolemia',
  'atherosclerosis',
  'cardiovascular',
  'coronary',
  'heart disease',
  'pain',
  'inflammation',
  'arthritis',
  'osteoarthritis',
  'rheumatoid',
  'fever',
  'pyrexia',
  'alzheimer',
  'dementia',
  'parkinson',
  'depression',
  'depressive',
  'anxiety',
  'covid',
  'coronavirus',
  'infection',
  'pneumonia',
  'leukemia',
  'lymphoma',
  'asthma',
  'bronchospasm',
  'copd',
  'gout',
  'hyperuricemia',
  'gerd',
  'reflux',
  'ulcer',
  'gastritis',
  'epilepsy',
  'seizure',
  'stroke',
  'syndrome',
  'disorder',
  'disease',
];

/**
 * Checks if a given query string strongly represents a disease or indication
 */
export function isDiseaseQuery(query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;

  // Direct check against known diseases and synonyms
  if (findDiseaseMatch(q) !== null) return true;

  // Check for disease trigger words
  return DISEASE_TRIGGERS.some((trigger) => q.includes(trigger));
}

/**
 * Resolves a search query to a matched DiseaseDefinition
 */
export function findDiseaseMatch(query: string): DiseaseDefinition | null {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return null;

  // 1. Exact ID match
  const byId = POPULAR_DISEASES.find((d) => d.id === trimmed);
  if (byId) return byId;

  // 2. Exact Name match
  const byName = POPULAR_DISEASES.find((d) => d.name.toLowerCase() === trimmed);
  if (byName) return byName;

  // 3. Exact Synonym match
  for (const d of POPULAR_DISEASES) {
    if (d.synonyms.some((s) => s.toLowerCase() === trimmed)) {
      return d;
    }
  }

  // 4. Substring / Word match
  for (const d of POPULAR_DISEASES) {
    if (
      d.name.toLowerCase().includes(trimmed) ||
      trimmed.includes(d.name.toLowerCase()) ||
      d.synonyms.some((s) => trimmed.includes(s.toLowerCase()) || s.toLowerCase().includes(trimmed))
    ) {
      return d;
    }
  }

  // 5. Keyword fuzzy match
  for (const d of POPULAR_DISEASES) {
    const combinedTokens = [
      ...d.name.toLowerCase().split(/\s+/),
      ...d.synonyms.flatMap((s) => s.toLowerCase().split(/\s+/)),
    ];
    const queryTokens = trimmed.split(/\s+/).filter((t) => t.length > 2);
    if (queryTokens.some((qt) => combinedTokens.includes(qt))) {
      return d;
    }
  }

  return null;
}

/**
 * Returns disease autocomplete suggestions
 */
export function getDiseaseSuggestions(query: string) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return [];

  const matches: Array<{
    name: string;
    type: 'disease';
    diseaseId: string;
    category: string;
    target: string;
    primaryCompound: string;
    candidateCount: number;
  }> = [];

  for (const d of POPULAR_DISEASES) {
    const isMatch =
      d.name.toLowerCase().includes(trimmed) ||
      d.synonyms.some((s) => s.toLowerCase().includes(trimmed)) ||
      d.category.toLowerCase().includes(trimmed) ||
      d.targetName.toLowerCase().includes(trimmed);

    if (isMatch) {
      matches.push({
        name: d.name,
        type: 'disease',
        diseaseId: d.id,
        category: d.category,
        target: d.targetName,
        primaryCompound: d.primaryCompound,
        candidateCount: d.candidates.length,
      });
    }
  }

  return matches.slice(0, 5);
}

/**
 * Converts a DiseaseDefinition into a DiseaseContext suitable for CompoundDetails
 */
export function buildDiseaseContext(disease: DiseaseDefinition): DiseaseContext {
  return {
    diseaseId: disease.id,
    diseaseName: disease.name,
    indication: disease.indication,
    category: disease.category,
    targetName: disease.targetName,
    targetGene: disease.targetGene,
    uniprotId: disease.uniprotId,
    description: disease.description,
    candidates: disease.candidates,
  };
}
