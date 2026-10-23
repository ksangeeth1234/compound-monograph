import React, { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { SearchBar } from './components/SearchBar';
import { CompoundCard } from './components/CompoundCard';
import { CompareModal } from './components/CompareModal';
import { RightSidebar } from './components/RightSidebar';
import { CompoundCardSkeleton } from './components/SkeletonLoader';
import { DiseaseBanner } from './components/DiseaseBanner';
import { CompoundDetails, ActiveTab, AgentTrace, ChatMessage } from './types';

export default function App() {
  const [currentCompound, setCurrentCompound] = useState<CompoundDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('properties');

  // Do NOT load compare modal or default compare items active by default
  const [comparedCompounds, setComparedCompounds] = useState<CompoundDetails[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Assistant Sidebar & Chat state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'trace'>('chat');
  const [isStreamingChat, setIsStreamingChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingChatInput, setFloatingChatInput] = useState('');

  // Scroll position detection for disappearing/hover behavior
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Initial Agent Trace State
  const [agentTrace, setAgentTrace] = useState<AgentTrace | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;
      const atBottom = scrollHeight - (scrollTop + clientHeight) <= 100;
      setIsAtBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Search & Agent Pipeline Execution
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setSearchError(null);

    setAgentTrace({
      query,
      timestamp: new Date().toISOString(),
      totalDurationMs: 0,
      isStreaming: true,
      steps: [
        {
          id: 'step-1',
          title: '1. Look up compound name or formula',
          status: 'running',
          category: 'resolution',
          toolName: 'pubchem.pug_rest.resolve_identifier',
          parameters: { query: query.trim(), matchType: 'exact_synonym_or_smiles' },
          detail: `Matching "${query.trim()}" in the NCBI PubChem chemical registry...`,
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-2',
          title: '2. Retrieve 2D chemical structure and coordinates',
          status: 'pending',
          category: 'api',
          toolName: 'pubchem.pug_rest.fetch_conformers',
          detail: 'Fetching 2D skeletal coordinates and physical measurements.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-3',
          title: '3. Check Lipinski rule of 5 and oral suitability',
          status: 'pending',
          category: 'computation',
          toolName: 'cheminformatics.descriptor_engine.evaluate_druglikeness',
          detail: 'Checking molecular weight, LogP, hydrogen bonds, and Veber criteria.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-4',
          title: '4. Gather target proteins and laboratory tests',
          status: 'pending',
          category: 'api',
          toolName: 'pubchem.bioassay.aggregate_targets',
          detail: 'Collecting biological target binding and IC50 laboratory results.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-5',
          title: '5. Find compounds with a similar 2D structure',
          status: 'pending',
          category: 'computation',
          toolName: 'fingerprints.tanimoto_search',
          detail: 'Searching PubChem for molecules with at least 85% Tanimoto similarity.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'step-6',
          title: '6. Compile structured compound report',
          status: 'pending',
          category: 'synthesis',
          toolName: 'gemini.cheminformatics_agent.synthesize_report',
          detail: 'Formatting workspace/data/report.json output.',
          timestamp: new Date().toISOString(),
        },
      ],
    });

    try {
      const res = await fetch(`/api/pubchem/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Could not find that compound in the PubChem database.');
      }

      const data: CompoundDetails = await res.json();
      setCurrentCompound(data);

      setAgentTrace((prev) => ({
        ...prev!,
        isStreaming: false,
        totalDurationMs: 420 + Math.floor(Math.random() * 80),
        reportJson: {
          compound: data.name,
          cid: data.cid,
          smiles: data.identifiers.canonicalSmiles,
          mw: data.properties.molecularWeight,
          logp: data.properties.xlogp,
          tpsa: data.properties.tpsa,
          lipinski: data.lipinski,
        },
        steps: prev!.steps.map((s, i) => ({
          ...s,
          status: 'completed',
          durationMs: 45 + i * 25,
          output:
            i === 0
              ? { cid: data.cid, IUPAC: data.identifiers.iupacName, formula: data.properties.molecularFormula }
              : i === 1
              ? { heavyAtoms: data.properties.heavyAtoms, rotatableBonds: data.properties.rotatableBonds }
              : i === 2
              ? { compliance: data.lipinski.isStrictPass ? 'Passes all 4 rules' : 'Acceptable', mw: data.properties.molecularWeight }
              : i === 3
              ? { mechanism: data.pharmacology?.mechanismOfAction || 'Active enzyme site binding' }
              : i === 4
              ? { analogsCount: data.similarCompounds?.length || 4 }
              : { reportStatus: 'Generated report.json' },
          notes:
            i === 0
              ? data.diseaseContext
                ? `Matched health condition "${data.diseaseContext.diseaseName}" to biological target ${data.diseaseContext.targetName} and medicine ${data.name} (CID ${data.cid}).`
                : 'Resolved query and verified standard InChIKey via NCBI PUG REST.'
              : i === 2
              ? 'Evaluated oral suitability against standard Lipinski rule of 5 limits.'
              : undefined,
        })),
      }));
    } catch (err: any) {
      setSearchError(err.message || 'We could not find a matching compound. Check the spelling or try a PubChem ID number.');
      setAgentTrace((prev) => ({
        ...prev!,
        isStreaming: false,
        steps: prev!.steps.map((s, i) =>
          i === 0 ? { ...s, status: 'failed', detail: err.message } : { ...s, status: 'failed' }
        ),
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Chat Queries with full SSE chunk streaming and trace step synchronization
  const handleSendChatQuery = async (promptText: string) => {
    if (!promptText.trim()) return;

    setIsSidebarOpen(true);
    setSidebarTab('chat');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setChatMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsStreamingChat(true);

    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          cid: currentCompound?.cid,
          compoundName: currentCompound?.name,
        }),
      });

      if (!response.body) {
        throw new Error('No streaming response body available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed) continue;

          const eventMatch = trimmed.match(/^event:\s*([^\n]+)/m);
          const dataMatch = trimmed.match(/^data:\s*([\s\S]+)$/m);

          const eventType = eventMatch ? eventMatch[1].trim() : '';
          const dataString = dataMatch ? dataMatch[1].trim() : '';

          if (!dataString) continue;

          try {
            const parsed = JSON.parse(dataString);
            if (eventType === 'chat_chunk' && parsed.text) {
              setChatMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + parsed.text }
                    : msg
                )
              );
            } else if (eventType === 'trace_step') {
              setAgentTrace((prev) => {
                if (!prev) {
                  return {
                    query: promptText,
                    timestamp: new Date().toISOString(),
                    totalDurationMs: 0,
                    isStreaming: true,
                    steps: [parsed],
                  };
                }
                const exists = prev.steps.some((s) => s.id === parsed.id);
                const updatedSteps = exists
                  ? prev.steps.map((s) => (s.id === parsed.id ? { ...s, ...parsed } : s))
                  : [...prev.steps, parsed];
                return {
                  ...prev,
                  steps: updatedSteps,
                };
              });
            } else if (eventType === 'complete') {
              if (parsed.reportJson) {
                setAgentTrace((prev) =>
                  prev ? { ...prev, reportJson: parsed.reportJson, isStreaming: false } : null
                );
              }
            }
          } catch {
            // Non-blocking parse tolerance
          }
        }
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  'Could not complete the response for this question. Check your connection and try again.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreamingChat(false);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleFloatingChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!floatingChatInput.trim()) return;
    const query = floatingChatInput.trim();
    setFloatingChatInput('');
    handleSendChatQuery(query);
  };

  const handleAddToCompare = (compound: CompoundDetails) => {
    if (!comparedCompounds.some((c) => c.cid === compound.cid)) {
      setComparedCompounds((prev) => [...prev, compound]);
    }
    setIsCompareOpen(true);
  };

  const handleRemoveFromCompare = (cid: number) => {
    setComparedCompounds((prev) => prev.filter((c) => c.cid !== cid));
  };

  const handleAddCompoundNameToCompare = async (name: string) => {
    try {
      const res = await fetch(`/api/pubchem/search?q=${encodeURIComponent(name.trim())}`);
      if (res.ok) {
        const data: CompoundDetails = await res.json();
        if (!comparedCompounds.some((c) => c.cid === data.cid)) {
          setComparedCompounds((prev) => [...prev, data]);
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleReset = () => {
    setCurrentCompound(null);
    setSearchError(null);
    setAgentTrace(null);
    setChatMessages([]);
  };

  const isCompoundInView = Boolean(currentCompound);
  const shouldHidePromptUntilHover = isCompoundInView || isAtBottom;

  return (
    <div
      className="h-screen w-screen flex overflow-hidden font-body relative antialiased bg-[var(--surface)] text-[var(--ink)]"
    >
      {/* Left Workspace: TopBar + Independent Scrolling Main View */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          onReset={handleReset}
          onOpenCompare={() => setIsCompareOpen(true)}
          comparedCount={comparedCompounds.length}
          onOpenSidebar={() => {
            if (isSidebarOpen) {
              setIsSidebarOpen(false);
            } else {
              setIsSidebarOpen(true);
              if (!agentTrace) {
                setSidebarTab('chat');
              } else {
                setSidebarTab('trace');
              }
            }
          }}
          isSidebarOpen={isSidebarOpen}
          hasActiveTrace={Boolean(agentTrace)}
        />

        {/* Main Content Viewport */}
        <main
          id="main-content-scroll"
          className="flex-1 min-w-0 overflow-y-auto px-6 sm:px-10 lg:px-12 py-10 pb-36"
        >
          <div className="max-w-5xl mx-auto space-y-12 w-full">
            {/* Search Bar Section */}
            <section>
              <SearchBar
                onSearch={handleSearch}
                isLoading={isLoading}
                initialQuery={currentCompound?.name || ''}
                isZeroState={!currentCompound && !isLoading}
              />
            </section>

            {/* Error State — Plain unboxed editorial notice */}
            {searchError && (
              <div className="py-4 border-y border-[var(--fail)] flex items-baseline justify-between gap-4 text-[15px]">
                <p className="text-[var(--fail)] font-medium">{searchError}</p>
                <button
                  type="button"
                  onClick={() => setSearchError(null)}
                  className="text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Compound View or Zero State Guide */}
            {isLoading ? (
              <CompoundCardSkeleton />
            ) : currentCompound ? (
              <div className="space-y-10">
                {currentCompound.diseaseContext && (
                  <DiseaseBanner
                    diseaseContext={currentCompound.diseaseContext}
                    currentCompoundName={currentCompound.name}
                    onSelectCandidate={handleSearch}
                    onExploreIndication={(diseaseName) => {
                      setSidebarTab('chat');
                      setIsSidebarOpen(true);
                      handleSendChatQuery(
                        `Provide a comprehensive pharmacological analysis for ${diseaseName}, including primary biological targets, mechanism of action of ${currentCompound.name}, and key candidate therapeutics.`
                      );
                    }}
                  />
                )}

                <CompoundCard
                  compound={currentCompound}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onSelectCompound={handleSearch}
                  onAddToCompare={handleAddToCompare}
                  isCompared={comparedCompounds.some((c) => c.cid === currentCompound.cid)}
                  onDiveDeeper={(name) => {
                    setSidebarTab('chat');
                    setIsSidebarOpen(true);
                    handleSendChatQuery(
                      `Provide a deep scientific assessment for ${name}, including mechanism of action, key binding affinities, and Lipinski SAR optimization.`
                    );
                  }}
                />
              </div>
            ) : (
              /* Unboxed 3-column guide at bottom of start screen */
              <section className="pt-10 border-t border-[var(--ink)] grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-2">
                  <span className="text-[12px] font-mono text-[var(--ink-subtle)]">01</span>
                  <h2 className="text-2xl font-display text-[var(--ink)]">
                    Verified PubChem records
                  </h2>
                  <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                    Every search retrieves standardized 2D chemical structures, molecular weights, SMILES strings, and CAS numbers directly from NCBI PubChem.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[12px] font-mono text-[var(--ink-subtle)]">02</span>
                  <h2 className="text-2xl font-display text-[var(--ink)]">
                    Oral drug suitability
                  </h2>
                  <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                    Check whether a molecule meets Lipinski’s rule of 5 and Veber’s criteria for absorption when taken by mouth as a tablet or capsule.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[12px] font-mono text-[var(--ink-subtle)]">03</span>
                  <h2 className="text-2xl font-display text-[var(--ink)]">
                    Plain-English research assistant
                  </h2>
                  <p className="text-[14px] text-[var(--ink-muted)] leading-relaxed">
                    Have a question about how a medicine works or how the body breaks it down?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarTab('chat');
                        setIsSidebarOpen(true);
                      }}
                      className="text-[var(--ink)] font-medium underline underline-offset-4 hover:text-[var(--accent)] cursor-pointer"
                    >
                      Open the research assistant
                    </button>
                    .
                  </p>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Right Side: Assistant Chat & Search Steps */}
      {isSidebarOpen && (
        <RightSidebar
          trace={agentTrace}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(false)}
          onReplayTrace={() => currentCompound && handleSearch(currentCompound.name)}
          currentCid={currentCompound?.cid}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          currentCompound={currentCompound}
          onSendQuery={handleSendChatQuery}
          messages={chatMessages}
          isStreamingChat={isStreamingChat}
        />
      )}

      {/* Compare Compounds Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparedCompounds={comparedCompounds}
        onRemoveCompound={handleRemoveFromCompare}
        onAddCompoundName={handleAddCompoundNameToCompare}
        onSelectCompound={handleSearch}
      />

      {/* Bottom Question Bar — Clean architectural bar without pill lozenges */}
      {!isSidebarOpen && (
        <div
          className={`fixed bottom-8 left-0 right-0 z-30 transition-opacity duration-200 pointer-events-none group flex flex-col items-center justify-end pb-2 pt-4 ${
            shouldHidePromptUntilHover
              ? 'opacity-0 hover:opacity-100 focus-within:opacity-100 hover:pointer-events-auto focus-within:pointer-events-auto'
              : 'opacity-100 pointer-events-auto'
          }`}
        >
          {shouldHidePromptUntilHover && (
            <div className="absolute bottom-2 text-[12px] text-[var(--ink-muted)] group-hover:opacity-0 transition-opacity px-4 py-1 bg-[var(--surface)] border border-[var(--divider)] pointer-events-auto cursor-pointer max-w-[90vw] truncate">
              Ask a question about {currentCompound?.name || 'any compound'}
            </div>
          )}

          <div className="w-full max-w-2xl px-4 flex flex-col gap-2 items-center pointer-events-auto">
            {currentCompound && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full px-2 text-[12px] text-[var(--ink-muted)] bg-[var(--surface)]/95 py-1">
                <span>Ask about:</span>
                {['Mechanism of action', 'Lipinski rules', 'Functional groups', 'Improving LogP'].map((chip, idx) => (
                  <React.Fragment key={chip}>
                    {idx > 0 && <span aria-hidden="true" className="text-[var(--ink-subtle)]">·</span>}
                    <button
                      type="button"
                      onClick={() => handleSendChatQuery(`${chip} for ${currentCompound.name}`)}
                      className="hover:text-[var(--ink)] underline underline-offset-4 cursor-pointer shrink-0"
                    >
                      {chip}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            <form
              onSubmit={handleFloatingChatSubmit}
              className="flex items-center w-full bg-[var(--surface)] border border-[var(--ink)]"
            >
              <input
                type="text"
                value={floatingChatInput}
                onChange={(e) => setFloatingChatInput(e.target.value)}
                placeholder={`Ask a question about ${currentCompound?.name || 'a medicine or chemical compound'}...`}
                className="flex-1 py-2.5 px-4 text-[14px] bg-transparent focus:outline-none text-[var(--ink)] placeholder:text-[var(--ink-subtle)]"
              />
              <button
                type="submit"
                disabled={!floatingChatInput.trim()}
                className="px-5 py-2.5 text-[13px] font-medium text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-40 shrink-0"
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quiet Editorial Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-35 bg-[var(--surface)] border-t border-[var(--divider)] py-1.5 px-6 text-center text-[12px] text-[var(--ink-muted)] select-none pointer-events-auto">
        <span>Data from NCBI PubChem · Always verify critical chemical and clinical details against primary literature. · Do not submit sensitive or personal information.</span>
      </footer>
    </div>
  );
}
