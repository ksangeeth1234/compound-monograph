import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LipinskiEvaluation, MolecularProperties } from '../types';

interface Props {
  lipinski: LipinskiEvaluation;
  properties: MolecularProperties;
  showDetailsButton?: boolean;
}

export const LipinskiBadge: React.FC<Props> = ({ lipinski, properties, showDetailsButton = true }) => {
  const [showModal, setShowModal] = useState(false);

  const getStatusSummary = () => {
    if (lipinski.isStrictPass) {
      return {
        color: 'var(--ok)',
        label: 'Passes all 4 Lipinski rules for oral medicines',
      };
    }
    if (lipinski.isCompliant) {
      return {
        color: 'var(--warn)',
        label: 'Passes Lipinski rules with 1 exception (borderline)',
      };
    }
    return {
      color: 'var(--fail)',
      label: `Does not meet Lipinski rules (${lipinski.violations} exceptions)`,
    };
  };

  const status = getStatusSummary();

  const rules = [
    {
      name: 'Molecular weight',
      criteria: '500 Da or less',
      actual: `${properties.molecularWeight.toFixed(2)} Da`,
      passed: lipinski.mwPass,
      desc: 'Smaller molecules pass through the stomach and intestinal wall more easily.',
    },
    {
      name: 'Fat vs water solubility (LogP)',
      criteria: '5.0 or less',
      actual: properties.xlogp !== null ? properties.xlogp.toFixed(2) : 'Not available',
      passed: lipinski.logpPass,
      desc: 'Balances dissolving in stomach fluid with crossing fatty cell membranes.',
    },
    {
      name: 'Hydrogen bond donors',
      criteria: '5 or fewer',
      actual: properties.hbd.toString(),
      passed: lipinski.hbdPass,
      desc: 'Count of OH and NH groups. Too many make it hard to cross cell walls.',
    },
    {
      name: 'Hydrogen bond acceptors',
      criteria: '10 or fewer',
      actual: properties.hba.toString(),
      passed: lipinski.hbaPass,
      desc: 'Count of nitrogen and oxygen atoms that attract water molecules.',
    },
  ];

  const secondaryFilters = [
    {
      name: 'Veber oral availability check',
      criteria: '10 or fewer rotatable bonds, and polar surface area 140 Å² or less',
      actual: `${properties.rotatableBonds} rotatable bonds · ${properties.tpsa.toFixed(1)} Å²`,
      passed: lipinski.veberPass,
    },
    {
      name: 'Lead-likeness check',
      criteria: 'Weight 350 Da or less, LogP 3.0 or less, 7 or fewer rotatable bonds',
      actual: `${properties.molecularWeight.toFixed(1)} Da · LogP ${properties.xlogp ?? 'N/A'}`,
      passed: lipinski.leadLikenessPass,
    },
    {
      name: 'Ghose filter',
      criteria: 'Weight between 160 and 480 Da, LogP between -0.4 and 5.6',
      actual: `${properties.molecularWeight.toFixed(1)} Da · ${properties.heavyAtoms} heavy atoms`,
      passed: lipinski.ghoseFilterPass,
    },
  ];

  return (
    <>
      <div className="inline-flex flex-wrap items-baseline gap-2 text-[14px]">
        <span className="font-medium" style={{ color: status.color }}>
          {status.label}
        </span>
        {showDetailsButton && (
          <>
            <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
            <button
              type="button"
              id="lipinski-badge-trigger"
              onClick={() => setShowModal(true)}
              className="text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
            >
              Read rule breakdown
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--surface)] border border-[var(--ink)] p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--divider)] pb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
                  Oral drug suitability (Lipinski rule of 5)
                </h3>
                <p className="text-[14px] text-[var(--ink-muted)] mt-1">
                  How likely this compound is to be absorbed when taken by mouth as a tablet or capsule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                aria-label="Close breakdown"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[16px] font-semibold" style={{ color: status.color }}>
                {status.label}
              </div>
              <p className="text-[14px] text-[var(--ink)] leading-relaxed">
                {lipinski.violations === 0
                  ? 'This compound meets all four rules set out by chemist Christopher Lipinski. Molecules that pass all four rules usually dissolve well and pass through the gut into the bloodstream.'
                  : lipinski.violations === 1
                  ? 'This compound exceeds one threshold. Under Lipinski’s rule, a molecule with at most one exception is still considered suitable for oral use.'
                  : `This compound exceeds ${lipinski.violations} thresholds. Molecules with two or more exceptions are often poorly absorbed when swallowed and may require injection or specialized delivery.`}
              </p>
            </div>

            {/* Core 4 criteria table */}
            <div className="space-y-3">
              <h4 className="text-lg font-display text-[var(--ink)]">
                The 4 Lipinski measurements
              </h4>
              <table className="w-full text-[14px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-[var(--ink)] text-left text-[12px] text-[var(--ink-muted)]">
                    <th className="py-2 pr-4 font-semibold">Measurement</th>
                    <th className="py-2 px-4 font-semibold">Target limit</th>
                    <th className="py-2 px-4 text-right font-semibold">This compound</th>
                    <th className="py-2 pl-4 text-right font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--divider)]">
                  {rules.map((r) => (
                    <tr key={r.name}>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[var(--ink)]">{r.name}</div>
                        <div className="text-[12px] text-[var(--ink-muted)]">{r.desc}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[13px] text-[var(--ink-muted)] whitespace-nowrap">
                        {r.criteria}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-[var(--ink)] whitespace-nowrap">
                        {r.actual}
                      </td>
                      <td className="py-3 pl-4 text-right whitespace-nowrap font-medium">
                        {r.passed ? (
                          <span style={{ color: 'var(--ok)' }}>Meets rule</span>
                        ) : (
                          <span style={{ color: 'var(--fail)' }}>Exceeds limit</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Additional drug checks */}
            <div className="space-y-3 pt-2">
              <h4 className="text-lg font-display text-[var(--ink)]">
                Additional medicinal chemistry checks
              </h4>
              <div className="divide-y divide-[var(--divider)] border-y border-[var(--divider)]">
                {secondaryFilters.map((f) => (
                  <div
                    key={f.name}
                    className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-[14px]"
                  >
                    <div>
                      <div className="font-medium text-[var(--ink)]">{f.name}</div>
                      <div className="text-[12px] text-[var(--ink-muted)]">{f.criteria}</div>
                    </div>
                    <div className="flex items-baseline gap-3 shrink-0">
                      <span className="font-mono text-[12px] text-[var(--ink-muted)] tabular-nums">{f.actual}</span>
                      <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
                      <span
                        className="font-medium text-[13px]"
                        style={{ color: f.passed ? 'var(--ok)' : 'var(--fail)' }}
                      >
                        {f.passed ? 'Meets check' : 'Outside range'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-[14px] font-medium bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
