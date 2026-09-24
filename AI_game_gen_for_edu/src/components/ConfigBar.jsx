import { useState, useRef, useEffect } from 'react';
import { 
  Search, Loader2, Wand2, GraduationCap, BookOpenCheck, School, 
  UploadCloud, FileText, Presentation, CheckCircle2, X, Sparkles, 
  Paperclip, BookOpen, Bot
} from 'lucide-react';
import { SUGGESTION_TOPICS, LEVELS } from '../data/mockData';

const LEVEL_ICONS = {
  elementary: School,
  highschool: GraduationCap,
  university: BookOpenCheck,
};

export default function ConfigBar({ onGenerate, isLoading, onOpenDocViewer, externalTopic }) {
  const [topic, setTopic]               = useState('');
  const [level, setLevel]               = useState('highschool');
  const [activePill, setActivePill]     = useState(null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging]     = useState(false);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    if (externalTopic) {
      setTopic(externalTopic);
    }
  }, [externalTopic]);

  const handlePillClick = (label) => { 
    setTopic(label); 
    setActivePill(label); 
  };
  
  const handleTopicChange = (e) => { 
    setTopic(e.target.value); 
    setActivePill(null); 
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'ppt', 'pptx'].includes(ext)) {
      alert('Please upload a PDF or PowerPoint (.ppt, .pptx) presentation.');
      return;
    }
    const cleanName = file.name.replace(/\.[^/.]+$/, "");
    setUploadedFile({
      name: file.name,
      baseName: cleanName,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: ext.toUpperCase(),
      fileRef: file,
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    const hasTopic = !!topic.trim();
    const hasFile  = !!uploadedFile;
    if (!hasTopic && !hasFile) return;

    if (hasTopic && hasFile) {
      onGenerate({
        topic: topic.trim(),
        level,
        sourceType: 'combined',
        documentData: {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size,
          focus: topic.trim(),
          file: uploadedFile.fileRef,
        }
      });
    } else if (hasFile) {
      onGenerate({
        topic: uploadedFile.baseName,
        level,
        sourceType: 'document',
        documentData: {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size,
          focus: '',
          file: uploadedFile.fileRef,
        }
      });
    } else {
      onGenerate({
        topic: topic.trim(),
        level,
        sourceType: 'topic',
      });
    }
  };

  // Enabled if EITHER topic OR file is provided
  const isSubmitDisabled = !topic.trim() && !uploadedFile;

  const getSubmitLabel = () => {
    if (isLoading) {
      return <><Loader2 size={16} className="animate-spin" />Generating…</>;
    }
    if (topic.trim() && uploadedFile) {
      return <><Sparkles size={16} />Generate Game (Topic + File)</>;
    }
    if (uploadedFile) {
      return <><FileText size={16} />Generate Game from Document</>;
    }
    return <><Wand2 size={16} />Generate Game</>;
  };

  return (
    <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="glass-card-strong p-6 sm:p-8 shadow-2xl relative">

        {/* AI Agent Status Pill Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[rgba(86,128,233,0.18)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(86,128,233,0.18), rgba(136,96,208,0.18))' }}>
              <Bot size={18} style={{ color: '#5680E9' }} />
            </div>
            <div>
              <p className="font-pixel text-xs font-bold text-[#1e2440]">AI Game Synthesizer</p>
              <p className="text-[11px] text-[#5e6b8c]">Type any topic, attach slides, or do both</p>
            </div>
          </div>

          <span className="font-pixel text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Agent Online
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Hidden File Input for browser selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          {/* ── 1. TOPIC OR PROMPT INPUT ── */}
          <div className="space-y-2">
            <label htmlFor="topic-input" className="block font-pixel text-xs font-bold text-[#1e2440] uppercase tracking-wider">
              1. Type Topic or Prompt (Optional if uploading file)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} style={{ color: '#5680E9' }} />
              </div>
              <input
                id="topic-input"
                type="text"
                value={topic}
                onChange={handleTopicChange}
                placeholder="What topic do you want to learn? (e.g. Photosynthesis, Cell Mitosis, World War II...)"
                disabled={isLoading}
                autoComplete="off"
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '13px',
                  paddingBottom: '13px',
                  borderRadius: '12px',
                  fontSize: '0.925rem',
                  background: 'var(--bg-card, #ffffff)',
                  border: '1.5px solid rgba(86, 128, 233, 0.28)',
                  color: 'var(--text-main, #1e2440)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(86, 128, 233, 0.05)',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#5680E9';
                  e.target.style.boxShadow   = '0 0 0 3.5px rgba(86, 128, 233, 0.15)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(86, 128, 233, 0.28)';
                  e.target.style.boxShadow   = '0 2px 8px rgba(86, 128, 233, 0.05)';
                }}
              />
            </div>

            {/* Suggestion Quick Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTION_TOPICS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`suggestion-pill ${activePill === s.label ? 'active' : ''}`}
                  onClick={() => handlePillClick(s.label)}
                  disabled={isLoading}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. DOCUMENT UPLOAD & ATTACHMENT ── */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-pixel text-xs font-bold text-[#1e2440] uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Attach Document (PDF or PowerPoint)</span>
                <span className="text-[10px] font-normal lowercase px-2 py-0.5 rounded-full bg-[rgba(86,128,233,0.10)] text-[#5680E9]">
                  Optional if typing topic
                </span>
              </label>
              {uploadedFile && (
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-[#dc2626] hover:underline flex items-center gap-1 font-semibold"
                >
                  <X size={12} /> Remove file
                </button>
              )}
            </div>

            {!uploadedFile ? (
              /* Compact Drop & Attach Card */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 group"
                style={{
                  borderColor: isDragging ? '#5680E9' : 'rgba(86, 128, 233, 0.28)',
                  background: isDragging ? 'rgba(86, 128, 233, 0.10)' : 'var(--bg-card, rgba(255, 255, 255, 0.65))',
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(86, 128, 233, 0.14), rgba(136, 96, 208, 0.14))',
                        border: '1px solid rgba(86, 128, 233, 0.25)',
                      }}>
                      <Paperclip size={18} style={{ color: '#5680E9' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1e2440]">
                        Drop your <span className="text-[#5680E9]">PDF</span> or <span className="text-[#8860D0]">PowerPoint (PPT/PPTX)</span>
                      </p>
                      <p className="text-[11px] text-[#5e6b8c]">
                        Drag & drop or <span className="font-semibold text-[#5680E9] underline underline-offset-2">browse files</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Sample Attach Pills */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <span className="text-[10px] text-[#7e8dae] hidden sm:inline">Try sample:</span>
                    <button
                      type="button"
                      onClick={() => handleFileSelect({ name: 'Cell_Biology_Lecture_4.pptx', size: 2840000 })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold glass-card border border-[rgba(86,128,233,0.30)] text-[#5680E9] hover:bg-[rgba(86,128,233,0.08)] transition-all flex items-center gap-1"
                    >
                      <Presentation size={12} className="text-[#ea580c]" />
                      Cell_Biology.pptx
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileSelect({ name: 'World_History_Syllabus.pdf', size: 1420000 })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold glass-card border border-[rgba(86,128,233,0.30)] text-[#5680E9] hover:bg-[rgba(86,128,233,0.08)] transition-all flex items-center gap-1"
                    >
                      <FileText size={12} className="text-[#dc2626]" />
                      History.pdf
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Attached File Card Preview with View Slides Button */
              <div className="p-4 rounded-xl glass-card border border-[rgba(86,128,233,0.35)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                    style={{
                      background: uploadedFile.type === 'PDF' 
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.22))' 
                        : 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.22))',
                      color: uploadedFile.type === 'PDF' ? '#dc2626' : '#c2410c',
                      border: '1px solid rgba(86, 128, 233, 0.20)',
                    }}>
                    {uploadedFile.type === 'PDF' ? <FileText size={18} /> : <Presentation size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#1e2440] truncate max-w-[200px] sm:max-w-md">
                        {uploadedFile.name}
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[rgba(86,128,233,0.10)] text-[#5680E9]">
                        {uploadedFile.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5e6b8c] mt-0.5">
                      {uploadedFile.size} · <span className="text-[#10b981] font-semibold">Attached for Curriculum Source</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onOpenDocViewer && onOpenDocViewer(uploadedFile)}
                    className="px-3 py-1.5 rounded-lg text-xs font-pixel font-bold text-[#5680E9] hover:bg-[rgba(86,128,233,0.10)] border border-[rgba(86,128,233,0.30)] flex items-center gap-1.5 transition-all shadow-sm"
                    title="Inspect slides side-by-side"
                  >
                    <BookOpen size={13} />
                    <span>View Slides on Side</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="p-1.5 rounded-lg text-[#7e8dae] hover:text-[#dc2626] hover:bg-red-50 transition-colors"
                    title="Remove attachment"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Combined Status Callout if both provided */}
          {topic.trim() && uploadedFile && (
            <div className="p-3 rounded-xl border border-[rgba(86,128,233,0.25)] flex items-center gap-2.5 text-xs animate-fade-in"
              style={{ background: 'linear-gradient(135deg, rgba(86,128,233,0.08), rgba(136,96,208,0.08))' }}>
              <Sparkles size={15} style={{ color: '#5680E9', flexShrink: 0 }} />
              <p className="text-[#1e2440]">
                <strong>Combined AI Mode:</strong> The game will ground questions on <strong>{uploadedFile.name}</strong> while targeting your topic <strong>"{topic.trim()}"</strong>.
              </p>
            </div>
          )}

          {/* ── 3. LEVEL SELECTOR + GENERATE BUTTON ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">

            {/* Segmented level toggle */}
            <div
              className="relative flex rounded-xl p-1 flex-1"
              style={{
                background: 'rgba(86, 128, 233, 0.07)',
                border: '1px solid rgba(86, 128, 233, 0.20)',
              }}
            >
              <div
                className="absolute top-1 bottom-1 rounded-[10px] transition-all duration-300 ease-out"
                style={{
                  left:       `calc(${LEVELS.findIndex(l => l.id === level)} * 33.333% + 4px)`,
                  width:      'calc(33.333% - 8px)',
                  background: 'linear-gradient(135deg, #5680E9, #8860D0)',
                  boxShadow:  '0 3px 12px rgba(86, 128, 233, 0.35)',
                }}
              />
              {LEVELS.map((l) => {
                const Icon = LEVEL_ICONS[l.id];
                const active = level === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    id={`level-${l.id}`}
                    className={`level-btn flex-1 flex flex-col items-center gap-1 z-10 ${active ? 'active' : ''}`}
                    onClick={() => setLevel(l.id)}
                    disabled={isLoading}
                  >
                    <Icon size={14} style={{ color: active ? '#ffffff' : '#6b7a9e' }} />
                    <span
                      className="font-pixel text-[11px] font-bold tracking-wide leading-none"
                      style={{ color: active ? '#ffffff' : '#455273' }}
                    >
                      {l.label}
                    </span>
                    <span
                      className="text-[9px] leading-none hidden sm:block"
                      style={{ color: active ? 'rgba(255, 255, 255, 0.85)' : '#7e8cae' }}
                    >
                      {l.sub}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <button
              id="generate-btn"
              type="submit"
              className="btn-primary min-w-[200px] py-3.5 text-sm font-pixel"
              disabled={isSubmitDisabled || isLoading}
            >
              {getSubmitLabel()}
            </button>
          </div>

        </form>
      </div>
    </section>
  );
}
