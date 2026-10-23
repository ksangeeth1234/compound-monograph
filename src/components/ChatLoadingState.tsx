import React, { useEffect, useState } from 'react';

interface ChatLoadingStateProps {
  customStatus?: string;
}

const STAGES = [
  'Looking up compound data...',
  'Checking PubChem records...',
  'Reviewing oral drug rules and lab tests...',
  'Writing response...',
];

export const ChatLoadingState: React.FC<ChatLoadingStateProps> = ({ customStatus }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (customStatus) return;

    const timer1 = setTimeout(() => setStageIndex(1), 2600);
    const timer2 = setTimeout(() => setStageIndex(2), 5500);
    const timer3 = setTimeout(() => setStageIndex(3), 8500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [customStatus]);

  const currentLabel = customStatus || STAGES[stageIndex];

  return (
    <div id="chat-loading-state" className="py-3 w-full space-y-3">
      <div className="space-y-2 w-full">
        <div className="h-3 w-[92%] skeleton-shimmer" />
        <div className="h-3 w-[68%] skeleton-shimmer" />
        <div className="h-3 w-[84%] skeleton-shimmer" />
      </div>

      <div className="text-[13px] text-[var(--ink-muted)] select-none">
        {currentLabel}
      </div>
    </div>
  );
};
