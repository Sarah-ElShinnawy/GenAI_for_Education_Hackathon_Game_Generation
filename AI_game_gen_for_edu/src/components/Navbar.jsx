import { useState } from 'react';
import { Gamepad2, Menu, X, ArrowRight, Sparkles, Home, Info, Bot, Sun, Moon } from 'lucide-react';

export default function Navbar({ activePage, onNavigate, onQuickPlay, isDark, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home',     label: 'HOME',     icon: Home },
    { id: 'ai-agent', label: 'AI Agent', icon: Bot },
    { id: 'about',    label: 'About Us', icon: Info },
  ];

  const handleNav = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 px-4 sm:px-8 py-3 transition-all duration-300"
      style={{
        background: isDark ? 'rgba(12, 16, 33, 0.88)' : 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: isDark ? '1px solid rgba(86, 128, 233, 0.28)' : '1px solid rgba(86, 128, 233, 0.18)',
        boxShadow: isDark ? '0 4px 25px -2px rgba(0, 0, 0, 0.6)' : '0 4px 20px -2px rgba(86, 128, 233, 0.08)',
      }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3 group text-left transition-transform hover:scale-[1.02]"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center p-1"
            style={{
              background: 'linear-gradient(135deg, rgba(86, 128, 233, 0.14), rgba(136, 96, 208, 0.14))',
              border: isDark ? '1px solid rgba(86, 128, 233, 0.38)' : '1px solid rgba(86, 128, 233, 0.25)',
            }}>
            <img
              src="/logo.png"
              alt="Learn & Play Logo"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-pixel text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#1e2440]'}`}>
                Learn <span className="text-[#5AB9EA]">&</span> <span className="text-[#8860D0]">Play</span>
              </span>
              <span className="font-pixel text-[9px] font-bold px-1.5 py-0.2 rounded-full"
                style={{
                  background: 'rgba(86, 128, 233, 0.14)',
                  color: isDark ? '#84CEEB' : '#5680E9',
                  border: isDark ? '1px solid rgba(86, 128, 233, 0.38)' : '1px solid rgba(86, 128, 233, 0.25)',
                }}>
                AI
              </span>
            </div>
            <p className={`text-[9px] font-medium tracking-wider uppercase -mt-0.5 hidden sm:block ${isDark ? 'text-[#94a3b8]' : 'text-[#7e8dae]'}`}>
              Educational Game Generator
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links — 4 Separate Pages */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full"
          style={{
            background: isDark ? 'rgba(86, 128, 233, 0.12)' : 'rgba(86, 128, 233, 0.06)',
            border: isDark ? '1px solid rgba(86, 128, 233, 0.28)' : '1px solid rgba(86, 128, 233, 0.14)',
          }}>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className="relative px-4 py-2 rounded-full font-pixel text-xs font-bold tracking-wider transition-all duration-200"
                style={{
                  color: isActive ? '#ffffff' : (isDark ? '#94a3b8' : '#5e6b8c'),
                  background: isActive ? 'linear-gradient(135deg, #5680E9, #8860D0)' : 'transparent',
                  boxShadow: isActive ? '0 3px 12px rgba(86, 128, 233, 0.35)' : 'none',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right CTA / Quick Agent Launch + Theme Switcher */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Sun / Moon Theme Toggle */}
          <button
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            type="button"
            className="p-2 rounded-xl transition-all duration-300 flex items-center justify-center hover:scale-105 cursor-pointer"
            style={{
              background: isDark ? 'rgba(86, 128, 233, 0.20)' : 'rgba(86, 128, 233, 0.08)',
              border: isDark ? '1px solid rgba(132, 206, 235, 0.38)' : '1px solid rgba(86, 128, 233, 0.24)',
              boxShadow: isDark ? '0 0 14px rgba(90, 185, 234, 0.28)' : '0 2px 6px rgba(86, 128, 233, 0.06)',
            }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={17} className="text-amber-300 animate-spin-slow" />
            ) : (
              <Moon size={17} className="text-[#5680E9]" />
            )}
          </button>

          <button
            onClick={() => { handleNav('ai-agent'); onQuickPlay?.(); }}
            className="btn-primary py-2 px-4 text-xs font-pixel tracking-wide flex items-center gap-2 shadow-md hover:scale-[1.03]"
          >
            <Bot size={14} />
            <span>Launch AI Agent</span>
          </button>
        </div>

        {/* Mobile Header: Theme Switcher + Hamburger */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={onToggleTheme}
            type="button"
            className="p-2 rounded-xl transition-all flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(86, 128, 233, 0.20)' : 'rgba(86, 128, 233, 0.08)',
              border: isDark ? '1px solid rgba(132, 206, 235, 0.38)' : '1px solid rgba(86, 128, 233, 0.24)',
            }}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun size={18} className="text-amber-300" />
            ) : (
              <Moon size={18} className="text-[#5680E9]" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'text-white hover:bg-[rgba(86,128,233,0.20)]' : 'text-[#1e2440] hover:bg-[rgba(86,128,233,0.10)]'}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-3 px-2 border-t mt-3 animate-slide-up rounded-2xl"
          style={{ 
            borderColor: isDark ? 'rgba(86, 128, 233, 0.25)' : 'rgba(86, 128, 233, 0.15)',
            background: isDark ? 'rgba(12, 16, 33, 0.95)' : 'transparent',
          }}>
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-pixel text-xs font-semibold transition-all text-left"
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #5680E9, #8860D0)' : 'transparent',
                    color: isActive ? '#ffffff' : (isDark ? '#e2e8f0' : '#1e2440'),
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#ffffff' : '#5680E9' }} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => { handleNav('ai-agent'); onQuickPlay?.(); }}
              className="btn-primary mt-2 py-3 font-pixel text-xs w-full flex items-center justify-center gap-2"
            >
              <Bot size={14} />
              <span>Launch AI Agent Now</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
