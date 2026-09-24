import { Sparkles, Bot, ArrowRight, Zap, Presentation, Brain, ShieldCheck, Gamepad2, Layers, BookOpen, Star, Trophy, Target } from 'lucide-react';

export default function HomePage({ onNavigateToAgent, onNavigateToAbout }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 animate-fade-in relative z-10">

      {/* ── Hero Showcase Section ── */}
      <div className="text-center max-w-4xl mx-auto mb-16 sm:mb-24 relative">
        
        {/* Official Website Logo Emblem */}
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-3xl glass-card-strong shadow-2xl transition-transform duration-300 hover:scale-105">
          <img
            src="/logo.png"
            alt="Learn & Play Logo"
            className="h-20 w-auto sm:h-28 object-contain drop-shadow-md"
          />
        </div>

        {/* Pixel Gaming Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-pixel text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-full bg-[rgba(86,128,233,0.12)] text-[#5680E9] border border-[rgba(86,128,233,0.25)] flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI GAME GENERATOR FOR EDUCATION
          </span>
        </div>

        {/* Pixel Gaming Headline */}
        <h1 className="font-pixel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 text-[#1e2440] leading-tight">
          Level Up Learning <br className="hidden sm:block" />
          Through <span className="gradient-text">Interactive Play</span>
        </h1>

        <p className="text-base sm:text-lg text-[#536280] max-w-2xl mx-auto leading-relaxed mb-8">
          Turn any lecture topic or upload your <strong>PDF</strong> and <strong>PowerPoint (PPT)</strong> slides into playable quizzes, memory challenges, and interactive video games in seconds.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onNavigateToAgent}
            className="btn-primary py-4 px-8 text-sm sm:text-base font-pixel flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform"
          >
            <Bot size={18} />
            <span>Launch AI Agent</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onNavigateToAbout}
            className="px-6 py-4 rounded-xl text-sm sm:text-base font-pixel font-bold bg-white/90 border border-[rgba(86,128,233,0.30)] text-[#1e2440] hover:bg-[rgba(86,128,233,0.10)] transition-all shadow-md hover:scale-105"
          >
            <span>About Platform</span>
          </button>
        </div>

        {/* Mini stats preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[rgba(86,128,233,0.20)]">
          {[
            { num: "90%", label: "Retention Rate" },
            { num: "3.8s", label: "Game Generation" },
            { num: "PPT + PDF", label: "Multi-Modal Parsing" },
            { num: "100%", label: "Sandbox Security" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-pixel text-xl sm:text-2xl font-black text-[#5680E9]">{stat.num}</p>
              <p className="text-xs text-[#5e6b8c] font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ── Scroll Down Feature Cards Section ── */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <span className="font-pixel text-xs font-bold uppercase tracking-wider text-[#8860D0] bg-[rgba(136,96,208,0.10)] px-3 py-1 rounded-full border border-[rgba(136,96,208,0.20)]">
            Platform Capabilities
          </span>
          <h2 className="font-pixel text-2xl sm:text-4xl font-extrabold text-[#1e2440] mt-3">
            Everything You Need to Gamify Your Classroom
          </h2>
          <p className="text-sm text-[#5e6b8c] max-w-lg mx-auto mt-2">
            Explore how our AI agent bridges study materials with interactive gameplay.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">

          {/* Card 1: AI Agent */}
          <div 
            onClick={onNavigateToAgent}
            className="glass-card-strong p-7 rounded-2xl cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all group border border-[rgba(86,128,233,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(86,128,233,0.18), rgba(136,96,208,0.18))', border: '1px solid rgba(86,128,233,0.25)' }}>
                <Bot size={24} style={{ color: '#5680E9' }} />
              </div>
              <h3 className="font-pixel text-lg font-bold text-[#1e2440] mb-2 group-hover:text-[#5680E9] transition-colors">
                AI Game Agent
              </h3>
              <p className="text-xs text-[#5e6b8c] leading-relaxed mb-6">
                Type any curriculum topic or upload your presentation slides. The AI synthesizes interactive HTML5 game mechanics calibrated to your student grade level.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-pixel font-bold text-[#5680E9]">
              <span>Open AI Agent</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Document Grounding */}
          <div 
            onClick={onNavigateToAgent}
            className="glass-card-strong p-7 rounded-2xl cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all group border border-[rgba(86,128,233,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(90,185,234,0.18), rgba(86,128,233,0.18))', border: '1px solid rgba(90,185,234,0.25)' }}>
                <Presentation size={24} style={{ color: '#1f8ebd' }} />
              </div>
              <h3 className="font-pixel text-lg font-bold text-[#1e2440] mb-2 group-hover:text-[#5680E9] transition-colors">
                PDF & PPT Grounding
              </h3>
              <p className="text-xs text-[#5e6b8c] leading-relaxed mb-6">
                Upload university lecture decks, high school syllabi, or school notes. Inspect slides side-by-side with your game using our slide-over Document Viewer.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-pixel font-bold text-[#1f8ebd]">
              <span>Upload & Play</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Educational Mission */}
          <div 
            onClick={onNavigateToAbout}
            className="glass-card-strong p-7 rounded-2xl cursor-pointer hover:shadow-2xl hover:-translate-y-1.5 transition-all group border border-[rgba(86,128,233,0.25)] flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgba(136,96,208,0.18), rgba(86,128,233,0.18))', border: '1px solid rgba(136,96,208,0.25)' }}>
                <Trophy size={24} style={{ color: '#8860D0' }} />
              </div>
              <h3 className="font-pixel text-lg font-bold text-[#1e2440] mb-2 group-hover:text-[#8860D0] transition-colors">
                About Learn & Play
              </h3>
              <p className="text-xs text-[#5e6b8c] leading-relaxed mb-6">
                Built on pedagogical principles that replace passive memorization with active recall, micro-challenges, and immediate mastery feedback.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-pixel font-bold text-[#8860D0]">
              <span>Learn Our Mission</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
