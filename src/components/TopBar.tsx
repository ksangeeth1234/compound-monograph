import React, { useState } from 'react';
import { AppInfoModal } from './AppInfoModal';

interface Props {
  comparedCount: number;
  onOpenCompare: () => void;
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
  hasActiveTrace?: boolean;
  onExportAll?: () => void;
  onOpenWorkedExample?: () => void;
  onReset: () => void;
}

export const TopBar: React.FC<Props> = ({
  comparedCount,
  onOpenCompare,
  onOpenSidebar,
  isSidebarOpen,
  onExportAll,
  onOpenWorkedExample,
  onReset,
}) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <>
      <header
        className="h-16 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40 border-b border-[var(--divider)] bg-[var(--surface)]"
      >
        {/* Zone 1: Brand Title (Single text element wordmark) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onReset();
          }}
          className="text-[26px] font-display text-[var(--ink)] tracking-tight hover:opacity-75 transition-opacity whitespace-nowrap shrink-0"
          title="Return to start"
        >
          Compound Monograph
        </a>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav className="flex items-center gap-6 sm:gap-8 text-[14px] text-[var(--ink-muted)] overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={onReset}
            className="hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Start over
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className={`hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              comparedCount > 0 ? 'text-[var(--ink)] font-semibold underline' : ''
            }`}
          >
            Compare{comparedCount > 0 ? ` (${comparedCount})` : ''}
          </button>

          {onOpenWorkedExample && (
            <button
              type="button"
              onClick={onOpenWorkedExample}
              className="hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Lung cancer example
            </button>
          )}

          {onExportAll && (
            <button
              type="button"
              onClick={onExportAll}
              className="hidden xl:inline hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Download CSV
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInfoOpen(true)}
            className="hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            How this works
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenSidebar}
            className={`px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
              isSidebarOpen
                ? 'bg-[var(--ink)] text-[var(--surface)] border-[var(--ink)]'
                : 'bg-transparent text-[var(--ink)] border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]'
            }`}
          >
            {isSidebarOpen ? 'Close assistant' : 'Research assistant'}
          </button>
        </div>
      </header>

      <AppInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
};
