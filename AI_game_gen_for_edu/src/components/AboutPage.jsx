import { Sparkles, Brain, FileText, Presentation, ShieldCheck, Zap, BookOpen, GraduationCap, School, ArrowRight, Target, CheckCircle2 } from 'lucide-react';

export default function AboutPage({ onStartPlaying }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      
      {/* Hero Section with Official Logo */}
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-3xl glass-card-strong shadow-xl hover:scale-105 transition-transform duration-300">
          <img
            src="/logo.png"
            alt="Learn & Play Logo"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain"
          />
        </div>

        <h1 className="font-pixel text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 text-[#1e2440]">
          Revolutionizing Education <br className="hidden sm:block" />
          Through <span className="gradient-text">Intelligent Play</span>
        </h1>

        <p className="text-base sm:text-lg text-[#536280] max-w-2xl mx-auto leading-relaxed">
          <strong>Learn & Play AI</strong> bridges the gap between static study material and dynamic human curiosity.
          We transform textbooks, lecture slides, and curriculum topics into instant interactive games that make learning sticky, memorable, and fun.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onStartPlaying}
            className="btn-primary py-3.5 px-8 text-sm font-pixel flex items-center gap-2"
          >
            <Sparkles size={16} />
            <span>Launch AI Game Agent</span>
          </button>
        </div>
      </div>

      {/* 4 Core Pillars / Features */}
      <div className="mb-20">
        <div className="text-center mb-10">
          <span className="font-pixel text-xs font-bold uppercase tracking-wider text-[#5680E9] bg-[rgba(86,128,233,0.10)] px-3 py-1 rounded-full border border-[rgba(86,128,233,0.22)]">
            Core Technology
          </span>
          <h2 className="font-pixel text-2xl sm:text-3xl font-bold text-[#1e2440] mt-3">
            How Learn & Play AI Works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          
          {/* Card 1: Any Topic Engine */}
          <div className="glass-card-strong p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(86, 128, 233, 0.12)', border: '1px solid rgba(86, 128, 233, 0.25)' }}>
                <Zap size={22} style={{ color: '#5680E9' }} />
              </div>
              <h3 className="text-lg font-bold text-[#1e2440] mb-2">Prompt-to-Game Synthesis</h3>
              <p className="text-sm text-[#5e6b8c] leading-relaxed">
                Type any curriculum topic from quantum mechanics to ancient history. Our AI models rapidly distill core principles, construct win conditions, and generate custom HTML5 playable game code in under 4 seconds.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#5680E9]">
              <span>Instant playability</span>
              <CheckCircle2 size={14} />
            </div>
          </div>

          {/* Card 2: PDF & PPT Upload */}
          <div className="glass-card-strong p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(90, 185, 234, 0.14)', border: '1px solid rgba(90, 185, 234, 0.30)' }}>
                <Presentation size={22} style={{ color: '#1f8ebd' }} />
              </div>
              <h3 className="text-lg font-bold text-[#1e2440] mb-2">PDF & PowerPoint (PPT) Ingestion</h3>
              <p className="text-sm text-[#5e6b8c] leading-relaxed">
                Upload your classroom syllabus, lecture slides (.pptx/.ppt), or chapter notes (.pdf). The AI extracts key terminology, logic puzzles, and challenge questions straight from your uploaded study materials.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#1f8ebd]">
              <span>Supports .PDF, .PPT, .PPTX</span>
              <CheckCircle2 size={14} />
            </div>
          </div>

          {/* Card 3: 3-Way Level Selector */}
          <div className="glass-card-strong p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(136, 96, 208, 0.12)', border: '1px solid rgba(136, 96, 208, 0.25)' }}>
                <Brain size={22} style={{ color: '#8860D0' }} />
              </div>
              <h3 className="text-lg font-bold text-[#1e2440] mb-2">Cognitive Level Calibration</h3>
              <p className="text-sm text-[#5e6b8c] leading-relaxed">
                Adaptive difficulty calibrated to Elementary (Ages 6–11), High School (Ages 12–18), or University (Higher Ed). Vocabulary, time pressure, and mental models adapt to suit student maturity.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#8860D0]">
              <span>Grade-level appropriate</span>
              <CheckCircle2 size={14} />
            </div>
          </div>

          {/* Card 4: Safe Sandboxed Execution */}
          <div className="glass-card-strong p-6 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'rgba(86, 128, 233, 0.10)', border: '1px solid rgba(86, 128, 233, 0.22)' }}>
                <ShieldCheck size={22} style={{ color: '#5680E9' }} />
              </div>
              <h3 className="text-lg font-bold text-[#1e2440] mb-2">Isolated Client-Side Sandbox</h3>
              <p className="text-sm text-[#5e6b8c] leading-relaxed">
                Every game runs in an isolated, secure browser iframe container. No student data or files leave the browser, providing a zero-risk, privacy-first environment safe for schools and homes.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#5680E9]">
              <span>100% Privacy Protected</span>
              <CheckCircle2 size={14} />
            </div>
          </div>

        </div>
      </div>

      {/* Pedagogical Stats Banner */}
      <div className="glass-card p-8 sm:p-10 mb-20 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.92))',
          border: '1.5px solid rgba(86, 128, 233, 0.25)',
        }}>
        <h3 style={{ fontFamily: 'Outfit, system-ui, sans-serif' }} className="text-2xl font-bold text-[#1e2440] mb-8">
          The Science of Play-Based Learning
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-white/70 border border-[rgba(86,128,233,0.15)]">
            <p className="text-4xl font-extrabold text-[#5680E9] mb-1">90%</p>
            <p className="text-xs font-bold text-[#1e2440] uppercase tracking-wide mb-1">Knowledge Retention</p>
            <p className="text-xs text-[#5e6b8c]">Interactive practice anchors memory compared to 10% from reading.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[rgba(86,128,233,0.15)]">
            <p className="text-4xl font-extrabold text-[#5AB9EA] mb-1">4.2x</p>
            <p className="text-xs font-bold text-[#1e2440] uppercase tracking-wide mb-1">Time On Task</p>
            <p className="text-xs text-[#5e6b8c]">Game loops sustain dopamine & curiosity, preventing cognitive fatigue.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/70 border border-[rgba(86,128,233,0.15)]">
            <p className="text-4xl font-extrabold text-[#8860D0] mb-1">&lt; 4s</p>
            <p className="text-xs font-bold text-[#1e2440] uppercase tracking-wide mb-1">Instant Generation</p>
            <p className="text-xs text-[#5e6b8c]">Rapid iterative learning loops without waiting for manual lesson prep.</p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="text-center py-6">
        <h3 className="text-xl font-bold text-[#1e2440] mb-2">Ready to transform your study session?</h3>
        <p className="text-sm text-[#5e6b8c] mb-6">Enter a topic or upload your presentation slides to start playing right away.</p>
        <button
          onClick={onStartPlaying}
          className="btn-primary py-3 px-8 text-sm inline-flex items-center gap-2"
        >
          <span>Go to Game Generator</span>
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  );
}
