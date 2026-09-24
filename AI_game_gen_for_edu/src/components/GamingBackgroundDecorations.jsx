export default function GamingBackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none gaming-decorations" aria-hidden="true">

      {/* ── 1. Floating PlayStation-Style Game Controller (Top-Right) ── */}
      <div 
        className="absolute -top-6 -right-10 sm:right-6 sm:top-16 w-64 h-64 sm:w-80 sm:h-80 opacity-25 animate-float"
        style={{ animationDuration: '6s' }}
      >
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg transform rotate-12">
          <defs>
            <linearGradient id="padGrad" x1="0" y1="0" x2="200" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5680E9" />
              <stop offset="50%" stopColor="#5AB9EA" />
              <stop offset="100%" stopColor="#8860D0" />
            </linearGradient>
            <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#C1C8E4" />
            </linearGradient>
          </defs>
          {/* Controller Body */}
          <path 
            d="M50 30 C30 30 15 50 10 95 C6 130 25 145 42 140 C55 136 68 105 78 105 L122 105 C132 105 145 136 158 140 C175 145 194 130 190 95 C185 50 170 30 150 30 L50 30 Z" 
            fill="url(#padGrad)" 
            fillOpacity="0.45"
            stroke="#5680E9" 
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Touchpad / Center Panel */}
          <rect x="74" y="40" width="52" height="34" rx="6" fill="#ffffff" fillOpacity="0.6" stroke="#5680E9" strokeWidth="2" />
          {/* Left D-Pad */}
          <path d="M38 64 H46 V56 H54 V64 H62 V72 H54 V80 H46 V72 H38 Z" fill="#ffffff" fillOpacity="0.8" stroke="#5680E9" strokeWidth="1.5" />
          {/* Right Action Buttons (PlayStation Shapes) */}
          <circle cx="154" cy="58" r="4.5" fill="#ffffff" stroke="#8860D0" strokeWidth="1.5" />
          <circle cx="166" cy="68" r="4.5" fill="#ffffff" stroke="#5680E9" strokeWidth="1.5" />
          <circle cx="154" cy="78" r="4.5" fill="#ffffff" stroke="#5AB9EA" strokeWidth="1.5" />
          <circle cx="142" cy="68" r="4.5" fill="#ffffff" stroke="#8860D0" strokeWidth="1.5" />
          {/* Dual Analog Thumbsticks */}
          <circle cx="76" cy="94" r="14" fill="#ffffff" fillOpacity="0.5" stroke="#5680E9" strokeWidth="2" />
          <circle cx="76" cy="94" r="9" fill="url(#padGrad)" fillOpacity="0.6" />
          <circle cx="124" cy="94" r="14" fill="#ffffff" fillOpacity="0.5" stroke="#5680E9" strokeWidth="2" />
          <circle cx="124" cy="94" r="9" fill="url(#padGrad)" fillOpacity="0.6" />
        </svg>
      </div>

      {/* ── 2. Floating Retro Handheld Console / GameBoy Style (Bottom-Left) ── */}
      <div 
        className="absolute bottom-16 -left-8 sm:left-10 w-52 h-64 sm:w-64 sm:h-80 opacity-25 animate-float"
        style={{ animationDuration: '7s', animationDelay: '1.5s' }}
      >
        <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md transform -rotate-12">
          <defs>
            <linearGradient id="retroGrad" x1="0" y1="0" x2="160" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8860D0" />
              <stop offset="50%" stopColor="#5680E9" />
              <stop offset="100%" stopColor="#84CEEB" />
            </linearGradient>
          </defs>
          {/* Body */}
          <rect x="15" y="15" width="130" height="190" rx="18" fill="url(#retroGrad)" fillOpacity="0.35" stroke="#8860D0" strokeWidth="3" />
          {/* Screen Bezel */}
          <rect x="28" y="28" width="104" height="85" rx="8" fill="#ffffff" fillOpacity="0.75" stroke="#5680E9" strokeWidth="2" />
          {/* Inner Display Screen */}
          <rect x="38" y="38" width="84" height="65" rx="4" fill="rgba(86,128,233,0.15)" stroke="#5AB9EA" strokeWidth="1.5" />
          {/* Screen Content Glitch Lines */}
          <line x1="45" y1="52" x2="75" y2="52" stroke="#5680E9" strokeWidth="3" strokeLinecap="round" />
          <line x1="45" y1="62" x2="110" y2="62" stroke="#8860D0" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="45" y1="72" x2="90" y2="72" stroke="#5AB9EA" strokeWidth="2.5" strokeLinecap="round" />
          {/* D-Pad on Console */}
          <path d="M42 144 H50 V136 H58 V144 H66 V152 H58 V160 H50 V152 H42 Z" fill="#5680E9" fillOpacity="0.7" stroke="#ffffff" strokeWidth="1.5" />
          {/* A / B Action Buttons */}
          <circle cx="106" cy="154" r="9" fill="#8860D0" fillOpacity="0.75" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="122" cy="140" r="9" fill="#5680E9" fillOpacity="0.75" stroke="#ffffff" strokeWidth="1.5" />
          {/* Speaker Slots */}
          <line x1="95" y1="184" x2="120" y2="174" stroke="#5680E9" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="98" y1="190" x2="123" y2="180" stroke="#5680E9" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── 3. Floating 3D Torus / Donut Ring (Top-Left) ── */}
      <div 
        className="absolute top-20 left-4 sm:left-24 w-36 h-36 opacity-30 animate-pulse"
        style={{ animationDuration: '5s' }}
      >
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform -rotate-45">
          <ellipse cx="60" cy="60" rx="50" ry="25" fill="none" stroke="url(#padGrad)" strokeWidth="16" strokeLinecap="round" />
          <ellipse cx="60" cy="56" rx="46" ry="21" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.7" />
        </svg>
      </div>

      {/* ── 4. Floating Isometric 3D Gaming Cube (Bottom-Right) ── */}
      <div 
        className="absolute bottom-28 right-8 sm:right-28 w-32 h-32 opacity-30 animate-float"
        style={{ animationDuration: '8s', animationDelay: '2s' }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Top Face */}
          <polygon points="50,15 85,35 50,55 15,35" fill="#84CEEB" fillOpacity="0.6" stroke="#5680E9" strokeWidth="2" />
          {/* Left Face */}
          <polygon points="15,35 50,55 50,90 15,70" fill="#5680E9" fillOpacity="0.7" stroke="#5680E9" strokeWidth="2" />
          {/* Right Face */}
          <polygon points="50,55 85,35 85,70 50,90" fill="#8860D0" fillOpacity="0.75" stroke="#8860D0" strokeWidth="2" />
        </svg>
      </div>

      {/* ── 5. Geometric Plus (+) & Cross (X) Pixel Markers ── */}
      <div className="absolute top-1/3 left-8 text-xl font-black text-[#5680E9] opacity-35 select-none animate-pulse">+</div>
      <div className="absolute top-1/4 right-1/4 text-2xl font-black text-[#8860D0] opacity-30 select-none animate-bounce">×</div>
      <div className="absolute bottom-1/3 left-1/5 text-lg font-black text-[#5AB9EA] opacity-40 select-none">+</div>
      <div className="absolute top-2/3 right-12 text-2xl font-black text-[#C1C8E4] opacity-45 select-none">✦</div>
      <div className="absolute bottom-12 left-1/3 text-xl font-black text-[#5680E9] opacity-30 select-none">▲</div>

    </div>
  );
}
