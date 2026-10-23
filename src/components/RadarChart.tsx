import React from 'react';
import { MolecularProperties } from '../types';

interface Props {
  properties: MolecularProperties;
  compoundName?: string;
  size?: number;
}

export const RadarChart: React.FC<Props> = ({ properties, compoundName = 'Compound', size = 280 }) => {
  const center = size / 2;
  const radius = center - 44;

  const axes = [
    {
      name: 'Weight',
      label: 'MW (≤500)',
      val: properties.molecularWeight,
      norm: Math.min(properties.molecularWeight / 600, 1),
      thresholdNorm: 500 / 600,
      unit: 'Da',
    },
    {
      name: 'LogP',
      label: 'LogP (≤5.0)',
      val: properties.xlogp ?? 0,
      norm: Math.min(Math.max(((properties.xlogp ?? 0) + 2) / 8, 0.05), 1),
      thresholdNorm: (5.0 + 2) / 8,
      unit: '',
    },
    {
      name: 'TPSA',
      label: 'TPSA (≤140)',
      val: properties.tpsa,
      norm: Math.min(properties.tpsa / 180, 1),
      thresholdNorm: 140 / 180,
      unit: 'Å²',
    },
    {
      name: 'Rot. bonds',
      label: 'RotB (≤10)',
      val: properties.rotatableBonds,
      norm: Math.min(properties.rotatableBonds / 15, 1),
      thresholdNorm: 10 / 15,
      unit: '',
    },
    {
      name: 'Donors',
      label: 'HBD (≤5)',
      val: properties.hbd,
      norm: Math.min(properties.hbd / 8, 1),
      thresholdNorm: 5 / 8,
      unit: '',
    },
    {
      name: 'Acceptors',
      label: 'HBA (≤10)',
      val: properties.hba,
      norm: Math.min(properties.hba / 15, 1),
      thresholdNorm: 10 / 15,
      unit: '',
    },
  ];

  const count = axes.length;
  const angleStep = (Math.PI * 2) / count;

  const compoundPoints = axes
    .map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = axis.norm * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  const thresholdPoints = axes
    .map((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = axis.thresholdNorm * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <figure className="flex flex-col items-center justify-center py-2">
      <div className="w-full flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[var(--divider)] text-[12px] text-[var(--ink-muted)]">
        <span className="font-medium text-[var(--ink)]">Oral drug suitability radar</span>
        <div className="flex items-center gap-3 min-w-0 max-w-full">
          <span className="truncate max-w-[180px]" title={compoundName}>
            Solid line: {compoundName}
          </span>
          <span aria-hidden="true">·</span>
          <span className="shrink-0">Dashed line: Lipinski limit</span>
        </div>
      </div>

      <svg width={size} height={size} className="overflow-visible my-4">
        {gridLevels.map((lvl) => {
          const poly = axes
            .map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = lvl * radius;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');

          return <polygon key={lvl} points={poly} fill="none" stroke="var(--divider)" strokeWidth="1" />;
        })}

        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={axis.name}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="var(--divider)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Drug-like boundary reference polygon */}
        <polygon
          points={thresholdPoints}
          fill="rgba(21, 94, 43, 0.06)"
          stroke="var(--ok)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />

        {/* Actual Compound Data polygon */}
        <polygon
          points={compoundPoints}
          fill="rgba(29, 78, 216, 0.14)"
          stroke="var(--accent)"
          strokeWidth="2"
        />

        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = axis.norm * radius;
          const cx = center + r * Math.cos(angle);
          const cy = center + r * Math.sin(angle);
          return (
            <circle
              key={axis.name}
              cx={cx}
              cy={cy}
              r="3.5"
              fill="var(--accent)"
              stroke="var(--surface)"
              strokeWidth="1.5"
            />
          );
        })}

        {axes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 24;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <g key={axis.name} transform={`translate(${lx}, ${ly})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[11px] font-medium"
                fill="var(--ink)"
              >
                {axis.name}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y="13"
                className="text-[11px] font-mono tabular-nums"
                fill="var(--ink-muted)"
              >
                {typeof axis.val === 'number'
                  ? Number.isInteger(axis.val)
                    ? axis.val
                    : axis.val.toFixed(1)
                  : axis.val}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
};
