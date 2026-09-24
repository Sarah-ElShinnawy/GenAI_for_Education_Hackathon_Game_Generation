import { useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2, RotateCcw, PlusCircle, ExternalLink, AlertTriangle, BookOpen } from 'lucide-react';

export default function GameStage({ gameHtml, topic, level, onNewTopic, onRestart, documentData, onOpenDocViewer }) {
  const iframeRef    = useRef(null);
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey,    setIframeKey]    = useState(0);

  const handleFsChange = useCallback(() => setIsFullscreen(!!document.fullscreenElement), []);

  const attachFsRef = useCallback((node) => {
    if (node) node.addEventListener('fullscreenchange', handleFsChange);
    containerRef.current = node;
  }, [handleFsChange]);

  const handleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) { await el.requestFullscreen(); setIsFullscreen(true); }
      else                             { await document.exitFullscreen(); setIsFullscreen(false); }
    } catch (e) { console.warn(e); }
  }, []);

  const handleRestart = () => { setIframeKey(k => k + 1); onRestart?.(); };

  if (!gameHtml) return null;

  const levelLabel =
    level === 'elementary' ? 'Elementary'
    : level === 'university' ? 'University'
    : 'High School';

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto mb-6 animate-fade-in">

      {/* Badges */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm font-semibold">
          <ExternalLink size={13} style={{ color: '#5680E9' }} />
          <span style={{ color: '#1e2440' }}>{topic}</span>
        </div>
        {documentData && (
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold glass-card text-[#5680E9] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5680E9]" />
            Source: {documentData.name} ({documentData.type})
          </span>
        )}
        {documentData && topic && (
          <span className="px-3 py-1.5 rounded-full text-xs font-bold glass-card text-[#8860D0] flex items-center gap-1.5"
            style={{ border: '1px solid rgba(136, 96, 208, 0.25)', background: 'rgba(136, 96, 208, 0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8860D0]" />
            Combined AI Synthesis
          </span>
        )}
        {documentData && (
          <button
            type="button"
            onClick={() => onOpenDocViewer && onOpenDocViewer(documentData)}
            className="px-3 py-1.5 rounded-full text-xs font-bold glass-card text-[#5680E9] hover:bg-[rgba(86,128,233,0.15)] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            style={{ border: '1px solid rgba(86, 128, 233, 0.35)' }}
            title="Inspect uploaded slides side-by-side with game"
          >
            <BookOpen size={13} />
            <span>View Slides on Side</span>
          </button>
        )}
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold glass-card" style={{ color: '#5e6b8c' }}>
          {levelLabel}
        </span>
      </div>

      {/* Game container */}
      <div ref={attachFsRef} id="game-container" className="relative rounded-2xl overflow-hidden"
        style={{
          border:     '1.5px solid rgba(86, 128, 233, 0.28)',
          background: '#ffffff',
          boxShadow:  '0 12px 36px rgba(86, 128, 233, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* 16:9 aspect wrapper */}
        <div style={{ paddingTop: isFullscreen ? 0 : '56.25%', position: 'relative', height: isFullscreen ? '100vh' : undefined }}>
          <iframe key={iframeKey} ref={iframeRef} id="game-iframe" title="EduPlay Game"
            srcDoc={gameHtml} sandbox="allow-scripts allow-modals allow-forms"
            className="absolute inset-0 w-full h-full" allow="fullscreen" />
        </div>

        {/* Hover overlay — gradient overlay bar */}
        <div id="overlay-controls"
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-4 py-3"
          style={{
            background: 'linear-gradient(to top, rgba(255,255,255,0.92) 0%, transparent 100%)',
            opacity: 0, transition: 'opacity 0.25s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        >
          <div className="flex gap-2">
            <button id="restart-btn" className="control-btn" onClick={handleRestart}><RotateCcw size={13} /><span className="hidden sm:inline">Restart</span></button>
            <button id="new-topic-btn" className="control-btn" onClick={onNewTopic}><PlusCircle size={13} /><span className="hidden sm:inline">New Topic</span></button>
          </div>
          <button id="fullscreen-btn" className="control-btn" onClick={handleFullscreen}>
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Persistent controls */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button id="restart-btn-2" className="control-btn" onClick={handleRestart}><RotateCcw size={13} />Restart Game</button>
        <button id="new-topic-btn-2" className="control-btn" onClick={onNewTopic}><PlusCircle size={13} />New Topic</button>
        <button id="fullscreen-btn-2" className="control-btn ml-auto" onClick={handleFullscreen}>
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      <p className="flex items-center gap-1.5 mt-3 text-xs font-medium" style={{ color: '#7c8ba8' }}>
        <AlertTriangle size={12} style={{ color: '#5680E9' }} />
        Game runs in an isolated sandbox. No data leaves your browser.
      </p>
    </div>
  );
}
