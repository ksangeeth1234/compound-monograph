import React from 'react';
import { SimilarCompound } from '../../types';

interface Props {
  similarCompounds: SimilarCompound[];
  onSelectCompound: (query: string) => void;
  onAddToCompare?: (compound: SimilarCompound) => void;
  isCompared?: (cid: number) => boolean;
}

export const SimilarCompoundsTab: React.FC<Props> = ({
  similarCompounds,
  onSelectCompound,
  onAddToCompare,
  isCompared,
}) => {
  if (!similarCompounds || similarCompounds.length === 0) {
    return (
      <div className="py-12 border-y border-[var(--divider)] text-center space-y-2">
        <h3 className="text-xl font-display text-[var(--ink)]">No closely related compounds found</h3>
        <p className="text-[14px] text-[var(--ink-muted)] max-w-md mx-auto">
          PubChem did not return any structural neighbors with at least 85% Tanimoto similarity for this compound.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
          Compounds with a similar chemical structure ({similarCompounds.length})
        </h2>
        <p className="text-[14px] text-[var(--ink-muted)]">
          Molecules in PubChem that share at least 85% of their 2D chemical fingerprint (Tanimoto similarity).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
        {similarCompounds.map((item) => {
          const compared = isCompared ? isCompared(item.cid) : false;

          return (
            <div
              key={item.cid}
              className="pt-4 border-t border-[var(--ink)] flex flex-col justify-between space-y-4 min-w-0"
            >
              <div className="space-y-3 min-w-0">
                {/* Unboxed Header */}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 text-[12px] font-mono tabular-nums text-[var(--ink-muted)]">
                    <span>CID {item.cid}</span>
                    <span className="font-medium text-[var(--ink)]">{item.similarityScore}% match</span>
                  </div>
                  <h3
                    className="text-2xl font-display text-[var(--ink)] line-clamp-2 break-words [overflow-wrap:anywhere] cursor-pointer hover:text-[var(--accent)] transition-colors"
                    title={item.name}
                    onClick={() => onSelectCompound(String(item.cid))}
                  >
                    {item.name}
                  </h3>
                </div>

                {/* 2D Structure Specimen Plate */}
                <div
                  className="p-4 h-44 bg-white border border-[var(--divider)] hover:border-[var(--ink)] transition-colors flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => onSelectCompound(String(item.cid))}
                  title={`View ${item.name}`}
                >
                  <img
                    src={item.structureUrl || `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${item.cid}/PNG`}
                    alt={`${item.name} 2D Structure`}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Open Tabular Metrics */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] pt-1">
                  <div>
                    <dt className="text-[11px] text-[var(--ink-muted)]">Formula</dt>
                    <dd className="font-mono text-[var(--ink)]">{item.molecularFormula || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--ink-muted)]">Weight</dt>
                    <dd className="font-mono tabular-nums text-[var(--ink)]">
                      {item.molecularWeight ? `${item.molecularWeight.toFixed(1)} g/mol` : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--ink-muted)]">LogP</dt>
                    <dd className="font-mono tabular-nums text-[var(--ink)]">
                      {item.xlogp !== null && item.xlogp !== undefined ? item.xlogp.toFixed(1) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-[var(--ink-muted)]">Polar area (TPSA)</dt>
                    <dd className="font-mono tabular-nums text-[var(--ink)]">
                      {item.tpsa ? `${item.tpsa.toFixed(1)} Å²` : '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Unboxed Text Actions */}
              <div className="pt-3 border-t border-[var(--divider)] flex items-center justify-between text-[13px]">
                <button
                  type="button"
                  onClick={() => onSelectCompound(String(item.cid))}
                  className="font-medium text-[var(--ink)] hover:text-[var(--accent)] hover:underline underline-offset-4 cursor-pointer"
                >
                  View compound →
                </button>

                {onAddToCompare && (
                  <button
                    type="button"
                    onClick={() => onAddToCompare(item)}
                    className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                  >
                    {compared ? 'In comparison' : 'Add to comparison'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
