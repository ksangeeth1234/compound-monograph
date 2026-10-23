import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
} from 'lucide-react';
import { AgentTrace, ChatMessage, CompoundDetails } from '../types';
import { ChatLoadingState } from './ChatLoadingState';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

const formatChemicalIdentifiers = (content: string) => {
  if (!content) return content;
  return content.replace(
    /\|\s*(\*\*)?(IUPAC Name|Isomeric SMILES|Canonical SMILES|InChIKey|InChI)(\*\*)?\s*\|\s*([^|\n]+?)\s*\|/gi,
    (match, b1, key, b2, value) => {
      const trimmed = value.trim();
      if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
        return match;
      }
      return `| ${b1 || ''}${key}${b2 || ''} | \`${trimmed}\` |`;
    }
  );
};

interface Props {
  trace: AgentTrace | null;
  isOpen: boolean;
  onToggle: () => void;
  onReplayTrace?: () => void;
  currentCid?: number;
  activeTab: 'chat' | 'trace';
  onTabChange: (tab: 'chat' | 'trace') => void;

  // Chat Props
  currentCompound: CompoundDetails | null;
  onSendQuery: (prompt: string) => Promise<void>;
  messages: ChatMessage[];
  isStreamingChat: boolean;
}

export const RightSidebar: React.FC<Props> = ({
  trace,
  isOpen,
  onToggle,
  onReplayTrace,
  currentCid,
  activeTab,
  onTabChange,
  currentCompound,
  onSendQuery,
  messages,
  isStreamingChat,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [input, setInput] = useState('');
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-3': true,
  });
  const [allExpanded, setAllExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const compoundName = currentCompound?.name || 'this compound';
  const defaultSuggestions = currentCompound
    ? [
        {
          label: 'How it works in the body',
          prompt: `Explain the mechanism of action of ${compoundName} and its primary biological target.`,
        },
        {
          label: 'Oral drug suitability',
          prompt: `Analyze ${compoundName}'s Lipinski Rule of 5 compliance, TPSA, and oral bioavailability.`,
        },
        {
          label: 'Improving the chemical structure',
          prompt: `Suggest bioisosteric modifications to optimize ${compoundName}'s binding potency and LogP.`,
        },
        {
          label: 'How the body processes it',
          prompt: `Detail the CYP450 metabolism, clearance pathways, and pharmacokinetic profile of ${compoundName}.`,
        },
      ]
    : [
        {
          label: 'Lipinski rule of 5',
          prompt: "How does Lipinski's Rule of 5 predict oral drug bioavailability?",
        },
        {
          label: 'Crossing the blood-brain barrier',
          prompt: 'What is TPSA and how does it correlate with blood-brain barrier permeability?',
        },
        {
          label: 'Overcoming drug resistance',
          prompt: 'How do EGFR kinase inhibitors like Osimertinib overcome resistance mutations?',
        },
        {
          label: 'Measuring structural similarity',
          prompt: 'Explain how Tanimoto structural similarity fingerprints work in PubChem.',
        },
      ];

  useEffect(() => {
    if (activeTab === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeTab, isStreamingChat]);

  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  if (!isOpen) {
    return null;
  }

  const toggleStep = (stepId: string) => {
    setExpandedStepIds((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleAllSteps = () => {
    if (!trace) return;
    const newState = !allExpanded;
    setAllExpanded(newState);
    const updated: Record<string, boolean> = {};
    trace.steps.forEach((s) => {
      updated[s.id] = newState;
    });
    setExpandedStepIds(updated);
  };

  const handleDownloadReport = () => {
    if (!trace) return;
    const reportData = trace.reportJson || {
      timestamp: trace.timestamp,
      query: trace.query,
      steps: trace.steps,
      targetCid: currentCid,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bondbase_report_cid_${currentCid || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isStreamingChat) return;
    const promptToSend = input.trim();
    setInput('');
    await onSendQuery(promptToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isStreamingChat) return;
    await onSendQuery(suggestion);
  };

  return (
    <aside
      id="cheminformatics-assistant-drawer"
      className="w-full sm:w-[440px] md:w-[480px] lg:w-[520px] shrink-0 h-full flex flex-col z-30 border-l border-[var(--ink)] bg-[var(--surface)] max-sm:fixed max-sm:inset-0 max-sm:z-50"
    >
      {/* Top Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[var(--divider)] shrink-0">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`py-5 text-[14px] transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'chat'
                ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            Research assistant
          </button>
          <button
            type="button"
            onClick={() => onTabChange('trace')}
            className={`py-5 text-[14px] transition-colors cursor-pointer border-b-2 -mb-[1px] ${
              activeTab === 'trace'
                ? 'border-[var(--ink)] text-[var(--ink)] font-semibold'
                : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            }`}
          >
            Search steps
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer shrink-0"
          title="Close panel"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'trace' ? (
          <>
            {!trace ? (
              <div className="flex-1 p-8 flex flex-col justify-center space-y-4">
                <h3 className="text-3xl font-display text-[var(--ink)]">
                  No search steps recorded yet
                </h3>
                <p className="text-[15px] text-[var(--ink-muted)] leading-relaxed">
                  Search for a chemical compound or ask a question in the assistant to see how records and calculations are retrieved from PubChem.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => onTabChange('chat')}
                    className="text-[14px] font-medium text-[var(--ink)] underline underline-offset-4 hover:text-[var(--accent)] cursor-pointer"
                  >
                    Switch to research assistant →
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-3 text-[13px] flex items-baseline justify-between border-b border-[var(--divider)] bg-[var(--surface-sunken)] shrink-0">
                  <div className="truncate flex-1 mr-4">
                    <span className="text-[var(--ink-muted)]">Query: </span>
                    <span className="font-mono font-medium text-[var(--ink)]">{trace.query || 'Compound lookup'}</span>
                  </div>
                  <div className="flex items-baseline gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={toggleAllSteps}
                      className="text-[12px] text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                    >
                      {allExpanded ? 'Collapse all' : 'Expand all'}
                    </button>
                    {trace.totalDurationMs ? (
                      <span className="text-[12px] font-mono tabular-nums text-[var(--ink-subtle)]">
                        {trace.totalDurationMs} ms
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[var(--divider)]">
                  {trace.steps.map((step, idx) => {
                    const isExpanded = Boolean(expandedStepIds[step.id] || allExpanded);

                    return (
                      <div key={step.id || idx} className="py-4 space-y-2">
                        <div
                          onClick={() => toggleStep(step.id)}
                          className="flex items-start justify-between gap-3 cursor-pointer select-none group"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="font-medium text-[14px] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                                {step.title}
                              </h4>
                              {step.durationMs && (
                                <span className="text-[12px] font-mono tabular-nums text-[var(--ink-subtle)] shrink-0">
                                  {step.durationMs} ms
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-[var(--ink-muted)] leading-relaxed">
                              {step.detail}
                            </p>
                          </div>

                          <div className="pt-1 text-[var(--ink-subtle)] shrink-0">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="pt-3 mt-2 space-y-3 border-t border-[var(--divider)] text-[12px]">
                            {step.toolName && (
                              <div className="font-mono text-[var(--ink-muted)]">
                                <span className="text-[var(--ink-subtle)]">Function: </span>
                                <span className="text-[var(--ink)]">{step.toolName}</span>
                              </div>
                            )}

                            {step.parameters && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-medium text-[var(--ink-muted)]">
                                  Input parameters
                                </div>
                                <pre className="p-3 bg-[var(--surface-sunken)] font-mono text-[11px] leading-relaxed overflow-x-auto text-[var(--ink)]">
                                  {typeof step.parameters === 'object'
                                    ? JSON.stringify(step.parameters, null, 2)
                                    : String(step.parameters)}
                                </pre>
                              </div>
                            )}

                            {step.output && (
                              <div className="space-y-1">
                                <div className="text-[11px] font-medium text-[var(--ink-muted)]">
                                  Returned data
                                </div>
                                <pre className="p-3 bg-[var(--surface-sunken)] font-mono text-[11px] leading-relaxed overflow-x-auto text-[var(--ink)]">
                                  {typeof step.output === 'object'
                                    ? JSON.stringify(step.output, null, 2)
                                    : String(step.output)}
                                </pre>
                              </div>
                            )}

                            {step.notes && (
                              <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed">
                                {step.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="py-4">
                    <button
                      type="button"
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="w-full py-1 text-[13px] font-medium flex items-center justify-between text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      <span>View raw JSON report (report.json)</span>
                      {showRawJson ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {showRawJson && (
                      <pre className="mt-3 p-3 bg-[var(--surface-sunken)] text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed text-[var(--ink)]">
                        {JSON.stringify(trace.reportJson || { steps: trace.steps }, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-[var(--divider)] shrink-0 text-[13px]">
                  {onReplayTrace && (
                    <button
                      type="button"
                      onClick={onReplayTrace}
                      className="text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                    >
                      Run steps again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="px-4 py-2 font-medium bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent)] transition-colors cursor-pointer ml-auto"
                  >
                    Download report.json
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          // CHAT TAB
          <div className="flex flex-col h-full min-h-0">
            <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
              {messages.length === 0 ? (
                <div className="space-y-8">
                  <div className="space-y-2 min-w-0">
                    <h3 className="text-3xl font-display text-[var(--ink)] leading-tight break-words [overflow-wrap:anywhere]">
                      {currentCompound
                        ? `Ask a question about ${compoundName}`
                        : 'Ask a chemistry or medicine question'}
                    </h3>
                    <p className="text-[15px] text-[var(--ink-muted)] leading-relaxed break-words [overflow-wrap:anywhere]">
                      {currentCompound
                        ? `Get clear explanations of how ${compoundName} works, how the body processes it, or how its structure relates to its effects.`
                        : 'Select a topic below or type your own question.'}
                    </p>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <div className="text-[12px] text-[var(--ink-subtle)]">
                      Suggested questions
                    </div>
                    <div className="divide-y divide-[var(--divider)] border-y border-[var(--divider)]">
                      {defaultSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(item.prompt)}
                          className="w-full py-3.5 text-left group cursor-pointer block min-w-0"
                        >
                          <div className="text-[12px] text-[var(--ink-muted)]">
                            {item.label}
                          </div>
                          <p className="text-[14px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors mt-0.5 break-words [overflow-wrap:anywhere]">
                            {item.prompt}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="w-full flex flex-col pb-6 border-b border-[var(--divider)] last:border-b-0 last:pb-0"
                    >
                      {msg.role === 'user' ? (
                        <div className="space-y-1.5">
                          <div className="text-[12px] font-semibold text-[var(--ink-muted)]">
                            You
                          </div>
                          <div className="text-[16px] font-medium text-[var(--ink)] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[12px] font-semibold text-[var(--ink-muted)]">
                              Research assistant
                            </span>
                            {msg.content.trim() ? (
                              <button
                                type="button"
                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                className="text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer"
                              >
                                {copiedId === msg.id ? 'Copied' : 'Copy text'}
                              </button>
                            ) : null}
                          </div>

                          <div>
                            {msg.isStreaming && !msg.content.trim() ? (
                              <ChatLoadingState />
                            ) : (
                              <div className="markdown-body overflow-x-hidden">
                                <div className="whitespace-pre-wrap break-words">
                                  <Markdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                                    {formatChemicalIdentifiers(msg.content)}
                                  </Markdown>
                                </div>
                                {msg.isStreaming && (
                                  <div className="mt-3 pt-2 border-t border-[var(--divider)] text-[12px] text-[var(--ink-muted)]">
                                    Writing response...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input & Quick Questions */}
            <div className="p-6 border-t border-[var(--ink)] bg-[var(--surface)] space-y-3 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap text-[12px] text-[var(--ink-muted)]">
                {[
                  { label: 'How it works', query: `What is the mechanism of action for ${compoundName}?` },
                  { label: 'Lipinski rules', query: `Evaluate Lipinski Rule of 5 and oral bioavailability for ${compoundName}.` },
                  { label: 'Metabolism', query: `How is ${compoundName} metabolized (CYP enzymes, half-life, active metabolites)?` },
                  { label: 'Key functional groups', query: `Identify the primary pharmacophores and functional binding groups in ${compoundName}.` },
                ].map((chip, index) => (
                  <React.Fragment key={chip.label}>
                    {index > 0 && <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>}
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(chip.query)}
                      className="hover:text-[var(--ink)] hover:underline underline-offset-4 cursor-pointer shrink-0"
                    >
                      {chip.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="space-y-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                  placeholder={`Ask a question about ${compoundName}...`}
                  className="w-full p-3 text-[14px] bg-[var(--surface-sunken)] border border-[var(--divider)] focus:border-[var(--ink)] focus:outline-none transition-colors resize-none min-h-[72px] text-[var(--ink)]"
                />
                <div className="flex items-center justify-between text-[12px] text-[var(--ink-subtle)]">
                  <span>Press Enter to send</span>
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreamingChat}
                    className="px-5 py-2 text-[13px] font-medium bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2"
                  >
                    {isStreamingChat ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Ask question</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
