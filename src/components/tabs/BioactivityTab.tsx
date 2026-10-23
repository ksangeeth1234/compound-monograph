import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { CompoundDetails } from '../../types';

interface Props {
  compound: CompoundDetails;
}

export const BioactivityTab: React.FC<Props> = ({ compound }) => {
  const [outcomeFilter, setOutcomeFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const { bioassays, pharmacology } = compound;

  const filteredAssays = bioassays.filter((a) => {
    if (outcomeFilter === 'All') return true;
    return a.activityOutcome.toLowerCase() === outcomeFilter.toLowerCase();
  });

  return (
    <div className="space-y-16">
      {/* Pharmacology & Mechanism Section */}
      {pharmacology && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              How it works in the body
            </h2>
            <div className="text-[13px] text-[var(--ink-muted)] space-y-1">
              {pharmacology.fdaApproved && (
                <div className="font-medium text-[var(--ok)]">
                  Approved medicine (FDA)
                </div>
              )}
              {pharmacology.atcCodes && pharmacology.atcCodes.length > 0 && (
                <div>
                  <span>WHO ATC classification: </span>
                  <span className="font-mono text-[var(--ink)]">
                    {pharmacology.atcCodes.join(' · ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8">
            {pharmacology.mechanismOfAction && (
              <div className="space-y-2">
                <h3 className="text-[15px] font-semibold text-[var(--ink)]">
                  Mechanism of action
                </h3>
                <p className="text-[16px] text-[var(--ink)] leading-relaxed max-w-prose">
                  {pharmacology.mechanismOfAction}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[var(--divider)]">
              {pharmacology.metabolism && (
                <div className="space-y-1.5">
                  <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                    How the body breaks it down (metabolism)
                  </h3>
                  <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                    {pharmacology.metabolism}
                  </p>
                </div>
              )}

              {pharmacology.clearance && (
                <div className="space-y-1.5">
                  <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                    How it leaves the body (clearance and half-life)
                  </h3>
                  <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                    {pharmacology.clearance}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* PubChem BioAssay Table */}
      <section className="pt-8 border-t border-[var(--ink)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              Laboratory test results ({bioassays.length} PubChem BioAssays)
            </h2>
            <p className="text-[14px] text-[var(--ink-muted)]">
              Measured binding strength and biological activity against target proteins.
            </p>
          </div>

          {/* Clean Segmented Filter */}
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-[var(--ink-subtle)]">Show:</span>
            {(['All', 'Active', 'Inactive'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setOutcomeFilter(filter)}
                className={`cursor-pointer transition-colors ${
                  outcomeFilter === filter
                    ? 'font-semibold text-[var(--ink)] underline underline-offset-4 decoration-2'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                {filter === 'All' ? 'All tests' : filter}
              </button>
            ))}
          </div>
        </div>

        {filteredAssays.length === 0 ? (
          <div className="py-12 border-y border-[var(--divider)] text-center space-y-2">
            <p className="text-[15px] text-[var(--ink-muted)]">No laboratory tests match this filter.</p>
            <button
              type="button"
              onClick={() => setOutcomeFilter('All')}
              className="text-[14px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
            >
              Show all tests
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] border-collapse">
              <thead>
                <tr className="border-b-2 border-[var(--ink)] text-left text-[12px] text-[var(--ink-muted)]">
                  <th className="py-3 pr-4 font-semibold">Biological target</th>
                  <th className="py-3 px-4 font-semibold">Test description</th>
                  <th className="py-3 px-4 font-semibold">Species</th>
                  <th className="py-3 px-4 font-semibold">Result</th>
                  <th className="py-3 px-4 text-right font-semibold">Measured strength</th>
                  <th className="py-3 pl-4 text-right font-semibold">Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--divider)]">
                {filteredAssays.map((assay) => (
                  <tr key={assay.aid} className="hover:bg-[var(--surface-sunken)] transition-colors">
                    <td className="py-3.5 pr-4 align-top">
                      <div className="font-semibold text-[var(--ink)]">
                        {assay.targetGene || assay.targetName}
                      </div>
                      <div className="text-[12px] text-[var(--ink-muted)] max-w-[200px]" title={assay.targetName}>
                        {assay.targetName}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 align-top max-w-sm">
                      <div className="text-[var(--ink)] break-words [overflow-wrap:anywhere]">{assay.assayName}</div>
                      {assay.description && (
                        <div className="text-[12px] text-[var(--ink-muted)] mt-0.5 line-clamp-1" title={assay.description}>
                          {assay.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[13px] text-[var(--ink-muted)] whitespace-nowrap align-top">
                      {assay.targetOrganism || 'Homo sapiens'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap align-top">
                      <span
                        className="font-medium text-[13px]"
                        style={{
                          color:
                            assay.activityOutcome === 'Active'
                              ? 'var(--ok)'
                              : assay.activityOutcome === 'Inactive'
                              ? 'var(--ink-muted)'
                              : 'var(--warn)',
                        }}
                      >
                        {assay.activityOutcome}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-[var(--ink)] whitespace-nowrap align-top">
                      {assay.activityValue ? (
                        <span>
                          <span className="text-[12px] text-[var(--ink-muted)] font-normal mr-1.5">
                            {assay.activityType || 'IC50'}:
                          </span>
                          {assay.activityValue}
                        </span>
                      ) : (
                        <span className="text-[var(--ink-subtle)]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap align-top">
                      <a
                        href={`https://pubchem.ncbi.nlm.nih.gov/bioassay/${assay.aid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-mono text-[var(--accent)] hover:underline underline-offset-4"
                      >
                        <span>AID {assay.aid}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
