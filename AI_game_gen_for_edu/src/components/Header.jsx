export default function Header() {
  return (
    <header className="relative text-center pt-10 pb-6 px-6 overflow-hidden">
      {/* Soft luminous ambient glow */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(132, 206, 235, 0.35) 0%, rgba(136, 96, 208, 0.15) 50%, transparent 75%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Website Logo Display */}
      <div className="relative inline-flex items-center justify-center p-2 mb-4 rounded-2xl glass-card transition-transform duration-300 hover:scale-105"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          boxShadow: '0 8px 30px rgba(86, 128, 233, 0.14)',
          border: '1.5px solid rgba(86, 128, 233, 0.22)',
        }}>
        <img
          src="/logo.png"
          alt="Learn & Play Logo"
          className="h-16 w-auto sm:h-20 object-contain drop-shadow-sm"
        />
      </div>

      {/* Title */}
      <h1 className="font-pixel text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">
        <span className="gradient-text">AI Game Agent</span>
      </h1>

      <p className="font-pixel text-base sm:text-xl font-bold mb-2 text-[#1e2440]">
        Interactive Educational Game Synthesizer
      </p>

      <p style={{ color: '#536280', maxWidth: '36rem', margin: '0 auto', lineHeight: '1.6' }}
        className="text-xs sm:text-sm font-normal">
        Type any topic or upload your <strong>PDF</strong> / <strong>PowerPoint (PPT)</strong> slides below. The AI works with either or both!
      </p>
    </header>
  );
}
