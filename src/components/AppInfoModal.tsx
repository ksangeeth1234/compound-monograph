import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'guide' | 'rules'>('about');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[var(--surface)] border border-[var(--ink)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 flex items-start justify-between border-b border-[var(--divider)] shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              How Compound Monograph works
            </h2>
            <p className="text-[14px] text-[var(--ink-muted)] mt-0.5">
              Plain-English guide to looking up chemical compounds, structures, and oral drug rules.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 sm:px-8 flex gap-8 border-b border-[var(--divider)] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-3 text-[14px] border-b-2 -mb-[1px] transition-colors cursor-pointer ${
              activeTab === 'about'
                ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            What this tool does
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`py-3 text-[14px] border-b-2 -mb-[1px] transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            How to use it
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-3 text-[14px] border-b-2 -mb-[1px] transition-colors cursor-pointer ${
              activeTab === 'rules'
                ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            Oral drug rules explained
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 text-[15px] text-[var(--ink)] space-y-6 leading-relaxed">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <p className="text-[16px]">
                Compound Monograph looks up verified chemical and medical information from the <strong>National Center for Biotechnology Information (NCBI) PubChem</strong> database.
              </p>

              <div className="divide-y divide-[var(--divider)] border-y border-[var(--divider)]">
                <div className="py-4 space-y-1">
                  <h3 className="font-semibold text-[var(--ink)]">Search by name, condition, or formula</h3>
                  <p className="text-[14px] text-[var(--ink-muted)]">
                    Look up any medicine name, health condition, SMILES chemical string, InChIKey, or PubChem ID number.
                  </p>
                </div>

                <div className="py-4 space-y-1">
                  <h3 className="font-semibold text-[var(--ink)]">Check oral medicine suitability</h3>
                  <p className="text-[14px] text-[var(--ink-muted)]">
                    See immediately whether a compound meets Lipinski’s rule of 5 and Veber’s criteria for medicines taken by mouth.
                  </p>
                </div>

                <div className="py-4 space-y-1">
                  <h3 className="font-semibold text-[var(--ink)]">Review lab tests and similar molecules</h3>
                  <p className="text-[14px] text-[var(--ink-muted)]">
                    Inspect measured target binding strength (IC50 and EC50 values), find structurally related compounds, and export tables as CSV or JSON.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <ol className="divide-y divide-[var(--divider)] border-y border-[var(--divider)] list-decimal list-inside space-y-0">
              <li className="py-4">
                <strong className="font-semibold">Search for a compound or health condition</strong>
                <p className="text-[14px] text-[var(--ink-muted)] mt-1">
                  Enter a medicine name (like Aspirin or Osimertinib), a health condition (like Lung cancer), or choose an example on the start page.
                </p>
              </li>
              <li className="py-4">
                <strong className="font-semibold">Check the 2D structure and key measurements</strong>
                <p className="text-[14px] text-[var(--ink-muted)] mt-1">
                  Review molecular weight, fat vs water solubility (LogP), polar surface area (TPSA), and whether the compound passes Lipinski’s rules.
                </p>
              </li>
              <li className="py-4">
                <strong className="font-semibold">Compare or ask the research assistant</strong>
                <p className="text-[14px] text-[var(--ink-muted)] mt-1">
                  Add multiple molecules to the comparison table to view them side by side, or open the research assistant to ask questions in plain English.
                </p>
              </li>
            </ol>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-display text-[var(--ink)]">
                  Lipinski’s rule of 5
                </h3>
                <p className="text-[14px] text-[var(--ink-muted)]">
                  Most medicines taken as a pill need to dissolve in the stomach and pass through the intestinal wall into the blood. Chemist Christopher Lipinski found that oral medicines usually meet at least 3 of these 4 limits:
                </p>
                <ul className="list-disc pl-5 text-[14px] space-y-1.5 pt-1">
                  <li><strong>Molecular weight of 500 Da or less</strong> — small enough to pass through cell membranes.</li>
                  <li><strong>LogP of 5.0 or less</strong> — balanced between dissolving in water and dissolving in fats.</li>
                  <li><strong>5 or fewer hydrogen bond donors</strong> — too many OH or NH groups make it harder to cross cell walls.</li>
                  <li><strong>10 or fewer hydrogen bond acceptors</strong> — too many oxygen or nitrogen atoms hold tightly to water.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--divider)] space-y-2">
                <h3 className="text-xl font-display text-[var(--ink)]">
                  Veber’s oral availability rules
                </h3>
                <p className="text-[14px] text-[var(--ink-muted)]">
                  Daniel Veber showed that molecules are also absorbed better by mouth when they have <strong>10 or fewer rotatable bonds</strong> (less floppy) and a <strong>polar surface area (TPSA) of 140 Å² or less</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-[var(--divider)] bg-[var(--surface-sunken)] flex items-center justify-between shrink-0">
          <span className="text-[13px] text-[var(--ink-muted)]">
            Data source: NCBI PubChem PUG REST API
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
