import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { CompoundDetails } from '../types';
import { exportCompoundsToCSV, exportCompoundsToJSON, copyCompoundsToClipboardTSV } from '../utils/exportCsv';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comparedCompounds: CompoundDetails[];
  onRemoveCompound: (cid: number) => void;
  onAddCompoundName: (name: string) => Promise<void>;
  onSelectCompound: (query: string) => void;
}

export const CompareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  comparedCompounds,
  onRemoveCompound,
  onAddCompoundName,
  onSelectCompound,
}) => {
  const [newQuery, setNewQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);

  if (!isOpen) return null;

  const handleCopyTsv = async () => {
    const success = await copyCompoundsToClipboardTSV(comparedCompounds);
    if (success) {
      setCopiedTsv(true);
      setTimeout(() => setCopiedTsv(false), 2000);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;
    setIsAdding(true);
    try {
      await onAddCompoundName(newQuery.trim());
      setNewQuery('');
    } finally {
      setIsAdding(false);
    }
  };

  const handlePreset = async (names: string[]) => {
    setIsAdding(true);
    try {
      for (const name of names) {
        await onAddCompoundName(name);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const propertiesList = [
    { key: 'molecularFormula', label: 'Chemical formula', format: (c: CompoundDetails) => c.properties.molecularFormula },
    {
      key: 'molecularWeight',
      label: 'Molecular weight',
      unit: 'g/mol',
      format: (c: CompoundDetails) => c.properties.molecularWeight.toFixed(2),
    },
    {
      key: 'xlogp',
      label: 'Fat vs water solubility (LogP)',
      format: (c: CompoundDetails) => (c.properties.xlogp !== null ? c.properties.xlogp.toFixed(2) : 'N/A'),
    },
    {
      key: 'tpsa',
      label: 'Polar surface area (TPSA)',
      unit: 'Å²',
      format: (c: CompoundDetails) => c.properties.tpsa.toFixed(1),
    },
    { key: 'hbd', label: 'Hydrogen bond donors', format: (c: CompoundDetails) => c.properties.hbd },
    { key: 'hba', label: 'Hydrogen bond acceptors', format: (c: CompoundDetails) => c.properties.hba },
    { key: 'rotatableBonds', label: 'Rotatable bonds', format: (c: CompoundDetails) => c.properties.rotatableBonds },
    { key: 'heavyAtoms', label: 'Heavy atoms', format: (c: CompoundDetails) => c.properties.heavyAtoms },
    { key: 'exactMass', label: 'Exact mass', unit: 'Da', format: (c: CompoundDetails) => c.properties.exactMass.toFixed(4) },
    { key: 'complexity', label: 'Structural complexity', format: (c: CompoundDetails) => c.properties.complexity },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] bg-[var(--surface)] border border-[var(--ink)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 flex items-start justify-between gap-4 border-b border-[var(--divider)]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              Compare compounds side by side
            </h2>
            <p className="text-[14px] text-[var(--ink-muted)] mt-0.5">
              Comparing {comparedCompounds.length} {comparedCompounds.length === 1 ? 'compound' : 'compounds'} across chemical properties and oral drug rules.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {comparedCompounds.length > 0 && (
              <div className="flex items-center gap-3 text-[13px]">
                <button
                  type="button"
                  onClick={() => exportCompoundsToCSV(comparedCompounds, 'compound_comparison.csv')}
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                >
                  Download CSV
                </button>
                <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
                <button
                  type="button"
                  onClick={() => exportCompoundsToJSON(comparedCompounds, 'compound_comparison.json')}
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                >
                  Download JSON
                </button>
                <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
                <button
                  type="button"
                  onClick={handleCopyTsv}
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                >
                  {copiedTsv ? 'Copied table' : 'Copy table'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Compound & Plain-Text Example Sets */}
        <div className="px-6 sm:px-8 py-4 border-b border-[var(--divider)] bg-[var(--surface-sunken)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <form onSubmit={handleAdd} className="flex items-center gap-3 flex-1 max-w-xl">
            <input
              type="text"
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="Add a compound by name, SMILES, or CID (for example, Ibuprofen)..."
              className="flex-1 py-2 px-3 text-[14px] bg-[var(--surface)] border border-[var(--divider)] focus:border-[var(--ink)] focus:outline-none text-[var(--ink)]"
            />
            <button
              type="submit"
              disabled={isAdding || !newQuery.trim()}
              className="px-5 py-2 text-[13px] font-medium text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--accent)] cursor-pointer disabled:opacity-40 shrink-0"
            >
              {isAdding ? 'Adding...' : 'Add compound'}
            </button>
          </form>

          <div className="flex items-center gap-2 flex-wrap text-[13px] text-[var(--ink-muted)]">
            <span className="text-[var(--ink-subtle)]">Load example group:</span>
            <button
              type="button"
              onClick={() => handlePreset(['Osimertinib', 'Gefitinib', 'Erlotinib', 'Afatinib'])}
              className="hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
            >
              Lung cancer (EGFR) medicines
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handlePreset(['Aspirin', 'Ibuprofen', 'Acetaminophen'])}
              className="hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
            >
              Common pain relievers
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handlePreset(['Caffeine', 'Dopamine'])}
              className="hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
            >
              Caffeine and Dopamine
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6 sm:px-8">
          {comparedCompounds.length === 0 ? (
            <div className="py-16 text-center space-y-2 max-w-md mx-auto">
              <h3 className="text-2xl font-display text-[var(--ink)]">No compounds selected yet</h3>
              <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                Enter two or more chemical compounds above, or choose one of the example groups to compare their structures and measurements side by side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-y border-[var(--ink)]">
              <table className="min-w-max w-full text-[14px] border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-[var(--ink)]">
                    <th className="py-3.5 pr-6 font-semibold text-[var(--ink-muted)] text-[12px] w-52 min-w-[200px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--divider)]">
                      Property
                    </th>
                    {comparedCompounds.map((compound) => (
                      <th
                        key={compound.cid}
                        className="py-3.5 px-6 font-normal min-w-[220px] max-w-[260px] border-r border-[var(--divider)] last:border-r-0 align-top bg-[var(--surface)]"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCompound(String(compound.cid));
                              onClose();
                            }}
                            className="text-xl font-display text-[var(--ink)] hover:text-[var(--accent)] truncate cursor-pointer text-left"
                            title={compound.name}
                          >
                            {compound.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveCompound(compound.cid)}
                            className="p-1 text-[var(--ink-subtle)] hover:text-[var(--fail)] transition-colors cursor-pointer shrink-0"
                            title="Remove compound"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[12px] font-mono tabular-nums text-[var(--ink-muted)]">
                          CID {compound.cid}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {/* 2D Structure Row */}
                  <tr>
                    <td className="py-4 pr-6 font-medium text-[var(--ink-muted)] text-[13px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--divider)]">
                      2D structure
                    </td>
                    {comparedCompounds.map((c) => (
                      <td key={c.cid} className="py-4 px-6 border-r border-[var(--divider)] last:border-r-0">
                        <div
                          className="h-28 flex items-center justify-center p-2 bg-white border border-[var(--divider)] hover:border-[var(--ink)] cursor-pointer transition-colors"
                          onClick={() => {
                            onSelectCompound(String(c.cid));
                            onClose();
                          }}
                          title={`Open ${c.name}`}
                        >
                          <img
                            src={c.structureUrl}
                            alt={c.name}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Lipinski Compliance Row — Plain unboxed text */}
                  <tr>
                    <td className="py-3.5 pr-6 font-medium text-[var(--ink-muted)] text-[13px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--divider)]">
                      Oral drug suitability (Lipinski)
                    </td>
                    {comparedCompounds.map((c) => (
                      <td
                        key={c.cid}
                        className="py-3.5 px-6 text-right font-medium text-[13px] border-r border-[var(--divider)] last:border-r-0"
                        style={{
                          color: c.lipinski.isStrictPass
                            ? 'var(--ok)'
                            : c.lipinski.isCompliant
                            ? 'var(--warn)'
                            : 'var(--fail)',
                        }}
                      >
                        {c.lipinski.isStrictPass
                          ? 'Passes all 4 rules'
                          : c.lipinski.isCompliant
                          ? 'Passes (1 exception)'
                          : `Exceeds limits (${c.lipinski.violations})`}
                      </td>
                    ))}
                  </tr>

                  {/* Physicochemical Properties Rows */}
                  {propertiesList.map((p) => (
                    <tr key={p.key} className="hover:bg-[var(--surface-sunken)] transition-colors">
                      <td className="py-3 pr-6 font-medium text-[var(--ink-muted)] text-[13px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--divider)]">
                        {p.label}
                      </td>
                      {comparedCompounds.map((c) => (
                        <td
                          key={c.cid}
                          className="py-3 px-6 text-right font-mono tabular-nums font-medium text-[var(--ink)] border-r border-[var(--divider)] last:border-r-0"
                        >
                          <span>{p.format(c)}</span>
                          {p.unit && <span className="text-[var(--ink-muted)] text-[12px] font-normal ml-1">{p.unit}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Canonical SMILES Row */}
                  <tr>
                    <td className="py-3 pr-6 font-medium text-[var(--ink-muted)] text-[13px] sticky left-0 z-20 bg-[var(--surface)] border-r border-[var(--divider)]">
                      SMILES structure
                    </td>
                    {comparedCompounds.map((c) => (
                      <td
                        key={c.cid}
                        className="py-3 px-6 font-mono text-[12px] text-[var(--ink)] border-r border-[var(--divider)] last:border-r-0 break-all select-all"
                      >
                        {c.identifiers.canonicalSmiles}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-t border-[var(--divider)] bg-[var(--surface-sunken)]">
          <span className="text-[13px] text-[var(--ink-muted)]">
            Click any compound name or structure diagram to view its full record.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-medium bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
