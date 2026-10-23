import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Search } from 'lucide-react';
import { Dataset } from '../types';
import {
  parseCSVToDataset,
  parseSDFToDataset,
  parsePastedListToDataset,
  exportDatasetToCSV,
  exportDatasetToJSON,
  saveDatasetsToStorage,
  resetToDefaultDatasets,
} from '../utils/datasetStorage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  datasets: Dataset[];
  onUpdateDatasets: (datasets: Dataset[]) => void;
  onSelectCompoundForExplore: (query: string) => void;
  onAddToCompare: (compoundQuery: string) => void;
  comparedIds?: (string | number)[];
}

export const DatasetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  datasets,
  onUpdateDatasets,
  onSelectCompoundForExplore,
  onAddToCompare,
  comparedIds = [],
}) => {
  const [activeDatasetId, setActiveDatasetId] = useState<string>(datasets[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'view' | 'import'>('view');

  const [searchFilter, setSearchFilter] = useState('');
  const [lipinskiFilter, setLipinskiFilter] = useState<'all' | 'pass' | 'fail'>('all');

  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [newDatasetTitle, setNewDatasetTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichSuccessMessage, setEnrichSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  const filteredItems = (currentDataset?.items || []).filter((item) => {
    const matchesSearch =
      !searchFilter.trim() ||
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.smiles.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.cid && String(item.cid).includes(searchFilter)) ||
      (item.customProperties &&
        Object.values(item.customProperties).some((v) =>
          String(v).toLowerCase().includes(searchFilter.toLowerCase())
        ));

    if (!matchesSearch) return false;

    if (lipinskiFilter === 'pass') {
      return item.isCompliant !== false;
    }
    if (lipinskiFilter === 'fail') {
      return item.isCompliant === false || (item.lipinskiViolations !== undefined && item.lipinskiViolations > 1);
    }
    return true;
  });

  const totalItems = currentDataset?.items.length || 0;
  const compliantCount = (currentDataset?.items || []).filter((i) => i.isCompliant !== false).length;
  const passRate = totalItems > 0 ? Math.round((compliantCount / totalItems) * 100) : 0;

  const itemsWithMw = (currentDataset?.items || []).filter((i) => i.molecularWeight !== undefined);
  const avgMw =
    itemsWithMw.length > 0
      ? (itemsWithMw.reduce((acc, i) => acc + (i.molecularWeight || 0), 0) / itemsWithMw.length).toFixed(1)
      : '—';

  const itemsWithLogp = (currentDataset?.items || []).filter((i) => i.xlogp !== undefined && i.xlogp !== null);
  const avgLogp =
    itemsWithLogp.length > 0
      ? (itemsWithLogp.reduce((acc, i) => acc + (i.xlogp || 0), 0) / itemsWithLogp.length).toFixed(2)
      : '—';

  const handleFileUpload = (file: File) => {
    setImportError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let newDataset: Dataset;

        if (file.name.endsWith('.sdf') || file.name.endsWith('.mol')) {
          newDataset = parseSDFToDataset(text, file.name);
        } else if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (parsed && parsed.items && Array.isArray(parsed.items)) {
            newDataset = parsed;
          } else {
            throw new Error('JSON file is not a valid compound list format.');
          }
        } else {
          newDataset = parseCSVToDataset(text, file.name);
        }

        const updated = [newDataset, ...datasets];
        onUpdateDatasets(updated);
        saveDatasetsToStorage(updated);
        setActiveDatasetId(newDataset.id);
        setActiveTab('view');
      } catch (err: any) {
        setImportError(err.message || 'Could not read that file. Please check that it is a valid CSV, SDF, or JSON file.');
      }
    };

    reader.onerror = () => {
      setImportError('Could not read file from disk.');
    };

    reader.readAsText(file);
  };

  const handlePastedImport = () => {
    if (!pastedText.trim()) {
      setImportError('Paste at least one compound name, SMILES string, or PubChem ID.');
      return;
    }

    try {
      const newDataset = parsePastedListToDataset(
        pastedText,
        newDatasetTitle.trim() || 'Custom compound list'
      );
      const updated = [newDataset, ...datasets];
      onUpdateDatasets(updated);
      saveDatasetsToStorage(updated);
      setActiveDatasetId(newDataset.id);
      setPastedText('');
      setNewDatasetTitle('');
      setActiveTab('view');
    } catch (err: any) {
      setImportError(err.message || 'Could not parse the pasted list.');
    }
  };

  const handleDeleteDataset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (datasets.length <= 1) {
      return;
    }
    const filtered = datasets.filter((d) => d.id !== id);
    onUpdateDatasets(filtered);
    saveDatasetsToStorage(filtered);
    if (activeDatasetId === id) {
      setActiveDatasetId(filtered[0]?.id || '');
    }
  };

  const handleEnrichCurrentDataset = async () => {
    if (!currentDataset || isEnriching) return;
    setIsEnriching(true);
    setEnrichSuccessMessage(null);

    try {
      const res = await fetch('/api/datasets/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentDataset.items }),
      });

      if (!res.ok) {
        throw new Error('Server returned an error while looking up PubChem properties.');
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const updatedDataset: Dataset = {
          ...currentDataset,
          items: data.items,
          updatedAt: new Date().toISOString(),
        };

        const updatedAll = datasets.map((d) => (d.id === updatedDataset.id ? updatedDataset : d));
        onUpdateDatasets(updatedAll);
        saveDatasetsToStorage(updatedAll);
        setEnrichSuccessMessage(`Updated ${data.items.length} compounds with PubChem measurements.`);
        setTimeout(() => setEnrichSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setImportError(err.message || 'Could not reach PubChem enrichment service.');
    } finally {
      setIsEnriching(false);
    }
  };

  const handleResetSamples = () => {
    const reset = resetToDefaultDatasets();
    onUpdateDatasets(reset);
    setActiveDatasetId(reset[0]?.id || '');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] flex flex-col bg-[var(--surface)] border border-[var(--ink)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 flex items-start justify-between gap-4 border-b border-[var(--divider)] shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
              Saved compound lists
            </h2>
            <p className="text-[14px] text-[var(--ink-muted)] mt-0.5">
              Browse curated groups of medicines, upload your own CSV or SDF files, and fetch missing PubChem measurements in bulk.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-4 text-[14px]">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className={`cursor-pointer transition-colors ${
                  activeTab === 'view'
                    ? 'font-semibold text-[var(--ink)] underline underline-offset-4 decoration-2'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Browse lists ({datasets.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`cursor-pointer transition-colors ${
                  activeTab === 'import'
                    ? 'font-semibold text-[var(--ink)] underline underline-offset-4 decoration-2'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Import a new list
              </button>
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
        </div>

        {/* Tab 1: Browse Lists */}
        {activeTab === 'view' && (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-full md:w-72 border-r border-[var(--divider)] shrink-0 flex flex-col bg-[var(--surface-sunken)] overflow-y-auto">
              <div className="px-5 py-3 border-b border-[var(--divider)] flex items-baseline justify-between text-[12px]">
                <span className="font-semibold text-[var(--ink-muted)]">Available lists</span>
                <button
                  type="button"
                  onClick={handleResetSamples}
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                >
                  Restore defaults
                </button>
              </div>

              <div className="divide-y divide-[var(--divider)] flex-1">
                {datasets.map((d) => {
                  const isSelected = d.id === currentDataset?.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setActiveDatasetId(d.id)}
                      className={`px-5 py-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[var(--surface)]'
                          : 'hover:bg-[var(--surface-muted)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[15px] leading-snug ${
                            isSelected ? 'font-semibold text-[var(--ink)]' : 'text-[var(--ink)]'
                          }`}
                        >
                          {d.name}
                        </span>
                        {d.source === 'upload' && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteDataset(d.id, e)}
                            className="text-[var(--ink-subtle)] hover:text-[var(--fail)] p-0.5 cursor-pointer"
                            title="Delete list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-[12px] text-[var(--ink-muted)] line-clamp-2 mt-1">
                        {d.description}
                      </p>

                      <div className="mt-2 text-[12px] font-mono tabular-nums text-[var(--ink-subtle)]">
                        {d.items.length} compounds · {d.source}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-[var(--divider)]">
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="w-full py-2 px-3 text-[13px] font-medium border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] transition-colors cursor-pointer"
                >
                  Import a new list
                </button>
              </div>
            </div>

            {/* Right Pane */}
            <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface)] overflow-y-auto">
              {currentDataset ? (
                <>
                  <div className="p-6 border-b border-[var(--divider)] space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-[12px] text-[var(--ink-muted)]">
                          {currentDataset.items.length} compounds
                          {currentDataset.tags.length > 0 && ` · ${currentDataset.tags.join(' · ')}`}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-display text-[var(--ink)]">
                          {currentDataset.name}
                        </h3>
                        <p className="text-[14px] text-[var(--ink-muted)] max-w-2xl">
                          {currentDataset.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap shrink-0 text-[13px]">
                        <button
                          type="button"
                          onClick={handleEnrichCurrentDataset}
                          disabled={isEnriching}
                          className="px-4 py-2 font-medium bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {isEnriching ? 'Updating from PubChem...' : 'Fetch missing PubChem data'}
                        </button>

                        <button
                          type="button"
                          onClick={() => exportDatasetToCSV(currentDataset)}
                          className="px-3 py-2 border border-[var(--divider)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
                        >
                          Download CSV
                        </button>

                        <button
                          type="button"
                          onClick={() => exportDatasetToJSON(currentDataset)}
                          className="px-3 py-2 border border-[var(--divider)] hover:border-[var(--ink)] text-[var(--ink)] cursor-pointer"
                        >
                          Download JSON
                        </button>
                      </div>
                    </div>

                    {enrichSuccessMessage && (
                      <p className="text-[13px] font-medium text-[var(--ok)]">
                        {enrichSuccessMessage}
                      </p>
                    )}

                    {/* Open Tabular Summary Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[var(--divider)]">
                      <div>
                        <span className="text-[12px] text-[var(--ink-muted)] block">Total compounds</span>
                        <span className="text-2xl font-mono tabular-nums text-[var(--ink)]">
                          {totalItems}
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] text-[var(--ink-muted)] block">Pass Lipinski rules</span>
                        <span className="text-2xl font-mono tabular-nums text-[var(--ok)]">
                          {passRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] text-[var(--ink-muted)] block">Average weight</span>
                        <span className="text-2xl font-mono tabular-nums text-[var(--ink)]">
                          {avgMw} <span className="text-[12px] font-sans text-[var(--ink-subtle)]">Da</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[12px] text-[var(--ink-muted)] block">Average LogP</span>
                        <span className="text-2xl font-mono tabular-nums text-[var(--ink)]">
                          {avgLogp}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="px-6 py-3 border-b border-[var(--divider)] bg-[var(--surface-sunken)] flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                      <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Filter by compound name, SMILES, or CID..."
                        className="w-full pl-6 pr-6 py-1 text-[13px] bg-transparent border-b border-[var(--divider)] focus:border-[var(--ink)] focus:outline-none text-[var(--ink)]"
                      />
                      {searchFilter && (
                        <button
                          type="button"
                          onClick={() => setSearchFilter('')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[13px]">
                      <span className="text-[var(--ink-subtle)]">Show:</span>
                      {(
                        [
                          { id: 'all', label: `All (${currentDataset.items.length})` },
                          { id: 'pass', label: 'Passes Lipinski' },
                          { id: 'fail', label: 'Exceeds limits' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setLipinskiFilter(f.id)}
                          className={`cursor-pointer ${
                            lipinskiFilter === f.id
                              ? 'font-semibold text-[var(--ink)] underline underline-offset-4 decoration-2'
                              : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compounds Table */}
                  <div className="flex-1 overflow-x-auto px-6 py-2">
                    <table className="w-full text-left border-collapse text-[13px]">
                      <thead>
                        <tr className="border-b-2 border-[var(--ink)] text-[12px] text-[var(--ink-muted)]">
                          <th className="py-3 pr-4 font-semibold">Compound</th>
                          <th className="py-3 px-3 font-semibold">SMILES</th>
                          <th className="py-3 px-3 text-right font-semibold">Weight</th>
                          <th className="py-3 px-3 text-right font-semibold">LogP</th>
                          <th className="py-3 px-3 text-right font-semibold">TPSA</th>
                          <th className="py-3 px-3 text-center font-semibold">Donors / Acceptors</th>
                          <th className="py-3 px-3 font-semibold">Lipinski</th>
                          <th className="py-3 px-3 font-semibold">Notes</th>
                          <th className="py-3 pl-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--divider)]">
                        {filteredItems.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-12 text-center text-[var(--ink-muted)]">
                              No compounds match your filter.
                            </td>
                          </tr>
                        ) : (
                          filteredItems.map((item) => {
                            const isAlreadyCompared =
                              (item.cid && comparedIds.includes(item.cid)) ||
                              comparedIds.includes(item.name.toLowerCase());

                            return (
                              <tr key={item.id} className="hover:bg-[var(--surface-sunken)] transition-colors">
                                <td className="py-3 pr-4">
                                  <div className="font-semibold text-[var(--ink)]">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] font-mono tabular-nums text-[var(--ink-muted)]">
                                    {item.cid ? `CID ${item.cid}` : ''}
                                    {item.cid && item.formula ? ' · ' : ''}
                                    {item.formula || ''}
                                  </div>
                                </td>

                                <td className="py-3 px-3 max-w-[180px] font-mono text-[12px] text-[var(--ink-muted)]">
                                  <span className="block truncate select-all" title={item.smiles}>
                                    {item.smiles || '—'}
                                  </span>
                                </td>

                                <td className="py-3 px-3 text-right font-mono tabular-nums text-[var(--ink)]">
                                  {item.molecularWeight !== undefined ? item.molecularWeight.toFixed(1) : '—'}
                                </td>

                                <td className="py-3 px-3 text-right font-mono tabular-nums text-[var(--ink)]">
                                  {item.xlogp !== undefined && item.xlogp !== null ? item.xlogp.toFixed(2) : '—'}
                                </td>

                                <td className="py-3 px-3 text-right font-mono tabular-nums text-[var(--ink)]">
                                  {item.tpsa !== undefined ? item.tpsa.toFixed(1) : '—'}
                                </td>

                                <td className="py-3 px-3 text-center font-mono tabular-nums text-[var(--ink-muted)]">
                                  {item.hbd !== undefined && item.hba !== undefined
                                    ? `${item.hbd} / ${item.hba}`
                                    : '—'}
                                </td>

                                <td className="py-3 px-3 whitespace-nowrap">
                                  {item.lipinskiViolations !== undefined ? (
                                    item.lipinskiViolations === 0 ? (
                                      <span className="text-[var(--ok)] font-medium">Passes (0)</span>
                                    ) : item.lipinskiViolations === 1 ? (
                                      <span className="text-[var(--warn)] font-medium">Passes (1)</span>
                                    ) : (
                                      <span className="text-[var(--fail)] font-medium">
                                        {item.lipinskiViolations} exceptions
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-[var(--ink-subtle)]">—</span>
                                  )}
                                </td>

                                <td className="py-3 px-3 max-w-[180px] text-[12px]">
                                  {item.customProperties ? (
                                    <div className="space-y-0.5">
                                      {Object.entries(item.customProperties)
                                        .slice(0, 2)
                                        .map(([k, v]) => (
                                          <div key={k} className="truncate">
                                            <span className="text-[var(--ink-muted)]">{k}: </span>
                                            <span className="font-mono text-[var(--ink)]">{String(v)}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <span className="text-[var(--ink-subtle)]">—</span>
                                  )}
                                </td>

                                <td className="py-3 pl-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-3 text-[12px]">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSelectCompoundForExplore(item.cid ? String(item.cid) : item.name);
                                        onClose();
                                      }}
                                      className="font-medium text-[var(--ink)] hover:text-[var(--accent)] underline underline-offset-4 cursor-pointer"
                                    >
                                      Open
                                    </button>
                                    <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>
                                    <button
                                      type="button"
                                      onClick={() => onAddToCompare(item.cid ? String(item.cid) : item.name)}
                                      disabled={isAlreadyCompared}
                                      className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer disabled:opacity-40 disabled:no-underline"
                                    >
                                      {isAlreadyCompared ? 'Added' : 'Compare'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-xl font-display text-[var(--ink)]">Select a compound list on the left</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Import New List */}
        {activeTab === 'import' && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-6">
            <div>
              <h3 className="text-2xl font-display text-[var(--ink)]">
                Import a compound list
              </h3>
              <p className="text-[14px] text-[var(--ink-muted)] mt-1">
                Upload a CSV, TSV, SDF, or JSON file, or paste a list of compound names, SMILES strings, or PubChem IDs.
              </p>
            </div>

            <div className="flex items-center gap-6 border-b border-[var(--divider)]">
              <button
                type="button"
                onClick={() => {
                  setImportMode('file');
                  setImportError(null);
                }}
                className={`pb-3 text-[14px] cursor-pointer border-b-2 -mb-[1px] ${
                  importMode === 'file'
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Upload a file (CSV, SDF, JSON)
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMode('paste');
                  setImportError(null);
                }}
                className={`pb-3 text-[14px] cursor-pointer border-b-2 -mb-[1px] ${
                  importMode === 'paste'
                    ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                    : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
                }`}
              >
                Paste names or SMILES
              </button>
            </div>

            {importError && (
              <p className="text-[14px] font-medium text-[var(--fail)]">
                {importError}
              </p>
            )}

            {importMode === 'file' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,.tsv,.txt,.sdf,.mol,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed p-10 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-[var(--accent)] bg-[var(--surface-accent)]'
                      : 'border-[var(--ink-subtle)] hover:border-[var(--ink)] bg-[var(--surface-sunken)]'
                  }`}
                >
                  <Upload className="w-6 h-6 text-[var(--ink-muted)]" />
                  <p className="text-[15px] font-medium text-[var(--ink)]">
                    Choose a file or drag and drop it here
                  </p>
                  <p className="text-[13px] text-[var(--ink-muted)]">
                    Accepts .csv, .tsv, .sdf, and .json files
                  </p>
                </div>

                <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                  Column headers such as <code className="font-mono text-[var(--ink)]">SMILES</code>, <code className="font-mono text-[var(--ink)]">Name</code>, <code className="font-mono text-[var(--ink)]">CID</code>, <code className="font-mono text-[var(--ink)]">MW</code>, and <code className="font-mono text-[var(--ink)]">LogP</code> are recognized automatically.
                </p>
              </div>
            )}

            {importMode === 'paste' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink)] mb-1">
                    List name
                  </label>
                  <input
                    type="text"
                    value={newDatasetTitle}
                    onChange={(e) => setNewDatasetTitle(e.target.value)}
                    placeholder="For example, Kinase screening batch 1"
                    className="w-full px-3 py-2 text-[14px] bg-[var(--surface)] border border-[var(--divider)] focus:border-[var(--ink)] focus:outline-none text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[var(--ink)] mb-1">
                    Compounds (one per line: name, CID, or Name, SMILES)
                  </label>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Gefitinib, COC1=C(C=C2C(=C1)N=CN=C2NC3=CC(=C(C=C3)F)Cl)OCCCN4CCOCC4&#10;Erlotinib&#10;2244&#10;Aspirin"
                    className="w-full p-3 text-[13px] font-mono bg-[var(--surface)] border border-[var(--divider)] focus:border-[var(--ink)] focus:outline-none text-[var(--ink)]"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('view')}
                    className="px-4 py-2 text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePastedImport}
                    disabled={!pastedText.trim()}
                    className="px-5 py-2 text-[13px] font-medium text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--accent)] disabled:opacity-40 cursor-pointer"
                  >
                    Save compound list
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3.5 border-t border-[var(--divider)] bg-[var(--surface-sunken)] flex items-center justify-between text-[13px] text-[var(--ink-muted)] shrink-0">
          <span>Saved lists are kept in your browser so you can return to them later.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 font-medium text-[var(--surface)] bg-[var(--ink)] hover:opacity-90 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
