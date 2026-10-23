export interface MolecularProperties {
  molecularFormula: string;
  molecularWeight: number;
  xlogp: number | null;
  tpsa: number; // Topological Polar Surface Area in Å²
  hbd: number; // Hydrogen Bond Donors
  hba: number; // Hydrogen Bond Acceptors
  rotatableBonds: number;
  heavyAtoms: number;
  exactMass: number;
  monoisotopicMass?: number;
  complexity: number;
  charge: number;
  atomStereoCount?: number;
  bondStereoCount?: number;
  volume3D?: number;
}

export interface ChemicalIdentifiers {
  cid: number;
  name: string;
  iupacName: string;
  canonicalSmiles: string;
  isomericSmiles: string;
  inchi: string;
  inchiKey: string;
  casNumber?: string;
  synonyms: string[];
}

export interface LipinskiEvaluation {
  mwPass: boolean; // <= 500 Da
  logpPass: boolean; // <= 5.0
  hbdPass: boolean; // <= 5
  hbaPass: boolean; // <= 10
  violations: number;
  isCompliant: boolean; // <= 1 violation
  isStrictPass: boolean; // 0 violations
  veberPass: boolean; // rotatableBonds <= 10, tpsa <= 140 Å²
  leadLikenessPass: boolean; // mw <= 350, logp <= 3, rotb <= 7
  ghoseFilterPass: boolean; // 160 <= mw <= 480, -0.4 <= logp <= 5.6, 20 <= heavyAtoms <= 70
}

export interface BioassayRecord {
  aid: number;
  assayName: string;
  targetName: string;
  targetGene?: string;
  targetOrganism?: string;
  activityOutcome: 'Active' | 'Inactive' | 'Inconclusive' | 'Tested';
  activityType?: string; // 'IC50', 'EC50', 'Ki', '% Inhibition', 'Kd'
  activityValue?: number | string;
  activityUnit?: string;
  assayType?: 'Confirmatory' | 'Screening' | 'Summary' | 'Panel';
  description?: string;
  sourceName?: string;
}

export interface PharmacologyInfo {
  mechanismOfAction?: string;
  atcCodes?: string[];
  therapeuticCategories?: string[];
  fdaApproved?: boolean;
  meshClassifications?: string[];
  metabolism?: string;
  clearance?: string;
  pharmacodynamics?: string;
}

export interface SimilarCompound {
  cid: number;
  name: string;
  similarityScore: number; // 0-100 or 0-1
  molecularFormula: string;
  molecularWeight: number;
  xlogp: number | null;
  tpsa: number;
  canonicalSmiles: string;
  structureUrl?: string;
}

export interface LiteratureCitation {
  pmid: string;
  title: string;
  journal: string;
  year: number | string;
  authors: string;
  doi?: string;
  meshTerms?: string[];
  citationCount?: number;
  abstractSnippet?: string;
}

export interface DiseaseCandidateRef {
  name: string;
  cid: number;
  role: string;
  stage?: string;
  indicationNote?: string;
}

export interface DiseaseContext {
  diseaseId: string;
  diseaseName: string;
  indication: string;
  category: string;
  targetName: string;
  targetGene?: string;
  uniprotId?: string;
  description: string;
  candidates: DiseaseCandidateRef[];
}

export interface CompoundDetails {
  cid: number;
  name: string;
  iupacName: string;
  properties: MolecularProperties;
  identifiers: ChemicalIdentifiers;
  lipinski: LipinskiEvaluation;
  description: string;
  structureUrl: string;
  svgUrl?: string;
  pharmacology?: PharmacologyInfo;
  bioassays: BioassayRecord[];
  similarCompounds: SimilarCompound[];
  literature: LiteratureCitation[];
  patentsCount?: number;
  clinicalTrialsCount?: number;
  diseaseContext?: DiseaseContext;
}

export interface AgentTraceStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  detail: string;
  timestamp: string;
  durationMs?: number;
  payload?: Record<string, any>;
  toolName?: string;
  parameters?: Record<string, any>;
  output?: Record<string, any> | string;
  notes?: string;
  category?: 'resolution' | 'computation' | 'api' | 'reasoning' | 'synthesis';
}

export interface AgentTrace {
  query: string;
  timestamp: string;
  totalDurationMs: number;
  isStreaming: boolean;
  steps: AgentTraceStep[];
  reportJson?: Record<string, any>;
  interactionId?: string;
  environmentId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  suggestedQuestions?: string[];
  citations?: string[];
  relatedCid?: number;
}

export type ActiveTab = 'properties' | 'bioactivity' | 'similar' | 'literature';
export type SearchType = 'all' | 'name' | 'disease' | 'smiles' | 'cid' | 'inchi';

export interface DatasetItem {
  id: string;
  name: string;
  smiles: string;
  cid?: number;
  formula?: string;
  molecularWeight?: number;
  xlogp?: number | null;
  tpsa?: number;
  hbd?: number;
  hba?: number;
  rotatableBonds?: number;
  lipinskiViolations?: number;
  isCompliant?: boolean;
  customProperties?: Record<string, string | number>;
  status?: 'resolved' | 'pending' | 'failed';
  error?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  source: 'upload' | 'sample' | 'manual';
  items: DatasetItem[];
  tags: string[];
}
