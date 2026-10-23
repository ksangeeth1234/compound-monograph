import React from 'react';
import { DiseaseContext } from '../types';

interface DiseaseBannerProps {
  diseaseContext: DiseaseContext;
  currentCompoundName: string;
  onSelectCandidate: (candidateName: string) => void;
  onExploreIndication?: (diseaseName: string) => void;
}

export const DiseaseBanner: React.FC<DiseaseBannerProps> = ({
  diseaseContext,
  currentCompoundName,
  onSelectCandidate,
  onExploreIndication,
}) => {
  return (
    <section className="py-6 border-y border-[var(--ink)] space-y-5">
      {/* Unboxed inline metadata row */}
      <div className="flex flex-wrap items-baseline justify-between gap-4 text-[13px] text-[var(--ink-muted)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--ink)]">Health condition match</span>
          <span aria-hidden="true">·</span>
          <span>{diseaseContext.category}</span>
          {diseaseContext.targetGene && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Target gene: <strong className="font-mono text-[var(--ink)]">{diseaseContext.targetGene}</strong>
              </span>
            </>
          )}
          {diseaseContext.uniprotId && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono">UniProt {diseaseContext.uniprotId}</span>
            </>
          )}
        </div>

        {onExploreIndication && (
          <button
            type="button"
            onClick={() => onExploreIndication(diseaseContext.diseaseName)}
            className="text-[13px] font-medium text-[var(--accent)] hover:underline underline-offset-4 cursor-pointer"
          >
            Ask the research assistant about {diseaseContext.diseaseName} →
          </button>
        )}
      </div>

      {/* Asymmetric two-column breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-1">
          <h2 className="text-3xl sm:text-4xl font-display text-[var(--ink)] leading-tight">
            {diseaseContext.diseaseName}
          </h2>
          <p className="text-[14px] text-[var(--ink-muted)]">
            Biological target: <strong className="text-[var(--ink)] font-medium">{diseaseContext.targetName}</strong>
          </p>
        </div>

        <div className="lg:col-span-7">
          <p className="text-[15px] text-[var(--ink)] leading-relaxed max-w-prose">
            {diseaseContext.description}
          </p>
        </div>
      </div>

      {/* Candidate medicines list — unboxed typographic links */}
      {diseaseContext.candidates && diseaseContext.candidates.length > 0 && (
        <div className="pt-4 border-t border-[var(--divider)] flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <span className="text-[13px] text-[var(--ink-muted)]">
              Medicines for this condition:
            </span>
            {diseaseContext.candidates.map((candidate, idx) => {
              const isActive =
                candidate.name.toLowerCase() === currentCompoundName.toLowerCase() ||
                currentCompoundName.toLowerCase().includes(candidate.name.toLowerCase());

              return (
                <React.Fragment key={candidate.cid || candidate.name}>
                  {idx > 0 && <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>}
                  <button
                    type="button"
                    onClick={() => onSelectCandidate(candidate.name)}
                    className={`text-[14px] cursor-pointer transition-colors ${
                      isActive
                        ? 'font-semibold text-[var(--ink)] underline underline-offset-4 decoration-2'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:underline underline-offset-4'
                    }`}
                    title={candidate.indicationNote || `${candidate.name} (${candidate.role})`}
                  >
                    <span>{candidate.name}</span>
                    <span className="text-[12px] text-[var(--ink-subtle)] ml-1">
                      ({candidate.role.split(' ')[0]})
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
