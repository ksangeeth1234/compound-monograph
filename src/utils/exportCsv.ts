import { CompoundDetails } from '../types';

export function exportCompoundsToCSV(compounds: CompoundDetails[], filename = 'pubchem_compounds_export.csv') {
  if (!compounds || compounds.length === 0) return;

  const headers = [
    'CID',
    'Name',
    'IUPAC Name',
    'Molecular Formula',
    'Molecular Weight (g/mol)',
    'XLogP3',
    'TPSA (Å²)',
    'H-Bond Donors',
    'H-Bond Acceptors',
    'Rotatable Bonds',
    'Heavy Atoms',
    'Exact Mass',
    'Complexity',
    'Lipinski Violations',
    'Lipinski Compliance',
    'Veber Compliance',
    'Canonical SMILES',
    'InChIKey',
    'CAS Number',
  ];

  const rows = compounds.map((c) => [
    c.cid,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.iupacName || '').replace(/"/g, '""')}"`,
    c.properties.molecularFormula,
    c.properties.molecularWeight.toFixed(2),
    c.properties.xlogp !== null ? c.properties.xlogp.toFixed(2) : 'N/A',
    c.properties.tpsa.toFixed(1),
    c.properties.hbd,
    c.properties.hba,
    c.properties.rotatableBonds,
    c.properties.heavyAtoms,
    c.properties.exactMass.toFixed(4),
    c.properties.complexity,
    c.lipinski.violations,
    c.lipinski.isStrictPass ? 'Pass (0 Violations)' : c.lipinski.isCompliant ? 'Compliant (1 Violation)' : 'Fail',
    c.lipinski.veberPass ? 'Pass' : 'Fail',
    `"${(c.identifiers.canonicalSmiles || '').replace(/"/g, '""')}"`,
    c.identifiers.inchiKey,
    c.identifiers.casNumber || 'N/A',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCompoundsToJSON(compounds: CompoundDetails[], filename = 'pubchem_compounds_export.json') {
  if (!compounds || compounds.length === 0) return;

  const jsonContent = JSON.stringify(compounds, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function copyCompoundsToClipboardTSV(compounds: CompoundDetails[]): Promise<boolean> {
  if (!compounds || compounds.length === 0) return false;

  const headers = [
    'CID',
    'Name',
    'Formula',
    'Molecular Weight (Da)',
    'XLogP3',
    'TPSA (Å²)',
    'H-Bond Donors',
    'H-Bond Acceptors',
    'Rotatable Bonds',
    'Heavy Atoms',
    'Lipinski Compliance',
    'Canonical SMILES',
    'InChIKey',
  ];

  const rows = compounds.map((c) => [
    c.cid,
    c.name,
    c.properties.molecularFormula,
    c.properties.molecularWeight.toFixed(2),
    c.properties.xlogp !== null ? c.properties.xlogp.toFixed(2) : 'N/A',
    c.properties.tpsa.toFixed(1),
    c.properties.hbd,
    c.properties.hba,
    c.properties.rotatableBonds,
    c.properties.heavyAtoms,
    c.lipinski.isStrictPass ? 'Pass (0 Violations)' : c.lipinski.isCompliant ? 'Compliant (1 Violation)' : 'Fail',
    c.identifiers.canonicalSmiles,
    c.identifiers.inchiKey,
  ]);

  const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
  try {
    await navigator.clipboard.writeText(tsvContent);
    return true;
  } catch {
    return false;
  }
}

