'use client';

import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import ConfigBar from '@/components/ConfigBar';
import LoadingScreen from '@/components/LoadingScreen';
import GameStage from '@/components/GameStage';
import HUDDrawer from '@/components/HUDDrawer';
import HomePage from '@/components/HomePage';
import AboutPage from '@/components/AboutPage';
import DocumentSideViewer from '@/components/DocumentSideViewer';
import GamingBackgroundDecorations from '@/components/GamingBackgroundDecorations';
import { MOCK_GAME_HTML, MOCK_HUD, registerDocumentDetails } from '@/data/mockData';
import { AlertCircle, RefreshCcw, Gamepad2, Zap, Brain, Presentation } from 'lucide-react';

export default function Page() {
  // Theme State: 'light' | 'dark'
  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {}
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((d) => !d);
  }, []);

  // 3 Distinct Pages: 'home' | 'ai-agent' | 'about'
  const [activePage, setActivePage] = useState('home');
  const [appState, setAppState] = useState('idle'); // 'idle' | 'loading' | 'playing' | 'error'
  const [gameHtml, setGameHtml] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [activeLevel, setActiveLevel] = useState('');
  const [activeDocData, setActiveDocData] = useState(null);
  const [sourceType, setSourceType] = useState('topic');
  const [errorMsg, setErrorMsg] = useState('');
  const [hudData, setHudData] = useState<{
    takeaways: string[];
    objectives: Array<{ label: string; done: boolean }>;
  }>({ takeaways: [], objectives: [] });

  // AI Document Side-Viewer state
  const [viewerDoc, setViewerDoc] = useState(null);
  const [externalTopic, setExternalTopic] = useState('');

  // Real-time listener for interactive objective completions inside the game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (
        event.data.type === 'OBJECTIVE_COMPLETE' ||
        event.data.type === 'STAGE_SUCCESS' ||
        event.data.type === 'STAGE_COMPLETE'
      ) {
        const stageNum = Number(event.data.stage) || 1;
        setHudData((prev: any) => {
          const updated = prev.objectives.map((obj: any, i: number) => {
            if (i === stageNum - 1) return { ...obj, done: true };
            return obj;
          });
          return { ...prev, objectives: updated };
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleGenerate = useCallback(
    async ({
      topic,
      level,
      sourceType: genSourceType,
      documentData,
    }: {
      topic: string;
      level: string;
      sourceType: string;
      documentData?: any;
    }) => {
      setActiveTopic(topic);
      setActiveLevel(level);
      setActiveDocData(documentData || null);
      setSourceType(genSourceType || 'topic');
      setAppState('loading');
      setErrorMsg('');

      try {
        // If a document is attached and it has a real File, analyze slides in background for DocumentSideViewer
        if (documentData?.file instanceof File) {
          const docForm = new FormData();
          docForm.append('file', documentData.file);
          fetch('/api/analyze-document', { method: 'POST', body: docForm })
            .then((r) => r.json())
            .then((res) => {
              if (res.status === 'success' && res.document) {
                registerDocumentDetails(documentData.name, res.document);
              }
            })
            .catch((e) => console.warn('Document analysis background task:', e));
        }

        let generatedHtml = '';
        let takeaways: string[] = [];
        let objectives: Array<{ label: string; done: boolean }> = [];

        if (genSourceType === 'document' || genSourceType === 'combined' || documentData) {
          // Document generation endpoint
          const formData = new FormData();
          formData.append('level', level === 'highschool' ? 'high_school' : level);
          if (topic) formData.append('prompt', topic);

          if (documentData?.file instanceof File) {
            formData.append('files', documentData.file);
          } else if (documentData?.name) {
            formData.append('sampleDocumentName', documentData.name);
          }

          const res = await fetch('/api/generate-from-docs', {
            method: 'POST',
            body: formData,
          });

          let data: any;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = await res.json();
          } else {
            const rawText = await res.text();
            throw new Error(
              res.status === 504
                ? 'Serverless invocation timed out. Please retry with a concise prompt.'
                : `Server error (${res.status}): ${rawText.slice(0, 150)}`
            );
          }

          if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Failed to generate game from document.');
          }

          const primaryGame = data.games?.[0] || data.suite?.games?.[0];
          if (!primaryGame || !primaryGame.html) {
            throw new Error('No game was synthesized from the document.');
          }

          generatedHtml = primaryGame.html;
          takeaways = primaryGame.takeaways || [];
          objectives = primaryGame.objectives || [
            { label: `Score 20 points in "${topic || documentData.name}"`, done: false },
            { label: 'Master core concepts extracted from document', done: false },
            { label: "Observe the 'What Changed?' transition explanations", done: false },
          ];
        } else {
          // Single topic generation endpoint
          const res = await fetch('/api/generate-game', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topic.trim(),
              level: level === 'highschool' ? 'high_school' : level,
              userIntent: `Educational game for ${level} students explaining ${topic.trim()}`,
            }),
          });

          let data: any;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            data = await res.json();
          } else {
            const rawText = await res.text();
            throw new Error(
              res.status === 504
                ? 'Serverless invocation timed out. The system has automatically shifted to faster fallback models, please try again.'
                : `Server error (${res.status}): ${rawText.slice(0, 150)}`
            );
          }

          if (!res.ok || data.status === 'error') {
            throw new Error(data.message || 'Game generation failed.');
          }

          generatedHtml = data.html;
          takeaways = data.takeaways || [];
          objectives = data.objectives || [
            { label: `Master fundamental principles of ${topic}`, done: false },
            { label: `Maintain streak and complete all stages`, done: false },
            { label: "Observe the 'What Changed?' transition explanations", done: false },
          ];
        }

        setGameHtml(generatedHtml);
        setHudData({ takeaways, objectives });
        setAppState('playing');

        // Persist to database in background
        fetch('/api/db/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            level,
            sourceType: genSourceType,
            title: topic,
            html: generatedHtml,
            takeaways,
            objectives,
          }),
        }).catch((dbErr) => console.warn('Database save warning:', dbErr));
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to generate game. Please check your connection and try again.');
        setAppState('error');
      }
    },
    []
  );

  const handleNewTopic = useCallback(() => {
    setAppState('idle');
    setGameHtml('');
    setActiveTopic('');
    setActiveLevel('');
    setActiveDocData(null);
    setHudData({ takeaways: [], objectives: [] });
  }, []);

  const handleOpenDocViewer = (doc: any) => {
    setViewerDoc(doc || activeDocData || { name: 'Cell_Biology_Lecture_4.pptx', type: 'PPTX' });
  };

  const handleSelectTopicFromSlide = (topicTitle: string) => {
    setExternalTopic(topicTitle);
    setViewerDoc(null);
    setActivePage('ai-agent');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* ── 1. HOME PAGE ONLY: Transparent Animated Background GIF ── */}
      {activePage === 'home' && (
        <div
          className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
          aria-hidden="true"
          style={{
            opacity: isDark ? 0.14 : 0.1,
            mixBlendMode: isDark ? 'screen' : 'multiply',
          }}
        >
          <img src="/bg-animation.gif" alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* ── 2. OTHER PAGES ONLY: Decorative Gaming Objects Around the Page ── */}
      {activePage !== 'home' && <GamingBackgroundDecorations />}

      {/* Top Sticky Navbar */}
      <Navbar
        activePage={activePage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNavigate={(page: string) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickPlay={() => {
          setActivePage('ai-agent');
          if (appState === 'playing') handleNewTopic();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area — Switches between the 4 Separate Pages */}
      <main className="flex-1 relative z-10">
        {/* ═══════════════════════════════════════════════════════════════
            PAGE 1: HOME (Landing Showcase with Transparent GIF Background)
            ═══════════════════════════════════════════════════════════════ */}
        {activePage === 'home' && (
          <HomePage
            onNavigateToAgent={() => {
              setActivePage('ai-agent');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToAbout={() => {
              setActivePage('about');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 2: AI AGENT (Interactive Game Generator)
            ═══════════════════════════════════════════════════════════════ */}
        {activePage === 'ai-agent' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
            {appState !== 'playing' && <Header />}

            {/* Config bar: Type + Upload naturally together without tabs */}
            {(appState === 'idle' || appState === 'error' || appState === 'loading') && (
              <ConfigBar
                onGenerate={handleGenerate}
                isLoading={appState === 'loading'}
                onOpenDocViewer={handleOpenDocViewer}
                externalTopic={externalTopic}
              />
            )}

            {/* Loading Screen */}
            {appState === 'loading' && (
              <LoadingScreen
                topic={activeTopic}
                level={activeLevel}
                sourceType={sourceType}
                documentData={activeDocData}
              />
            )}

            {/* Error Message Card */}
            {appState === 'error' && (
              <div className="px-4 sm:px-6 max-w-4xl mx-auto mb-8">
                <div
                  className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                  style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
                >
                  <AlertCircle size={22} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <p className="font-pixel text-sm font-bold text-[#dc2626] mb-1">Generation Failed</p>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{errorMsg}</p>
                  </div>
                  <button
                    className="control-btn"
                    style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.30)' }}
                    onClick={() => setAppState('idle')}
                  >
                    <RefreshCcw size={14} />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Playing Stage + Learning HUD */}
            {appState === 'playing' && (
              <>
                <GameStage
                  gameHtml={gameHtml}
                  topic={activeTopic}
                  level={activeLevel}
                  documentData={activeDocData}
                  onNewTopic={handleNewTopic}
                  onRestart={() => {}}
                  onOpenDocViewer={handleOpenDocViewer}
                />
                <HUDDrawer
                  takeaways={hudData.takeaways as any}
                  objectives={hudData.objectives as any}
                  topic={activeTopic}
                />
              </>
            )}

            {/* Idle Feature Showcase */}
            {appState === 'idle' && (
              <div className="flex flex-col items-center justify-center pb-12 px-4 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 animate-float"
                  style={{ background: 'rgba(86, 128, 233, 0.12)', border: '1px solid rgba(86, 128, 233, 0.28)' }}
                >
                  <Gamepad2 size={28} style={{ color: '#5680E9' }} />
                </div>

                <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#1e2440] mb-2">
                  Ready to Synthesize Your Next Game?
                </h2>
                <p style={{ color: '#536280', maxWidth: '30rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Enter any topic or attach your <strong>PDF/PPT slides</strong> above, select your learning grade, and click{' '}
                  <span style={{ color: '#5680E9', fontWeight: 600 }}>Generate Game</span>.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8">
                  {[
                    {
                      Icon: Zap,
                      color: '#5680E9',
                      bg: 'rgba(86, 128, 233, 0.10)',
                      border: 'rgba(86, 128, 233, 0.25)',
                      title: 'Instant Games',
                      desc: 'AI synthesizes interactive game code in seconds from any prompt',
                    },
                    {
                      Icon: Presentation,
                      color: '#1f8ebd',
                      bg: 'rgba(90, 185, 234, 0.14)',
                      border: 'rgba(90, 185, 234, 0.30)',
                      title: 'PDF & PPT Grounding',
                      desc: 'Parses lecture slides directly into questions with side-by-side view',
                    },
                    {
                      Icon: Brain,
                      color: '#8860D0',
                      bg: 'rgba(136, 96, 208, 0.12)',
                      border: 'rgba(136, 96, 208, 0.25)',
                      title: 'Calibrated Levels',
                      desc: 'Adapts vocabulary & depth from Elementary to University',
                    },
                  ].map(({ Icon, color, bg, border, title, desc }) => (
                    <div key={title} className="glass-card p-5 text-left transition-transform hover:-translate-y-1">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: bg, border: `1px solid ${border}` }}
                      >
                        <Icon size={17} style={{ color }} />
                      </div>
                      <p className="font-pixel text-xs font-bold text-[#1e2440] mb-1">{title}</p>
                      <p style={{ color: '#5e6b8c', fontSize: '0.785rem', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            PAGE 3: ABOUT US (Dedicated Mission & Pedagogical Core)
            ═══════════════════════════════════════════════════════════════ */}
        {activePage === 'about' && (
          <AboutPage
            onStartPlaying={() => {
              setActivePage('ai-agent');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* ── Slide-Over AI Document Viewer (PDF & PPT) ── */}
      {viewerDoc && (
        <DocumentSideViewer
          documentData={viewerDoc}
          onClose={() => setViewerDoc(null)}
          onSelectTopic={handleSelectTopicFromSlide}
        />
      )}

      {/* Rich Persistent Footer with Logo and Links */}
      <footer
        className="py-8 px-6 mt-auto relative z-10 transition-colors"
        style={{
          borderTop: isDark ? '1px solid rgba(86, 128, 233, 0.24)' : '1px solid rgba(86, 128, 233, 0.16)',
          background: isDark ? 'rgba(12, 16, 33, 0.88)' : 'rgba(255, 255, 255, 0.80)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7c8ba8]">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
            <span className={`font-pixel font-bold ${isDark ? 'text-white' : 'text-[#1e2440]'}`}>Learn & Play AI</span>
            <span>· Educational Game Generator</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#5680E9] font-pixel transition-colors"
            >
              HOME
            </button>
            <button
              onClick={() => {
                setActivePage('ai-agent');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#5680E9] font-pixel transition-colors"
            >
              AI Agent
            </button>
            <button
              onClick={() => {
                setActivePage('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#5680E9] font-pixel transition-colors"
            >
              About Us
            </button>
          </div>

          <p>© 2026 Learn & Play AI. Games run in isolated client sandboxes.</p>
        </div>
      </footer>
    </div>
  );
}
