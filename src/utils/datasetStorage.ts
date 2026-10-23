import { Dataset, DatasetItem } from '../types';
import { INITIAL_SAMPLE_DATASETS } from '../data/sampleDatasets';

const STORAGE_KEY = 'compound_monograph_datasets_v1';

export function loadDatasetsFromStorage(): Dataset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatasetsToStorage(INITIAL_SAMPLE_DATASETS);
      return INITIAL_SAMPLE_DATASETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_DATASETS;
  } catch (e) {
    console.error('Failed to load datasets from localStorage:', e);
    return INITIAL_SAMPLE_DATASETS;
  }
}

export function saveDatasetsToStorage(datasets: Dataset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
  } catch (e) {
    console.error('Failed to save datasets to localStorage:', e);
  }
}

export function resetToDefaultDatasets(): Dataset[] {
  saveDatasetsToStorage(INITIAL_SAMPLE_DATASETS);
  return INITIAL_SAMPLE_DATASETS;
}

/**
 * Robust CSV/TSV parser supporting standard delimiters, quotes, and chemical columns
 */
export function parseCSVToDataset(content: string, fileName: string): Dataset {
  const cleanContent = content.trim();
  const lines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one compound data row.');
  }

  // Detect delimiter: comma, tab, or semicolon
  const headerLine = lines[0];
  let delimiter = ',';
  if (headerLine.includes('\t')) delimiter = '\t';
  else if (headerLine.includes(';') && !headerLine.includes(',')) delimiter = ';';

  // Helper to parse line with respect to quotes
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseLine(headerLine).map((h) => h.replace(/^["']|["']$/g, '').trim());

  // Find key chemical columns
  const smilesIdx = headers.findIndex((h) =>
    /^(smiles|canonical_smiles|isomeric_smiles|structure|smi)$/i.test(h)
  );
  const nameIdx = headers.findIndex((h) =>
    /^(name|compound|compound_name|molecule|id|title|label)$/i.test(h)
  );
  const cidIdx = headers.findIndex((h) =>
    /^(cid|pubchem_cid|pubchem_id|pubchem)$/i.test(h)
  );
  const mwIdx = headers.findIndex((h) =>
    /^(mw|molecular_weight|molwt|mass)$/i.test(h)
  );
  const logpIdx = headers.findIndex((h) =>
    /^(logp|xlogp|xlogp3|clogp)$/i.test(h)
  );
  const tpsaIdx = headers.findIndex((h) =>
    /^(tpsa|psa)$/i.test(h)
  );
  const hbdIdx = headers.findIndex((h) =>
    /^(hbd|donors|h_donors)$/i.test(h)
  );
  const hbaIdx = headers.findIndex((h) =>
    /^(hba|acceptors|h_acceptors)$/i.test(h)
  );
  const rotbIdx = headers.findIndex((h) =>
    /^(rotatable_bonds|rotb|nrot)$/i.test(h)
  );

  const items: DatasetItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawValues = parseLine(lines[i]);
    if (rawValues.length === 0 || (rawValues.length === 1 && !rawValues[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = rawValues[idx] || '';
    });

    const smiles = smilesIdx >= 0 ? rawValues[smilesIdx] || '' : '';
    const name = nameIdx >= 0 ? rawValues[nameIdx] || `Compound ${i}` : `Compound ${i}`;
    const cidStr = cidIdx >= 0 ? rawValues[cidIdx] : '';
    const cid = cidStr && /^\d+$/.test(cidStr) ? parseInt(cidStr, 10) : undefined;

    const mwStr = mwIdx >= 0 ? rawValues[mwIdx] : undefined;
    const mw = mwStr && !isNaN(parseFloat(mwStr)) ? parseFloat(mwStr) : undefined;

    const logpStr = logpIdx >= 0 ? rawValues[logpIdx] : undefined;
    const xlogp = logpStr && !isNaN(parseFloat(logpStr)) ? parseFloat(logpStr) : null;

    const tpsaStr = tpsaIdx >= 0 ? rawValues[tpsaIdx] : undefined;
    const tpsa = tpsaStr && !isNaN(parseFloat(tpsaStr)) ? parseFloat(tpsaStr) : undefined;

    const hbdStr = hbdIdx >= 0 ? rawValues[hbdIdx] : undefined;
    const hbd = hbdStr && !isNaN(parseInt(hbdStr, 10)) ? parseInt(hbdStr, 10) : undefined;

    const hbaStr = hbaIdx >= 0 ? rawValues[hbaIdx] : undefined;
    const hba = hbaStr && !isNaN(parseInt(hbaStr, 10)) ? parseInt(hbaStr, 10) : undefined;

    const rotbStr = rotbIdx >= 0 ? rawValues[rotbIdx] : undefined;
    const rotatableBonds = rotbStr && !isNaN(parseInt(rotbStr, 10)) ? parseInt(rotbStr, 10) : undefined;

    // Collect custom properties (anything not in standard mapping)
    const customProperties: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      if (
        idx !== smilesIdx &&
        idx !== nameIdx &&
        idx !== cidIdx &&
        idx !== mwIdx &&
        idx !== logpIdx &&
        idx !== tpsaIdx &&
        idx !== hbdIdx &&
        idx !== hbaIdx &&
        idx !== rotbIdx
      ) {
        const val = rawValues[idx];
        if (val !== undefined && val !== '') {
          const numVal = parseFloat(val);
          customProperties[h] = !isNaN(numVal) && String(numVal) === val.trim() ? numVal : val;
        }
      }
    });

    // Compute Lipinski violations if descriptors available
    let violations: number | undefined = undefined;
    let isCompliant: boolean | undefined = undefined;
    if (mw !== undefined || xlogp !== null || hbd !== undefined || hba !== undefined) {
      let v = 0;
      if (mw !== undefined && mw > 500) v++;
      if (xlogp !== null && xlogp !== undefined && xlogp > 5.0) v++;
      if (hbd !== undefined && hbd > 5) v++;
      if (hba !== undefined && hba > 10) v++;
      violations = v;
      isCompliant = v <= 1;
    }

    items.push({
      id: `item-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      smiles,
      cid,
      molecularWeight: mw,
      xlogp,
      tpsa,
      hbd,
      hba,
      rotatableBonds,
      lipinskiViolations: violations,
      isCompliant,
      customProperties: Object.keys(customProperties).length > 0 ? customProperties : undefined,
      status: mw !== undefined || smiles.length > 0 || cid ? 'resolved' : 'pending',
    });
  }

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return {
    id: `dataset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: baseName || 'Uploaded Compound Library',
    description: `Imported from ${fileName} containing ${items.length} records.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'upload',
    items,
    tags: ['Custom Upload', 'CSV/TSV', `${items.length} compounds`],
  };
}

/**
 * Parse SDF (Structure-Data File)
 */
export function parseSDFToDataset(content: string, fileName: string): Dataset {
  const records = content.split('$$$$');
  const items: DatasetItem[] = [];

  records.forEach((record, idx) => {
    const trimmed = record.trim();
    if (!trimmed) return;

    const lines = trimmed.split(/\r?\n/);
    const name = lines[0]?.trim() || `Molecule ${idx + 1}`;

    const tags: Record<string, string> = {};
    const tagRegex = />\s*<([^>]+)>\s*\r?\n([^>]+)/g;
    let match;
    while ((match = tagRegex.exec(trimmed)) !== null) {
      const tagName = match[1].trim();
      const tagVal = match[2].trim().split(/\r?\n/)[0];
      tags[tagName] = tagVal;
    }

    const smiles = tags['PUBCHEM_OPENEYE_CAN_SMILES'] || tags['SMILES'] || tags['Canonical_SMILES'] || '';
    const cidStr = tags['PUBCHEM_COMPOUND_CID'] || tags['CID'];
    const cid = cidStr && /^\d+$/.test(cidStr) ? parseInt(cidStr, 10) : undefined;

    const mwStr = tags['PUBCHEM_MOLECULAR_WEIGHT'] || tags['MW'];
    const mw = mwStr && !isNaN(parseFloat(mwStr)) ? parseFloat(mwStr) : undefined;

    const logpStr = tags['PUBCHEM_XLOGP3'] || tags['XLOGP3'] || tags['LogP'];
    const xlogp = logpStr && !isNaN(parseFloat(logpStr)) ? parseFloat(logpStr) : null;

    const tpsaStr = tags['PUBCHEM_CACTVS_TPSA'] || tags['TPSA'];
    const tpsa = tpsaStr && !isNaN(parseFloat(tpsaStr)) ? parseFloat(tpsaStr) : undefined;

    const hbdStr = tags['PUBCHEM_CACTVS_HBOND_DONOR'] || tags['HBD'];
    const hbd = hbdStr && !isNaN(parseInt(hbdStr, 10)) ? parseInt(hbdStr, 10) : undefined;

    const hbaStr = tags['PUBCHEM_CACTVS_HBOND_ACCEPTOR'] || tags['HBA'];
    const hba = hbaStr && !isNaN(parseInt(hbaStr, 10)) ? parseInt(hbaStr, 10) : undefined;

    const rotbStr = tags['PUBCHEM_CACTVS_ROTATABLE_BOND'] || tags['RotatableBonds'];
    const rotb = rotbStr && !isNaN(parseInt(rotbStr, 10)) ? parseInt(rotbStr, 10) : undefined;

    items.push({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      smiles,
      cid,
      molecularWeight: mw,
      xlogp,
      tpsa,
      hbd,
      hba,
      rotatableBonds: rotb,
      customProperties: Object.keys(tags).length > 0 ? tags : undefined,
      status: 'resolved',
    });
  });

  const baseName = fileName.replace(/\.[^/.]+$/, '');
  return {
    id: `dataset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: baseName || 'SDF Molecular Library',
    description: `Imported from ${fileName} (${items.length} structures).`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'upload',
    items,
    tags: ['SDF Library', `${items.length} records`],
  };
}

/**
 * Parse pasted newline-separated list of SMILES, names, or CIDs
 */
export function parsePastedListToDataset(text: string, title: string): Dataset {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const items: DatasetItem[] = [];

  lines.forEach((line, idx) => {
    // Check if line contains comma or tab separating Name and SMILES
    let name = `Compound ${idx + 1}`;
    let smiles = '';
    let cid: number | undefined;

    if (line.includes(',') || line.includes('\t')) {
      const parts = line.split(/[,\t]/).map((p) => p.trim());
      if (parts.length >= 2) {
        if (/[#=\(\)\[\]@\+\-]/.test(parts[1])) {
          name = parts[0];
          smiles = parts[1];
        } else if (/[#=\(\)\[\]@\+\-]/.test(parts[0])) {
          smiles = parts[0];
          name = parts[1];
        } else {
          name = parts[0];
          if (/^\d+$/.test(parts[1])) cid = parseInt(parts[1], 10);
        }
      }
    } else {
      if (/^\d+$/.test(line)) {
        cid = parseInt(line, 10);
        name = `CID ${cid}`;
      } else if (/[#=\(\)\[\]@\+\-]/.test(line) && !line.includes(' ')) {
        smiles = line;
        name = `Molecule ${idx + 1}`;
      } else {
        name = line;
      }
    }

    items.push({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      smiles,
      cid,
      status: 'pending',
    });
  });

  return {
    id: `dataset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: title.trim() || 'Manual Compound List',
    description: `Entered via batch text input with ${items.length} compounds.`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'manual',
    items,
    tags: ['Batch Input', `${items.length} compounds`],
  };
}

/**
 * Export dataset to downloadable CSV
 */
export function exportDatasetToCSV(dataset: Dataset): void {
  // Collect all unique custom property keys
  const customKeys = new Set<string>();
  dataset.items.forEach((item) => {
    if (item.customProperties) {
      Object.keys(item.customProperties).forEach((k) => customKeys.add(k));
    }
  });

  const headers = [
    'Name',
    'CID',
    'SMILES',
    'Formula',
    'MolecularWeight',
    'XLogP',
    'TPSA',
    'HBD',
    'HBA',
    'RotatableBonds',
    'LipinskiViolations',
    ...Array.from(customKeys),
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = dataset.items.map((item) => {
    const row = [
      escapeCSV(item.name),
      escapeCSV(item.cid || ''),
      escapeCSV(item.smiles),
      escapeCSV(item.formula || ''),
      escapeCSV(item.molecularWeight ?? ''),
      escapeCSV(item.xlogp ?? ''),
      escapeCSV(item.tpsa ?? ''),
      escapeCSV(item.hbd ?? ''),
      escapeCSV(item.hba ?? ''),
      escapeCSV(item.rotatableBonds ?? ''),
      escapeCSV(item.lipinskiViolations ?? ''),
      ...Array.from(customKeys).map((k) => escapeCSV(item.customProperties?.[k] ?? '')),
    ];
    return row.join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_compound_monograph.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export dataset to downloadable JSON
 */
export function exportDatasetToJSON(dataset: Dataset): void {
  const jsonContent = JSON.stringify(dataset, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dataset.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_compound_monograph.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
