import React, { useState } from 'react';
import { CompoundDetails } from '../../types';
import { RadarChart } from '../RadarChart';

interface Props {
  compound: CompoundDetails;
}

export const PropertiesTab: React.FC<Props> = ({ compound }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(false ? '' : null), 2000);
  };

  const { properties, identifiers } = compound;

  const physicochemicalMetrics = [
    {
      label: 'Molecular weight',
      val: properties.molecularWeight.toFixed(2),
      unit: 'g/mol',
      desc: 'Total mass of one molecule',
    },
    {
      label: 'Fat vs water solubility (XLogP3)',
      val: properties.xlogp !== null ? properties.xlogp.toFixed(2) : 'Not available',
      unit: '',
      desc: 'How strongly the compound prefers fat over water',
    },
    {
      label: 'Polar surface area (TPSA)',
      val: properties.tpsa.toFixed(1),
      unit: 'Å²',
      desc: 'Surface area of polar atoms; lower values cross cell walls more easily',
    },
    {
      label: 'Hydrogen bond donors',
      val: properties.hbd,
      unit: '',
      desc: 'Number of OH and NH groups that can donate a hydrogen bond',
    },
    {
      label: 'Hydrogen bond acceptors',
      val: properties.hba,
      unit: '',
      desc: 'Number of nitrogen and oxygen atoms that can accept a hydrogen bond',
    },
    {
      label: 'Rotatable bonds',
      val: properties.rotatableBonds,
      unit: '',
      desc: 'Single bonds not in a ring, measuring molecular flexibility',
    },
    {
      label: 'Heavy atom count',
      val: properties.heavyAtoms,
      unit: '',
      desc: 'Number of all non-hydrogen atoms in the molecule',
    },
    {
      label: 'Exact monoisotopic mass',
      val: properties.exactMass.toFixed(5),
      unit: 'Da',
      desc: 'Mass calculated using the most common isotope of each element',
    },
    {
      label: 'Structural complexity',
      val: properties.complexity,
      unit: '',
      desc: 'Index of how branched, ringed, and asymmetrical the structure is',
    },
    {
      label: 'Net electrical charge',
      val: properties.charge,
      unit: '',
      desc: 'Total formal electrical charge of the molecule',
    },
    {
      label: '3D molecular volume',
      val: properties.volume3D ? properties.volume3D.toFixed(1) : 'Not available',
      unit: properties.volume3D ? 'Å³' : '',
      desc: 'Estimated three-dimensional space occupied by the molecule',
    },
  ];

  const identifierRows = [
    { label: 'Systematic IUPAC name', val: identifiers.iupacName || compound.name, copyable: true },
    { label: 'Canonical SMILES', val: identifiers.canonicalSmiles, copyable: true, mono: true },
    { label: 'Isomeric SMILES', val: identifiers.isomericSmiles || identifiers.canonicalSmiles, copyable: true, mono: true },
    { label: 'InChI string', val: identifiers.inchi, copyable: true, mono: true },
    { label: 'InChIKey', val: identifiers.inchiKey, copyable: true, mono: true },
    { label: 'CAS Registry number', val: identifiers.casNumber || 'Not listed', copyable: Boolean(identifiers.casNumber), mono: true },
    { label: 'PubChem CID', val: String(compound.cid), copyable: true, mono: true },
  ];

  return (
    <div className="space-y-16">
      {/* Unboxed Lead Summary Paragraph */}
      {compound.description && (
        <section className="max-w-3xl space-y-2">
          <h2 className="text-2xl font-display text-[var(--ink)]">Overview</h2>
          <p className="text-[17px] text-[var(--ink)] leading-relaxed">
            {compound.description}
          </p>
        </section>
      )}

      {/* Main Split: Measurements Table + Radar Figure */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              Physical and chemical measurements
            </h2>
            <span className="text-[12px] text-[var(--ink-subtle)]">PubChem PUG REST</span>
          </div>

          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr className="border-b-2 border-[var(--ink)] text-left text-[12px] text-[var(--ink-muted)]">
                <th className="py-2.5 pr-4 font-semibold">Property</th>
                <th className="py-2.5 px-4 text-right font-semibold">Value</th>
                <th className="py-2.5 pl-4 font-semibold hidden sm:table-cell">What this measures</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--divider)]">
              {physicochemicalMetrics.map((m) => (
                <tr key={m.label} className="hover:bg-[var(--surface-sunken)] transition-colors">
                  <td className="py-3 pr-4 font-medium text-[var(--ink)]">{m.label}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-[var(--ink)] whitespace-nowrap">
                    <span>{m.val}</span>
                    {m.unit && <span className="text-[var(--ink-muted)] ml-1 text-[12px] font-normal">{m.unit}</span>}
                  </td>
                  <td className="py-3 pl-4 text-[13px] text-[var(--ink-muted)] hidden sm:table-cell">
                    {m.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Unboxed Radar Figure */}
        <div className="lg:col-span-5 lg:pl-4 space-y-4">
          <RadarChart properties={properties} compoundName={compound.name} size={280} />
          <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed border-t border-[var(--divider)] pt-3">
            <strong className="text-[var(--ink)] font-medium">How to read this chart: </strong>
            The green dashed polygon shows the target range for medicines taken by mouth. When the blue shape stays inside the dashed line, the compound is more likely to be absorbed well as a pill.
          </p>
        </div>
      </section>

      {/* Chemical Identifiers & Registry Numbers */}
      <section className="pt-10 border-t border-[var(--ink)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
            Standard identifiers
          </h2>
          <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed break-words [overflow-wrap:anywhere]">
            Universal chemical notation and registry codes used to look up or cite {compound.name} across scientific databases.
          </p>
        </div>

        <div className="lg:col-span-8">
          <table className="w-full text-[14px] border-collapse">
            <tbody className="divide-y divide-[var(--divider)] border-y border-[var(--divider)]">
              {identifierRows.map((row) => (
                <tr key={row.label} className="hover:bg-[var(--surface-sunken)] transition-colors">
                  <td className="py-3.5 pr-4 font-medium text-[var(--ink-muted)] text-[13px] w-48 shrink-0 align-top">
                    {row.label}
                  </td>
                  <td
                    className={`py-3.5 px-2 ${
                      row.mono ? 'font-mono text-[13px] break-all' : 'text-[14px] break-words [overflow-wrap:anywhere]'
                    } text-[var(--ink)] align-top`}
                  >
                    {row.val}
                  </td>
                  <td className="py-3.5 pl-4 text-right w-20 shrink-0 align-top">
                    {row.copyable && row.val !== 'Not listed' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(row.val, row.label)}
                        className="text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                      >
                        {copiedKey === row.label ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Synonyms & Trade Names — Unboxed inline text */}
      {identifiers.synonyms && identifiers.synonyms.length > 0 && (
        <section className="pt-10 border-t border-[var(--divider)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-1">
            <h2 className="text-2xl font-display text-[var(--ink)]">
              Other names and brand names
            </h2>
            <p className="text-[13px] text-[var(--ink-muted)]">
              {identifiers.synonyms.length} recorded synonyms in PubChem
            </p>
          </div>
          <div className="lg:col-span-8 text-[14px] text-[var(--ink)] leading-relaxed break-words [overflow-wrap:anywhere]">
            {identifiers.synonyms.map((syn, idx) => (
              <React.Fragment key={syn}>
                {idx > 0 && <span aria-hidden="true" className="mx-2 text-[var(--ink-subtle)]">·</span>}
                <span>{syn}</span>
              </React.Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
