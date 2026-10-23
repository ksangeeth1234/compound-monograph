import React, { useState } from 'react';
import { CompoundDetails, ActiveTab } from '../types';
import { LipinskiBadge } from './LipinskiBadge';
import { StructureViewer } from './StructureViewer';
import { PropertiesTab } from './tabs/PropertiesTab';
import { BioactivityTab } from './tabs/BioactivityTab';
import { SimilarCompoundsTab } from './tabs/SimilarCompoundsTab';
import { LiteratureTab } from './tabs/LiteratureTab';
import { exportCompoundsToCSV } from '../utils/exportCsv';

interface Props {
  compound: CompoundDetails;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSelectCompound: (query: string) => void;
  onAddToCompare: (compound: CompoundDetails) => void;
  isCompared: boolean;
  onDiveDeeper?: (compoundName: string) => void;
}

export const CompoundCard: React.FC<Props> = ({
  compound,
  activeTab,
  onTabChange,
  onSelectCompound,
  onAddToCompare,
  isCompared,
  onDiveDeeper,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const tabs: { id: ActiveTab; label: string; count?: number }[] = [
    { id: 'properties', label: 'Chemical properties' },
    { id: 'bioactivity', label: 'How it works and lab tests', count: compound.bioassays.length },
    { id: 'similar', label: 'Similar compounds', count: compound.similarCompounds.length },
    { id: 'literature', label: 'Research papers and patents', count: compound.literature.length },
  ];

  const handleExportCSV = () => {
    exportCompoundsToCSV([compound], `${compound.name.replace(/\s+/g, '_')}_CID_${compound.cid}_properties.csv`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <article id={`compound-card-${compound.cid}`} className="space-y-12">
      {/* Unboxed Editorial Header */}
      <header className="space-y-4">
        {/* Quiet unboxed metadata line */}
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--ink-muted)] font-mono tabular-nums">
          <span>PubChem CID {compound.cid}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[var(--ink)] font-medium">{compound.properties.molecularFormula}</span>
          {compound.identifiers.casNumber && (
            <>
              <span aria-hidden="true">·</span>
              <span>CAS {compound.identifiers.casNumber}</span>
            </>
          )}
        </div>

        {/* Large Title & Primary Actions */}
        <div className="space-y-5">
          <div className="space-y-2.5 w-full min-w-0">
            <h1
              className={`${
                compound.name.length > 30
                  ? 'text-3xl sm:text-4xl lg:text-5xl leading-[1.12]'
                  : 'text-5xl sm:text-6xl leading-[1.03]'
              } font-display text-[var(--ink)] tracking-tight break-words [overflow-wrap:anywhere]`}
            >
              {compound.name}
            </h1>
            {compound.iupacName && (
              <p className="w-full max-w-4xl text-[14px] font-mono text-[var(--ink-muted)] leading-relaxed break-words [overflow-wrap:anywhere]">
                Systematic name: {compound.iupacName}
              </p>
            )}
            <div className="pt-1">
              <LipinskiBadge lipinski={compound.lipinski} properties={compound.properties} />
            </div>
          </div>

          {/* Clean Action Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {onDiveDeeper && (
              <button
                type="button"
                onClick={() => onDiveDeeper(compound.name)}
                title={`Ask assistant about ${compound.name}`}
                className="px-4 py-2 text-[13px] font-medium bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent)] transition-colors cursor-pointer max-w-full truncate"
              >
                Ask assistant about {compound.name.length > 32 ? `${compound.name.slice(0, 30)}…` : compound.name}
              </button>
            )}

            <button
              type="button"
              onClick={() => onAddToCompare(compound)}
              className={`px-4 py-2 text-[13px] font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                isCompared
                  ? 'border-[var(--ink)] bg-[var(--surface-muted)] text-[var(--ink)]'
                  : 'border-[var(--divider)] hover:border-[var(--ink)] text-[var(--ink)] bg-transparent'
              }`}
            >
              {isCompared ? 'Added to comparison' : 'Compare with other compounds'}
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 text-[13px] font-medium border border-[var(--divider)] hover:border-[var(--ink)] text-[var(--ink)] bg-transparent transition-colors cursor-pointer whitespace-nowrap"
            >
              {downloadSuccess ? 'CSV downloaded' : 'Download CSV'}
            </button>
          </div>
        </div>
      </header>

      {/* Asymmetric Specimen & Key Measurements Spread (Breaks out of boxed grid) */}
      <section className="pt-8 border-t-2 border-[var(--ink)] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left 5 Columns: 2D Structure Specimen */}
        <div className="lg:col-span-5">
          <StructureViewer
            cid={compound.cid}
            name={compound.name}
            smiles={compound.identifiers.canonicalSmiles}
            molecularFormula={compound.properties.molecularFormula}
            molecularWeight={compound.properties.molecularWeight}
          />
        </div>

        {/* Right 7 Columns: Open Typographic Ledger */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8">
            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Molecular weight</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.molecularWeight.toFixed(2)}
                <span className="text-[13px] font-sans text-[var(--ink-subtle)] ml-1.5">g/mol</span>
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Fat vs water solubility (LogP)</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.xlogp !== null ? compound.properties.xlogp.toFixed(2) : 'N/A'}
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Polar surface area (TPSA)</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.tpsa.toFixed(1)}
                <span className="text-[13px] font-sans text-[var(--ink-subtle)] ml-1.5">Å²</span>
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Hydrogen bond donors</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.hbd}
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Hydrogen bond acceptors</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.hba}
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-3">
              <span className="text-[13px] text-[var(--ink-muted)] block">Rotatable bonds</span>
              <div className="mt-1 text-3xl sm:text-[34px] font-mono tabular-nums text-[var(--ink)] leading-none">
                {compound.properties.rotatableBonds}
              </div>
            </div>
          </div>

          {/* Unboxed Registry Summary Row */}
          <div className="pt-4 border-t border-[var(--divider)] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-[13px]">
            <div className="truncate">
              <span className="text-[var(--ink-muted)] mr-2">Standard InChIKey:</span>
              <span className="font-mono text-[var(--ink)] select-all">{compound.identifiers.inchiKey}</span>
            </div>
            {compound.identifiers.casNumber && (
              <div className="font-mono text-[var(--ink-muted)] shrink-0">
                CAS Registry: {compound.identifiers.casNumber}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Navigation Tabs */}
      <div className="border-b border-[var(--ink)]">
        <nav className="flex items-center gap-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`pb-3.5 text-[15px] transition-colors relative cursor-pointer whitespace-nowrap border-b-2 -mb-[1px] ${
                  isSelected
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-1.5 text-[13px] font-mono tabular-nums text-[var(--ink-subtle)]">
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Section Content */}
      <div className="pt-2">
        {activeTab === 'properties' && <PropertiesTab compound={compound} />}
        {activeTab === 'bioactivity' && <BioactivityTab compound={compound} />}
        {activeTab === 'similar' && (
          <SimilarCompoundsTab
            similarCompounds={compound.similarCompounds}
            onSelectCompound={onSelectCompound}
            onAddToCompare={(similar) =>
              onAddToCompare({
                ...compound,
                cid: similar.cid,
                name: similar.name,
                iupacName: similar.name,
                properties: {
                  ...compound.properties,
                  molecularFormula: similar.molecularFormula,
                  molecularWeight: similar.molecularWeight,
                  xlogp: similar.xlogp,
                  tpsa: similar.tpsa,
                },
                identifiers: {
                  ...compound.identifiers,
                  cid: similar.cid,
                  name: similar.name,
                  canonicalSmiles: similar.canonicalSmiles,
                  synonyms: [],
                },
              })
            }
          />
        )}
        {activeTab === 'literature' && <LiteratureTab compound={compound} />}
      </div>
    </article>
  );
};
