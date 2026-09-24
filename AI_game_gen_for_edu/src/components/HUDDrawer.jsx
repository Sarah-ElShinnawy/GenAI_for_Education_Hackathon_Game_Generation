import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Target, CheckCircle2, Circle, BookOpen } from 'lucide-react';

export default function HUDDrawer({ takeaways = [], objectives = [], topic }) {
  const [open, setOpen] = useState(true);

  const completedCount = objectives.filter(o => o.done).length;
  const totalCount     = objectives.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="px-4 sm:px-6 max-w-5xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>

      {/* Toggle header */}
      <button id="hud-toggle"
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl glass-card mb-1"
        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'rgba(86, 128, 233, 0.10)', border: '1px solid rgba(86, 128, 233, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={16} style={{ color: '#5680E9' }} />
          </div>
          <div className="text-left">
            <p style={{ color: '#1e2440', fontWeight: 700, fontSize: '0.9rem' }}>Learning HUD</p>
            {topic && (
              <p style={{ color: '#5e6b8c', fontSize: '0.75rem' }}>
                {completedCount}/{totalCount} objectives complete
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini progress */}
          {topic && totalCount > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(86, 128, 233, 0.12)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #5680E9, #8860D0)' }} />
              </div>
              <span style={{ color: '#5680E9', fontSize: '0.75rem', fontWeight: 700 }}>{Math.round(progressPct)}%</span>
            </div>
          )}
          {open
            ? <ChevronUp   size={17} style={{ color: '#7482a5' }} />
            : <ChevronDown size={17} style={{ color: '#7482a5' }} />
          }
        </div>
      </button>

      {/* Drawer */}
      <div style={{ maxHeight: open ? '800px' : '0px', opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease-out, opacity 0.3s' }}>
        <div className="grid sm:grid-cols-2 gap-4 pt-3">

          {/* Key Takeaways */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={15} style={{ color: '#5680E9' }} />
              <h2 style={{ color: '#5680E9', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                Key Takeaways
              </h2>
            </div>
            {takeaways.length === 0
              ? <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>Generate a game to see learning insights.</p>
              : (
                <ul className="space-y-3">
                  {takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-[8px] flex-shrink-0 w-2 h-2 rounded-full"
                        style={{ background: i % 2 === 0 ? '#5680E9' : '#8860D0' }} />
                      <span style={{ color: '#2c385a', fontSize: '0.875rem', lineHeight: 1.65 }}>{t}</span>
                    </li>
                  ))}
                </ul>
              )
            }
          </div>

          {/* Challenge Objectives — read-only */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} style={{ color: '#8860D0' }} />
              <h2 style={{ color: '#8860D0', fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                Challenge Objectives
              </h2>
            </div>
            {objectives.length === 0
              ? <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic' }}>Generate a game to see your goals.</p>
              : (
                <ul className="space-y-3">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {obj.done
                        ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#5680E9' }} />
                        : <Circle       size={16} className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(86, 128, 233, 0.35)' }} />
                      }
                      <span style={{
                        color: obj.done ? '#94a3b8' : '#2c385a',
                        fontSize: '0.875rem', lineHeight: 1.65,
                        textDecoration: obj.done ? 'line-through' : 'none',
                      }}>
                        {obj.label}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            }

            {objectives.length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(86, 128, 233, 0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: '#5e6b8c', fontSize: '0.75rem' }}>Mastery Progress</span>
                  <span style={{ color: '#5680E9', fontSize: '0.75rem', fontWeight: 700 }}>{completedCount}/{totalCount}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(86, 128, 233, 0.12)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #5680E9, #8860D0)',
                      boxShadow: progressPct > 0 ? '0 0 8px rgba(86, 128, 233, 0.40)' : 'none',
                    }} />
                </div>
                <p style={{ color: '#7c8ba8', fontSize: '0.75rem', marginTop: 8 }}>
                  Objectives are completed automatically as you play.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
