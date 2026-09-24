import { useState } from 'react';
import { 
  X, FileText, Presentation, ChevronRight, ChevronLeft, 
  Sparkles, BookOpen, Layers, CheckCircle2, Bot, ExternalLink, Tag
} from 'lucide-react';
import { getDocumentDetails } from '../data/mockData';

export default function DocumentSideViewer({ documentData, onClose, onSelectTopic }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!documentData) return null;

  const doc = getDocumentDetails(documentData.name, documentData.type);
  const currentSlide = doc.slides[currentSlideIndex] || doc.slides[0];

  const handleQuizSlide = () => {
    if (onSelectTopic) {
      onSelectTopic(currentSlide.title);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in" style={{ background: 'rgba(30, 36, 64, 0.40)', backdropFilter: 'blur(4px)' }}>
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Side Drawer Panel */}
      <div 
        className="relative w-full max-w-xl h-full shadow-2xl flex flex-col z-10 animate-slide-left overflow-hidden drawer-panel"
        style={{
          borderLeft: '1.5px solid rgba(86, 128, 233, 0.28)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)',
        }}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[rgba(86,128,233,0.18)] flex items-center justify-between drawer-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
              style={{
                background: doc.format === 'PDF' 
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.25))' 
                  : 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.25))',
                color: doc.format === 'PDF' ? '#dc2626' : '#ea580c',
                border: '1px solid rgba(86, 128, 233, 0.20)',
              }}>
              {doc.format === 'PDF' ? <FileText size={20} /> : <Presentation size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1e2440] truncate max-w-[260px] sm:max-w-xs">
                  {doc.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(86,128,233,0.12)] text-[#5680E9]">
                  {doc.format}
                </span>
              </div>
              <p className="text-[11px] text-[#5e6b8c] mt-0.5">
                {doc.totalSlides} Slides Extracted · {doc.extractedTerms} Terms · {doc.size}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7e8dae] hover:text-[#1e2440] hover:bg-[rgba(86,128,233,0.10)] transition-colors"
            title="Close viewer"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Agent Status Pill */}
        <div className="px-6 py-2.5 bg-[rgba(86,128,233,0.06)] border-b border-[rgba(86,128,233,0.12)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#5680E9] font-semibold">
            <Bot size={15} />
            <span>AI Document Grounding Engine Active</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Parsed 100%
          </span>
        </div>

        {/* Slide / Page Carousel Selector Tabs */}
        <div className="px-6 py-3 border-b border-[rgba(86,128,233,0.14)] bg-white/70 overflow-x-auto flex gap-2">
          {doc.slides.map((slide, index) => {
            const active = index === currentSlideIndex;
            return (
              <button
                key={slide.num}
                onClick={() => setCurrentSlideIndex(index)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active 
                    ? 'bg-gradient-to-r from-[#5680E9] to-[#8860D0] text-white shadow-md' 
                    : 'bg-white border border-[rgba(86,128,233,0.22)] text-[#4a5578] hover:bg-[rgba(86,128,233,0.08)]'
                }`}
              >
                <span>Slide {slide.num}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Content Viewer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Current Slide Card */}
          <div className="rounded-2xl p-6 bg-white border border-[rgba(86,128,233,0.25)] shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(86,128,233,0.15)]">
              <span className="text-[11px] font-extrabold text-[#5680E9] uppercase tracking-wider">
                Slide {currentSlide.num} of {doc.totalSlides}
              </span>
              <span className="text-xs text-[#7e8dae]">
                Extracted Presentation Layer
              </span>
            </div>

            <h4 className="text-base font-extrabold text-[#1e2440] leading-snug">
              {currentSlide.title}
            </h4>

            <p className="text-xs text-[#5e6b8c] italic bg-[rgba(86,128,233,0.05)] p-3 rounded-xl border border-[rgba(86,128,233,0.15)]">
              "{currentSlide.summary}"
            </p>

            {/* Extracted Key Bullet Points */}
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-bold text-[#1e2440] uppercase tracking-wider">
                Extracted Slide Notes:
              </p>
              <ul className="space-y-2 text-xs text-[#2c385a]">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5680E9] flex-shrink-0 mt-1.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Extracted Concepts */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-[#7e8dae] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={12} /> AI Concept Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentSlide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-[rgba(86,128,233,0.08)] text-[#5680E9] border border-[rgba(86,128,233,0.20)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Quiz on this slide */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleQuizSlide}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(86,128,233,0.15), rgba(136,96,208,0.15))',
                  border: '1px solid rgba(86,128,233,0.30)',
                  color: '#5680E9',
                }}
              >
                <Sparkles size={14} />
                <span>Focus AI Game Generator on Slide {currentSlide.num}</span>
              </button>
            </div>
          </div>

          {/* AI Pedagogical Insight Note */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-[rgba(86,128,233,0.20)] flex items-start gap-3">
            <Bot size={20} className="text-[#5680E9] flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#1e2440]">AI Pedagogical Agent Memory</p>
              <p className="text-[#5e6b8c] leading-relaxed">
                When you click <strong>Generate Game</strong>, the AI extracts quiz logic, challenge definitions, and feedback loops directly from these presentation slides.
              </p>
            </div>
          </div>

        </div>

        {/* Drawer Footer with Prev / Next */}
        <div className="px-6 py-4 border-t border-[rgba(86,128,233,0.18)] flex items-center justify-between drawer-footer">
          <button
            onClick={() => setCurrentSlideIndex(i => Math.max(0, i - 1))}
            disabled={currentSlideIndex === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[rgba(86,128,233,0.25)] text-[#5680E9] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(86,128,233,0.08)] flex items-center gap-1"
          >
            <ChevronLeft size={14} /> Previous Slide
          </button>

          <span className="text-xs text-[#7e8dae] font-medium">
            {currentSlideIndex + 1} / {doc.totalSlides}
          </span>

          <button
            onClick={() => setCurrentSlideIndex(i => Math.min(doc.slides.length - 1, i + 1))}
            disabled={currentSlideIndex === doc.slides.length - 1}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[rgba(86,128,233,0.25)] text-[#5680E9] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[rgba(86,128,233,0.08)] flex items-center gap-1"
          >
            Next Slide <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
