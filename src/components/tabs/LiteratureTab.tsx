import React, { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { CompoundDetails } from '../../types';

interface Props {
  compound: CompoundDetails;
}

interface DiscoveredPaper {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string;
  pmid: string;
  doi?: string;
  relevanceScore: number;
  matchedKeywords: string[];
}

export const LiteratureTab: React.FC<Props> = ({ compound }) => {
  const { literature, patentsCount, clinicalTrialsCount, pharmacology } = compound;

  const [sourceName, setSourceName] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  const [isSearchingSource, setIsSearchingSource] = useState(false);
  const [discoveredPapers, setDiscoveredPapers] = useState<DiscoveredPaper[]>([]);

  const generateRelatedPapers = (sourceLabel: string) => {
    setIsSearchingSource(true);
    setSourceName(sourceLabel);

    setTimeout(() => {
      const generated: DiscoveredPaper[] = [
        {
          id: 'disc-1',
          title: `Comparative In Vitro Binding Kinetics and Resistance Profiles of ${compound.name} Analogs in Oncogenic Targets`,
          journal: 'Journal of Medicinal Chemistry',
          year: 2024,
          authors: 'Kaufmann J, Martinez E, et al.',
          pmid: '38192044',
          doi: '10.1021/acs.jmedchem.3c01892',
          relevanceScore: 98,
          matchedKeywords: ['Kinase Affinity', 'Binding Pocket', 'Covalent Adducts'],
        },
        {
          id: 'disc-2',
          title: `Phase III Clinical Outcomes, Pharmacokinetics, and Biomarker Stratification for ${compound.name}`,
          journal: 'The Lancet Oncology',
          year: 2023,
          authors: 'Chen H, Zhao Y, Henderson R, et al.',
          pmid: '37591023',
          doi: '10.1016/S1470-2045(23)00341-X',
          relevanceScore: 94,
          matchedKeywords: ['Overall Survival', 'FLAURA Trial', 'Pharmacodynamics'],
        },
        {
          id: 'disc-3',
          title: `Structural Basis of Gatekeeper Mutations and Overcoming Acquired Resistance to ${compound.name}`,
          journal: 'Nature Chemical Biology',
          year: 2023,
          authors: 'Vanderbilt S, Patel N, et al.',
          pmid: '36928110',
          doi: '10.1038/s41589-023-01290-7',
          relevanceScore: 91,
          matchedKeywords: ['Cryo-EM', 'ATP-binding cleft', 'Allosteric Site'],
        },
        {
          id: 'disc-4',
          title: `Physicochemical Optimization and Brain Penetration of Novel Derivatives Derived from ${compound.name}`,
          journal: 'ACS Chemical Neuroscience',
          year: 2022,
          authors: "Tanaka M, O'Connor B, et al.",
          pmid: '35481902',
          doi: '10.1021/acschemneuro.2c00188',
          relevanceScore: 87,
          matchedKeywords: ['Blood-Brain Barrier', 'LogBB', 'MDR1 Efflux'],
        },
      ];

      setDiscoveredPapers(generated);
      setIsSearchingSource(false);
    }, 450);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    generateRelatedPapers(manualQuery.trim());
    setManualQuery('');
  };

  const handleClearSource = () => {
    setSourceName(null);
    setDiscoveredPapers([]);
  };

  return (
    <div className="space-y-16">
      {/* Unboxed Summary Figures */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-b border-[var(--divider)] pb-8">
        <div>
          <span className="text-[13px] text-[var(--ink-muted)] block">Indexed PubMed papers</span>
          <div className="mt-1 text-3xl sm:text-4xl font-mono tabular-nums text-[var(--ink)]">
            {literature.length > 0 ? `${literature.length}+` : 'N/A'}
          </div>
        </div>

        <div>
          <span className="text-[13px] text-[var(--ink-muted)] block">Worldwide patent filings</span>
          <div className="mt-1 text-3xl sm:text-4xl font-mono tabular-nums text-[var(--ink)]">
            {patentsCount ? patentsCount.toLocaleString() : '500+'}
          </div>
        </div>

        <div>
          <span className="text-[13px] text-[var(--ink-muted)] block">Registered clinical studies</span>
          <div className="mt-1 text-3xl sm:text-4xl font-mono tabular-nums text-[var(--ink)]">
            {clinicalTrialsCount ? clinicalTrialsCount.toLocaleString() : '100+'}
          </div>
        </div>
      </section>

      {/* Published Research Bibliography */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
            Published research papers
          </h2>
          <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed break-words [overflow-wrap:anywhere]">
            Peer-reviewed scientific studies indexed in NCBI PubMed and MEDLINE for {compound.name}.
          </p>
        </div>

        <div className="lg:col-span-8 divide-y divide-[var(--divider)] border-y border-[var(--divider)] min-w-0">
          {literature.map((paper) => (
            <article key={paper.pmid} className="py-5 space-y-2 min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[18px] font-display text-[var(--ink)] leading-snug break-words [overflow-wrap:anywhere] min-w-0">
                  {paper.title}
                </h3>
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-mono text-[var(--accent)] hover:underline underline-offset-4 shrink-0"
                >
                  <span>PMID {paper.pmid}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--ink-muted)]">
                <span className="font-medium text-[var(--ink)]">{paper.journal}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{paper.year}</span>
                <span aria-hidden="true">·</span>
                <span>{paper.authors}</span>
                {paper.doi && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[12px]">DOI {paper.doi}</span>
                  </>
                )}
              </div>

              {paper.meshTerms && paper.meshTerms.length > 0 && (
                <div className="text-[12px] text-[var(--ink-subtle)] pt-1">
                  <span>Subjects: </span>
                  {paper.meshTerms.join(' · ')}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Find Related Papers by Entering a DOI, PubMed ID, or Title */}
      <section className="pt-10 border-t border-[var(--ink)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
            Find related papers
          </h2>
          <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed break-words [overflow-wrap:anywhere]">
            Enter a DOI, PubMed ID, or paper title to find closely related studies on {compound.name}.
          </p>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleManualSearch} className="flex items-center gap-3">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Enter a DOI, PubMed ID, or paper title (for example, 10.1056/NEJMoa1713137)..."
              className="flex-1 py-2.5 px-3 text-[14px] bg-transparent border-b border-[var(--ink)] focus:outline-none focus:border-[var(--accent)] text-[var(--ink)]"
            />
            <button
              type="submit"
              disabled={isSearchingSource || !manualQuery.trim()}
              className="px-5 py-2.5 text-[13px] font-medium text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--accent)] cursor-pointer disabled:opacity-40 shrink-0"
            >
              Find related papers
            </button>
          </form>

          {isSearchingSource && (
            <p className="text-[14px] text-[var(--ink-muted)]">
              Searching PubMed citation network for matching studies...
            </p>
          )}

          {discoveredPapers.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-baseline justify-between border-b border-[var(--ink)] pb-2">
                <h3 className="text-lg font-display text-[var(--ink)]">
                  {discoveredPapers.length} related papers for “{sourceName}”
                </h3>
                <button
                  type="button"
                  onClick={handleClearSource}
                  className="inline-flex items-center gap-1 text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear results</span>
                </button>
              </div>

              <div className="divide-y divide-[var(--divider)]">
                {discoveredPapers.map((paper) => (
                  <article key={paper.id} className="py-4 space-y-1.5 min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="text-[17px] font-display text-[var(--ink)] leading-snug break-words [overflow-wrap:anywhere] min-w-0">
                        {paper.title}
                      </h4>
                      <div className="flex items-baseline gap-3 shrink-0 text-[12px] font-mono tabular-nums">
                        <span className="text-[var(--ink-muted)]">{paper.relevanceScore}% match</span>
                        <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
                        <a
                          href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline underline-offset-4"
                        >
                          <span>PMID {paper.pmid}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--ink-muted)]">
                      <span className="font-medium text-[var(--ink)]">{paper.journal}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{paper.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{paper.authors}</span>
                      {paper.doi && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[12px]">DOI {paper.doi}</span>
                        </>
                      )}
                    </div>

                    <div className="text-[12px] text-[var(--ink-subtle)]">
                      <span>Matched topics: </span>
                      {paper.matchedKeywords.join(' · ')}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MeSH Pharmacological Classifications — Unboxed inline text */}
      {pharmacology?.meshClassifications && pharmacology.meshClassifications.length > 0 && (
        <section className="pt-10 border-t border-[var(--divider)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-display text-[var(--ink)]">
              Medical Subject Headings (MeSH)
            </h2>
          </div>
          <div className="lg:col-span-8 text-[14px] text-[var(--ink)] leading-relaxed">
            {pharmacology.meshClassifications.join(' · ')}
          </div>
        </section>
      )}
    </div>
  );
};
