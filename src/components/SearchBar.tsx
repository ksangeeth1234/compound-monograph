import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { SearchType } from '../types';
import { findPopularCompound } from '../data/popularCompounds';
import { POPULAR_DISEASE_CHIPS, isDiseaseQuery } from '../data/diseases';

interface SuggestionItem {
  name: string;
  type?: 'disease' | 'compound';
  diseaseId?: string;
  category?: string;
  target?: string;
  primaryCompound?: string;
  candidateCount?: number;
  cid?: number | null;
  formula?: string;
  mw?: number | null;
}

interface Props {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
  isZeroState?: boolean;
}

export const SearchBar: React.FC<Props> = ({
  onSearch,
  isLoading,
  initialQuery = '',
  isZeroState = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detectedType, setDetectedType] = useState<SearchType>('all');
  const [activeChipTab, setActiveChipTab] = useState<'diseases' | 'compounds'>('diseases');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const popularChips = [
    { label: 'Aspirin', query: 'Aspirin' },
    { label: 'Caffeine', query: 'Caffeine' },
    { label: 'Ibuprofen', query: 'Ibuprofen' },
    { label: 'Paracetamol', query: 'Acetaminophen' },
    { label: 'Dopamine', query: 'Dopamine' },
    { label: 'Atorvastatin', query: 'Atorvastatin' },
  ];

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Detect query type
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDetectedType('all');
      return;
    }
    if (/^\d+$/.test(trimmed)) {
      setDetectedType('cid');
    } else if (trimmed.startsWith('InChI=')) {
      setDetectedType('inchi');
    } else if (/[#=\(\)\[\]@\+\-]/.test(trimmed) && trimmed.length >= 3 && !trimmed.includes(' ')) {
      setDetectedType('smiles');
    } else if (isDiseaseQuery(trimmed)) {
      setDetectedType('disease');
    } else {
      setDetectedType('name');
    }
  }, [query]);

  // Autocomplete fetch with debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pubchem/autocomplete?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          if (data.suggestions?.length > 0 && document.activeElement?.id === 'pubchem-search-input') {
            setShowDropdown(true);
          }
        }
      } catch {
        // Non-blocking
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    onSearch(query.trim());
  };

  const handleSelectSuggestion = (suggestedName: string) => {
    setQuery(suggestedName);
    setShowDropdown(false);
    onSearch(suggestedName);
  };

  const getDetectedTypeLabel = (type: SearchType) => {
    switch (type) {
      case 'cid':
        return 'PubChem ID';
      case 'inchi':
        return 'InChI identifier';
      case 'smiles':
        return 'SMILES structure';
      case 'disease':
        return 'Health condition';
      case 'name':
        return 'Compound name';
      default:
        return '';
    }
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {isZeroState && (
        <div className="mb-8 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-display text-[var(--ink)] leading-[1.06] tracking-tight text-balance">
            Find facts, chemical structures, and lab results for any medicine or compound.
          </h1>
          <p className="mt-4 text-[17px] text-[var(--ink-muted)] leading-relaxed max-w-2xl">
            Search the NCBI PubChem database by medicine name, health condition, SMILES chemical notation, or PubChem identification number.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="pubchem-search-input" className="sr-only">
          Search by medicine, health condition, SMILES, or PubChem ID
        </label>
        <div className="flex items-center border-b-2 border-[var(--ink)] bg-transparent focus-within:border-[var(--accent)] transition-colors">
          <Search className="w-5 h-5 text-[var(--ink-muted)] mr-3 shrink-0" />

          <input
            type="text"
            id="pubchem-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder="Enter a condition (like Lung cancer), medicine (like Aspirin), SMILES, or CID..."
            className="flex-1 py-3.5 text-[17px] sm:text-[18px] bg-transparent focus:outline-none placeholder:text-[var(--ink-subtle)] text-[var(--ink)]"
          />

          {query.trim() && (
            <span className="text-[12px] text-[var(--ink-subtle)] mr-3 hidden sm:inline whitespace-nowrap">
              {getDetectedTypeLabel(detectedType)}
            </span>
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="p-2 mr-1 text-[var(--ink-subtle)] hover:text-[var(--ink)] cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 my-1.5 text-[14px] font-medium text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--accent)] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Search</span>
          </button>
        </div>

        {/* Autocomplete suggestions dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[var(--surface)] border border-[var(--ink)]">
            <div className="px-4 py-2 text-[12px] text-[var(--ink-muted)] border-b border-[var(--divider)] flex items-center justify-between bg-[var(--surface-sunken)]">
              <span>Matching conditions and chemical compounds</span>
              <span>Select to view record</span>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--divider)]">
              {suggestions.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  onClick={() => handleSelectSuggestion(item.name)}
                  className="px-4 py-3 flex items-baseline justify-between hover:bg-[var(--surface-muted)] cursor-pointer text-[14px] transition-colors"
                >
                  {item.type === 'disease' ? (
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--ink)]">{item.name}</span>
                        <span className="text-[12px] text-[var(--ink-muted)]">
                          · Health condition{item.category ? ` (${item.category})` : ''}
                        </span>
                      </div>
                      {item.target && (
                        <p className="text-[12px] text-[var(--ink-muted)]">
                          Biological target: {item.target} · Benchmark medicine: {item.primaryCompound}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium text-[var(--ink)]">{item.name}</span>
                      {item.formula && (
                        <span className="text-[12px] font-mono text-[var(--ink-muted)]">· {item.formula}</span>
                      )}
                    </div>
                  )}

                  {item.type === 'disease' ? (
                    <span className="text-[12px] text-[var(--accent)] shrink-0 ml-4">
                      View medicines →
                    </span>
                  ) : (
                    item.cid && (
                      <span className="text-[12px] font-mono text-[var(--ink-subtle)] shrink-0 ml-4 tabular-nums">
                        CID {item.cid}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Browse examples section */}
      {isZeroState ? (
        <div className="mt-12 space-y-6">
          <div className="flex items-baseline justify-between border-b border-[var(--divider)]">
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => setActiveChipTab('diseases')}
                className={`pb-3 text-[15px] transition-colors cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
                  activeChipTab === 'diseases'
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Browse by health condition
              </button>

              <button
                type="button"
                onClick={() => setActiveChipTab('compounds')}
                className={`pb-3 text-[15px] transition-colors cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
                  activeChipTab === 'compounds'
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Browse common medicines
              </button>
            </div>

            <span className="text-[13px] text-[var(--ink-subtle)] hidden sm:inline">
              Select any example to load its full chemical record
            </span>
          </div>

          {activeChipTab === 'diseases' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 pt-2">
              {POPULAR_DISEASE_CHIPS.map((disease) => (
                <button
                  key={disease.label}
                  type="button"
                  onClick={() => {
                    setQuery(disease.query);
                    onSearch(disease.query);
                  }}
                  className="pt-3 border-t border-[var(--divider)] hover:border-[var(--ink)] transition-colors text-left flex flex-col justify-between gap-1 group cursor-pointer"
                >
                  <span className="text-[17px] font-display text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                    {disease.label}
                  </span>
                  <span className="text-[13px] text-[var(--ink-muted)] group-hover:text-[var(--ink)] transition-colors">
                    View target and medicines →
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeChipTab === 'compounds' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 pt-2">
              {popularChips.map((chip) => {
                const compound = findPopularCompound(chip.query);
                if (!compound) return null;

                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => {
                      setQuery(chip.query);
                      onSearch(chip.query);
                    }}
                    className="text-left group cursor-pointer flex flex-col gap-2.5 pt-3 border-t border-[var(--divider)] hover:border-[var(--ink)] transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-[17px] font-display text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {chip.label}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--ink-subtle)] tabular-nums">
                        {compound.properties.molecularFormula}
                      </span>
                    </div>

                    <div className="w-full h-28 bg-white p-3 border border-[var(--divider)] group-hover:border-[var(--ink)] transition-colors flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG?image_size=large`}
                        alt={`${compound.name} 2D chemical structure`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[13px] text-[var(--ink-muted)]">
          <span className="text-[var(--ink-subtle)] shrink-0">Examples:</span>
          {POPULAR_DISEASE_CHIPS.slice(0, 4).map((disease, index) => (
            <React.Fragment key={disease.label}>
              {index > 0 && <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>}
              <button
                type="button"
                onClick={() => {
                  setQuery(disease.query);
                  onSearch(disease.query);
                }}
                className="hover:text-[var(--ink)] hover:underline underline-offset-4 cursor-pointer shrink-0"
              >
                {disease.label}
              </button>
            </React.Fragment>
          ))}
          <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
          {popularChips.slice(0, 4).map((chip, index) => (
            <React.Fragment key={chip.label}>
              {index > 0 && <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>}
              <button
                type="button"
                onClick={() => {
                  setQuery(chip.query);
                  onSearch(chip.query);
                }}
                className="hover:text-[var(--ink)] hover:underline underline-offset-4 cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
