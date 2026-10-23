export interface EgfrCandidate {
  name: string;
  generation: string;
  cid: number;
  smiles: string;
  formula: string;
  molecularWeight: number;
  xlogp: number;
  tpsa: number;
  hbd: number;
  hba: number;
  ic50: string;
  selectivity: string;
  mechanism: string;
  lipinski: 'Pass (0)' | 'Borderline (1)' | 'Fail (2+)';
  status: string;
  trial: string;
  notes: string;
}

export interface EgfrTargetAssessmentData {
  targetName: string;
  geneSymbol: string;
  uniprotId: string;
  organism: string;
  indication: string;
  diseaseEvidence: {
    summary: string;
    keyMutations: Array<{
      mutation: string;
      prevalence: string;
      clinicalSignificance: string;
      inhibitorResponse: string;
    }>;
    pathways: string[];
    preclinicalRationale: string;
  };
  bindingPocket: {
    name: string;
    pdbReference: string;
    volume: string;
    description: string;
    keyResidues: Array<{
      residue: string;
      role: string;
      interactionType: string;
    }>;
    covalentTarget: string;
    selectivityDrivers: string;
  };
  candidates: EgfrCandidate[];
}

export const EGFR_TARGET_DATA: EgfrTargetAssessmentData = {
  targetName: 'Epidermal Growth Factor Receptor (EGFR / ErbB1 / HER1)',
  geneSymbol: 'EGFR',
  uniprotId: 'P00533',
  organism: 'Homo sapiens (Human)',
  indication: 'Non-Small Cell Lung Cancer (NSCLC) Adenocarcinoma',
  diseaseEvidence: {
    summary:
      'EGFR is a receptor tyrosine kinase hyperactivated in 15-50% of non-small cell lung cancer (NSCLC) cases, with highest incidence in East Asian, female, and non-smoking cohorts. Activating mutations in the kinase domain constitutively stimulate downstream oncogenic cascades (MAPK/ERK, PI3K/Akt/mTOR, and STAT3/5), promoting uncontrolled cell division, anti-apoptosis, and metastatic dissemination.',
    keyMutations: [
      {
        mutation: 'Exon 19 Deletion (delE746-A750)',
        prevalence: '~45% of EGFR+ NSCLC',
        clinicalSignificance: 'Classical sensitizing mutation; rearranges the ATP-binding cleft to lock kinase into active state.',
        inhibitorResponse: 'Highly sensitive to 1st, 2nd, and 3rd generation EGFR TKIs (Gefitinib, Erlotinib, Osimertinib).',
      },
      {
        mutation: 'Exon 21 L858R Point Mutation',
        prevalence: '~40% of EGFR+ NSCLC',
        clinicalSignificance: 'Disrupts auto-inhibitory hydrophobic interactions in kinase activation loop.',
        inhibitorResponse: 'Robustly sensitive to Osimertinib and 1st-generation TKIs.',
      },
      {
        mutation: 'Exon 20 T790M Gatekeeper Mutation',
        prevalence: '~50-60% of acquired 1st/2nd Gen resistance',
        clinicalSignificance: 'Steric hindrance by methionine side chain and dramatically restored ATP affinity (Km reduced 10-fold).',
        inhibitorResponse: 'Primary target of 3rd generation irreversible inhibitors (Osimertinib, Lazertinib).',
      },
      {
        mutation: 'Exon 20 C797S Tertiary Mutation',
        prevalence: '~10-15% of acquired Osimertinib resistance',
        clinicalSignificance: 'Replaces nucleophilic thiol with hydroxyl, abolishing irreversible covalent bond formation.',
        inhibitorResponse: 'Demands 4th-generation allosteric or dual non-covalent inhibitors.',
      },
    ],
    pathways: [
      'Ras-Raf-MEK-ERK (Cellular Proliferation & Mitogenesis)',
      'PI3K-Akt-mTOR (Survival, Glycolysis, & Apoptosis Evasion)',
      'JAK-STAT3 (Angiogenesis & Immune Evasion)',
      'PLCγ-PKC (Cellular Motility & Cytoskeletal Remodeling)',
    ],
    preclinicalRationale:
      'Genetically engineered mouse models (GEMMs) expressing EGFR L858R or Exon 19 del develop diffuse lung adenocarcinomas that rapidly regress upon pharmacological inhibition or genetic knockdown, establishing true oncogene addiction.',
  },
  bindingPocket: {
    name: 'Kinase Domain ATP-Binding Cleft',
    pdbReference: '4ZAU / 2ITY / 1M17',
    volume: '~480 Å³ (Deep hydrophobic cleft with solvent-exposed front channel)',
    description:
      'The ATP pocket is situated in the cleft between the small N-terminal lobe (largely β-sheets) and large C-terminal lobe (predominantly α-helical). It accommodates ATP adenine via key hydrogen bonds to the hinge region, flanked by the catalytic lysine and hydrophobic back-pockets.',
    keyResidues: [
      {
        residue: 'Met793 (Hinge Backbone)',
        role: 'Essential hinge anchor',
        interactionType: 'Bidentate hydrogen bonds with inhibitor core heteroatoms (NH / carbonyl backbone)',
      },
      {
        residue: 'Thr790 (Gatekeeper)',
        role: 'Controls entrance to deep hydrophobic pocket',
        interactionType: 'Forms steric filter; mutated to bulky Met790 in acquired resistance',
      },
      {
        residue: 'Cys797 (Front Edge)',
        role: 'Covalent nucleophile',
        interactionType: 'Michael addition attack on electrophilic acrylamide warheads (Osimertinib, Afatinib)',
      },
      {
        residue: 'Lys745 (Catalytic Lysine)',
        role: 'Coordinates α/β-phosphates of ATP',
        interactionType: 'Salt bridge with Glu762 in active αC-helix-in conformation',
      },
      {
        residue: 'Leu718 / Gly796',
        role: 'Hydrophobic roof and floor',
        interactionType: 'Van der Waals contacts stabilizing lipophilic planar aromatic moieties',
      },
    ],
    covalentTarget:
      'Cys797 residue is targeted by α,β-unsaturated amide (acrylamide) warheads for irreversible covalent bond formation, conferring prolonged pharmacodynamics and overcoming high cellular ATP concentrations (~1-5 mM).',
    selectivityDrivers:
      'Osimertinib exploits a flexible indole-pyrimidine scaffold that wraps around Met790 while minimizing steric clashes, delivering >200-fold selectivity for T790M/L858R over Wild-Type EGFR (which prevents severe rash and diarrhea).',
  },
  candidates: [
    {
      name: 'Osimertinib (Tagrisso / AZD9291)',
      generation: '3rd Gen (Irreversible Covalent)',
      cid: 71496458,
      smiles: 'CN(C)CC=CC(=O)Nc1cc(Nc2nccc(n2)c3cn(C)c4ccccc34)c(cc1OC)N(C)CCN(C)C',
      formula: 'C28H33N7O2',
      molecularWeight: 499.61,
      xlogp: 3.1,
      tpsa: 87.7,
      hbd: 2,
      hba: 9,
      ic50: '12 nM (T790M) / 1 nM (L858R)',
      selectivity: '200x selective over Wild-Type EGFR',
      mechanism: 'Irreversible covalent inhibition of EGFR Cys797 with indole-pyrimidine scaffold',
      lipinski: 'Pass (0)',
      status: 'FDA Approved (1st-line & 2nd-line NSCLC)',
      trial: 'Phase III FLAURA & AURA3 Trials',
      notes: 'Standard of care 1st-line NSCLC; superior CNS blood-brain barrier penetration.',
    },
    {
      name: 'Gefitinib (Iressa / ZD1839)',
      generation: '1st Gen (Reversible ATP-competitive)',
      cid: 123631,
      smiles: 'COc1cc2ncnc(Nc3ccc(F)c(Cl)c3)c2cc1OCCCN4CCOCC4',
      formula: 'C22H24ClFN4O3',
      molecularWeight: 446.9,
      xlogp: 3.2,
      tpsa: 68.7,
      hbd: 1,
      hba: 7,
      ic50: '33 nM (WT/L858R) / >10,000 nM (T790M)',
      selectivity: 'Non-selective; susceptible to T790M sterics',
      mechanism: 'Reversible 4-anilinoquinazoline ATP-competitive inhibitor',
      lipinski: 'Pass (0)',
      status: 'FDA Approved (Exon 19 del / L858R)',
      trial: 'Phase III IPASS Trial',
      notes: 'Seminal 1st-gen TKI; ineffective against T790M gatekeeper mutation.',
    },
    {
      name: 'Erlotinib (Tarceva / OSI-774)',
      generation: '1st Gen (Reversible ATP-competitive)',
      cid: 176870,
      smiles: 'COCCOc1cc2ncnc(Nc3cccc(c3)C#C)c2cc1OCCOC',
      formula: 'C22H23N3O4',
      molecularWeight: 393.44,
      xlogp: 2.7,
      tpsa: 74.7,
      hbd: 1,
      hba: 7,
      ic50: '20 nM (WT/L858R) / >5,000 nM (T790M)',
      selectivity: 'Equipotent against WT and sensitizing mutants',
      mechanism: 'Reversible quinazoline ATP mimic',
      lipinski: 'Pass (0)',
      status: 'FDA Approved',
      trial: 'Phase III EURTAC Trial',
      notes: 'Frequently co-administered with anti-VEGF agents (e.g. Bevacizumab).',
    },
    {
      name: 'Afatinib (Gilotrif / BIBW 2992)',
      generation: '2nd Gen (Irreversible Pan-HER)',
      cid: 24776445,
      smiles: 'CN(C)C/C=C/C(=O)Nc1cc2c(Nc3ccc(Cl)c(F)c3)ncnc2cc1O[C@H]1CCOC1',
      formula: 'C24H25ClFN5O3',
      molecularWeight: 485.94,
      xlogp: 3.8,
      tpsa: 87.7,
      hbd: 2,
      hba: 8,
      ic50: '0.5 nM (EGFR WT/mutant) / 14 nM (HER2)',
      selectivity: 'Pan-ErbB blocker; potent against WT causing GI/skin toxicity',
      mechanism: 'Irreversible covalent Michael addition to Cys797 (EGFR) and Cys805 (HER2)',
      lipinski: 'Pass (0)',
      status: 'FDA Approved',
      trial: 'Phase III LUX-Lung 3 & 6',
      notes: 'Potent covalent binder; dose-limited clinically by wild-type diarrhea and rash.',
    },
    {
      name: 'Mobocertinib (Exkivity / TAK-788)',
      generation: '3rd Gen (Exon 20 Insertion Specialist)',
      cid: 137446543,
      smiles: 'CC(C)OC(=O)c1c(Nc2cc(Nc3nccc(n3)c4cnc(nc4)N(C)C)c(cc2OC)NC(=O)C=C)cnn1C',
      formula: 'C32H39N9O4',
      molecularWeight: 613.71,
      xlogp: 3.9,
      tpsa: 138.0,
      hbd: 3,
      hba: 13,
      ic50: '2.8 nM (Exon 20 ins) / 24 nM (WT)',
      selectivity: 'Optimized for Exon 20 insertion geometry',
      mechanism: 'Irreversible covalent inhibitor tailored for Exon 20 insertion loop',
      lipinski: 'Borderline (1)',
      status: 'FDA Accelerated Approval (Exon 20 insertions)',
      trial: 'Phase I/II Study (NCT02716246)',
      notes: 'Specifically addresses refractory Exon 20 insertion mutations.',
    },
  ],
};
