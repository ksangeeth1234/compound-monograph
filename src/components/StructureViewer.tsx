import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface Props {
  cid: number;
  name: string;
  smiles: string;
  molecularFormula: string;
  molecularWeight: number;
}

export const StructureViewer: React.FC<Props> = ({
  cid,
  name,
  smiles,
  molecularFormula,
  molecularWeight,
}) => {
  const [zoom, setZoom] = useState(1);
  const [invert, setInvert] = useState(false);
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=large`;

  const handleCopySmiles = () => {
    navigator.clipboard.writeText(smiles);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, '_')}_CID_${cid}_2D_structure.png`;
    link.target = '_blank';
    link.click();
  };

  return (
    <figure className="space-y-3">
      {/* Top caption & minimal controls */}
      <div className="flex items-center justify-between text-[12px] text-[var(--ink-muted)]">
        <span>2D skeletal structure · CID {cid}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
            className="p-1 hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-1 hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1 hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Reset zoom"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <span aria-hidden="true" className="text-[var(--divider)]">|</span>
          <button
            type="button"
            onClick={() => setInvert((v) => !v)}
            className="hover:text-[var(--ink)] hover:underline underline-offset-4 transition-colors cursor-pointer"
          >
            {invert ? 'Light background' : 'Invert contrast'}
          </button>
          <span aria-hidden="true" className="text-[var(--divider)]">|</span>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1 hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="Download PNG image"
            aria-label="Download PNG image"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Specimen Plate */}
      <div
        className="relative flex items-center justify-center p-6 h-72 overflow-hidden select-none border border-[var(--divider)]"
        style={{
          backgroundColor: invert ? '#141413' : '#FFFFFF',
        }}
      >
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="skeleton-shimmer w-44 h-44" />
          </div>
        )}

        {imgError ? (
          <div className="text-center p-4 space-y-2">
            <div className="text-[13px] font-medium text-[var(--ink-muted)]">2D structure diagram unavailable</div>
            <div className="text-[12px] font-mono text-[var(--ink-subtle)] max-w-xs break-all">
              {smiles || molecularFormula}
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`${name} 2D chemical structure`}
            className="max-h-full max-w-full object-contain transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${zoom})`,
              filter: invert ? 'invert(0.92) hue-rotate(180deg)' : 'none',
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Unboxed SMILES Caption Bar */}
      <figcaption className="flex items-baseline justify-between gap-4 text-[12px] text-[var(--ink-muted)] pt-1">
        <div className="truncate flex-1 min-w-0">
          <span className="text-[var(--ink-subtle)] mr-2">SMILES:</span>
          <span className="font-mono text-[var(--ink)] select-all" title={smiles}>
            {smiles || 'Not available'}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopySmiles}
          className="text-[12px] text-[var(--ink)] hover:text-[var(--accent)] underline underline-offset-4 transition-colors cursor-pointer shrink-0"
        >
          {copiedSmiles ? 'Copied' : 'Copy SMILES'}
        </button>
      </figcaption>
    </figure>
  );
};
