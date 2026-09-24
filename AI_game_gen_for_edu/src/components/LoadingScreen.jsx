import { useEffect, useState } from 'react';
import { LOADING_FACTS } from '../data/mockData';
import { Cpu, FileText, Presentation, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoadingScreen({ topic, level, sourceType, documentData }) {
  const [factIndex, setFactIndex] = useState(0);
  const [fade, setFade]           = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const isCombined = Boolean(documentData && topic && (sourceType === 'combined' || topic !== documentData.name));

  const levelLabel =
    level === 'elementary' ? 'Elementary'
    : level === 'university' ? 'University'
    : 'High School';

  const steps = isCombined ? [
    `Reading and parsing slide concepts from ${documentData.name}…`,
    `Focusing interactive challenge on "${topic}"…`,
    `Calibrating pedagogical difficulty for ${levelLabel} level…`
  ] : documentData ? [
    `Reading and extracting slides from ${documentData.name}…`,
    `Analyzing curriculum standards for ${levelLabel}…`,
    `Synthesizing interactive game logic and score objectives…`
  ] : [
    `Analyzing concept framework for "${topic}"…`,
    `Calibrating challenge objectives and difficulty curves…`,
    `Rendering interactive sandbox mechanics…`
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setFactIndex(i => (i + 1) % LOADING_FACTS.length); setFade(true); }, 300);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex(s => (s < steps.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(stepTimer);
  }, [steps.length]);

  return (
    <div className="px-4 sm:px-6 max-w-4xl mx-auto mb-8 animate-fade-in">
      <div className="glass-card p-8 sm:p-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(86,128,233,0.15), rgba(136,96,208,0.15))',
            border: '1px solid rgba(86, 128, 233, 0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isCombined ? (
              <Sparkles size={20} style={{ color: '#5680E9' }} className="animate-pulse" />
            ) : documentData ? (
              documentData.type === 'PDF' 
                ? <FileText size={20} style={{ color: '#dc2626' }} className="animate-pulse" />
                : <Presentation size={20} style={{ color: '#ea580c' }} className="animate-pulse" />
            ) : (
              <Cpu size={20} style={{ color: '#5680E9' }} className="animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p style={{ color: '#1e2440', fontWeight: 700, fontSize: '0.975rem' }}>
                {isCombined 
                  ? 'Synthesizing Game from Topic & Document…' 
                  : documentData 
                    ? 'Extracting & Generating from Document…' 
                    : 'Generating your game…'}
              </p>
              {isCombined ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(136,96,208,0.12)] text-[#8860D0] border border-[rgba(136,96,208,0.22)]">
                  Combined AI
                </span>
              ) : documentData ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(86,128,233,0.12)] text-[#5680E9] border border-[rgba(86,128,233,0.22)]">
                  {documentData.type} File
                </span>
              ) : null}
            </div>
            <p style={{ color: '#5e6b8c', fontSize: '0.8rem' }}>
              {isCombined ? (
                <>Focus: <span style={{ color: '#5680E9', fontWeight: 600 }}>{topic}</span> · File: <span style={{ color: '#8860D0', fontWeight: 600 }}>{documentData.name}</span></>
              ) : (
                <>Source: <span style={{ color: '#5680E9', fontWeight: 600 }}>{documentData?.name || topic}</span></>
              )}
              {level && <> · Level: <span style={{ color: '#5680E9', fontWeight: 600 }}>{levelLabel}</span></>}
            </p>
          </div>
          {/* Pulsing dots */}
          <div className="ml-auto flex gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2.5 h-2.5 rounded-full"
                style={{ background: '#5680E9', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>

        {/* Current Active Step Banner */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-6 bg-white/70 border border-[rgba(86,128,233,0.18)]">
          <Sparkles size={14} className="text-[#5680E9] animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-xs font-semibold text-[#1e2440] truncate">
            {steps[stepIndex]}
          </p>
        </div>

        {/* Skeleton game area */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ aspectRatio: '16/9', background: 'rgba(86, 128, 233, 0.05)', border: '1px solid rgba(86, 128, 233, 0.15)' }}>
          <div className="w-full h-full shimmer" />
        </div>

        {/* Skeleton controls */}
        <div className="flex gap-3 mb-6">
          {[80, 110, 90].map((w, i) => (
            <div key={i} className="h-8 rounded-xl shimmer" style={{ width: w }} />
          ))}
        </div>

        {/* Rotating fact */}
        <div className="glass-card p-5 transition-opacity duration-300" style={{ opacity: fade ? 1 : 0 }}>
          <p style={{ color: '#5680E9', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Did You Know?
          </p>
          <p style={{ color: '#2c385a', fontSize: '0.9rem', lineHeight: 1.65 }}>
            {LOADING_FACTS[factIndex]}
          </p>
        </div>

        {/* Progress bar: royal blue → cyan → purple */}
        <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(86, 128, 233, 0.10)' }}>
          <div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #5680E9, #5AB9EA, #8860D0)', animation: 'progress-fill 4s ease-out forwards' }} />
        </div>
      </div>

      <style>{`@keyframes progress-fill { from { width: 5%; } to { width: 88%; } }`}</style>
    </div>
  );
}
