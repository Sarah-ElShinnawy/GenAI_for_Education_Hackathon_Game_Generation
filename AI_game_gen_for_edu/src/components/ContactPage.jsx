import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, School, HelpCircle, Sparkles } from 'lucide-react';

export default function ContactPage({ onBackToHome }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'student', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch (e) {
      console.warn('Contact submit notice:', e);
    } finally {
      setSending(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: 'rgba(86, 128, 233, 0.10)', border: '1px solid rgba(86, 128, 233, 0.25)' }}>
          <Mail size={13} style={{ color: '#5680E9' }} />
          <span className="text-xs font-bold text-[#5680E9] uppercase tracking-wider">Get in Touch</span>
        </div>
        <h1 className="font-pixel text-4xl sm:text-5xl font-extrabold text-[#1e2440] mb-3">
          Contact <span className="gradient-text">Learn & Play AI</span>
        </h1>
        <p className="text-sm sm:text-base text-[#536280] max-w-xl mx-auto">
          Have questions, suggestions for new game mechanics, or want to integrate Learn & Play AI into your classroom? We’d love to hear from you.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        
        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          
          <div className="glass-card-strong p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(86, 128, 233, 0.12)', border: '1px solid rgba(86, 128, 233, 0.25)' }}>
              <Mail size={18} style={{ color: '#5680E9' }} />
            </div>
            <h3 className="text-sm font-bold text-[#1e2440] mb-1">Direct Support</h3>
            <p className="text-xs text-[#5e6b8c] mb-2">Technical help, prompt guidance, or general questions.</p>
            <a href="mailto:support@learnandplay.ai" className="text-xs font-semibold text-[#5680E9] hover:underline">
              support@learnandplay.ai
            </a>
          </div>

          <div className="glass-card-strong p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(90, 185, 234, 0.14)', border: '1px solid rgba(90, 185, 234, 0.30)' }}>
              <School size={18} style={{ color: '#1f8ebd' }} />
            </div>
            <h3 className="text-sm font-bold text-[#1e2440] mb-1">School & Teacher Partnerships</h3>
            <p className="text-xs text-[#5e6b8c] mb-2">Classroom licensing, LMS integration, and teacher workshops.</p>
            <a href="mailto:education@learnandplay.ai" className="text-xs font-semibold text-[#1f8ebd] hover:underline">
              education@learnandplay.ai
            </a>
          </div>

          <div className="glass-card-strong p-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(136, 96, 208, 0.12)', border: '1px solid rgba(136, 96, 208, 0.25)' }}>
              <Clock size={18} style={{ color: '#8860D0' }} />
            </div>
            <h3 className="text-sm font-bold text-[#1e2440] mb-1">Rapid Response</h3>
            <p className="text-xs text-[#5e6b8c]">Our educational and AI engineering team responds to inquiries within 24 hours on weekdays.</p>
          </div>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 glass-card-strong p-8 sm:p-10 shadow-xl">
          {submitted ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-5"
                style={{ background: 'rgba(86, 128, 233, 0.12)', border: '1.5px solid rgba(86, 128, 233, 0.35)' }}>
                <CheckCircle2 size={32} style={{ color: '#5680E9' }} />
              </div>
              <h2 className="text-2xl font-bold text-[#1e2440] mb-2">Message Received!</h2>
              <p className="text-sm text-[#5e6b8c] max-w-md mx-auto mb-8 leading-relaxed">
                Thank you, <strong>{form.name}</strong>. Our educational team has received your message and will reach out to <strong>{form.email}</strong> shortly.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', role: 'student', subject: '', message: '' }); }}
                  className="control-btn text-xs"
                >
                  Send Another Message
                </button>
                <button onClick={onBackToHome} className="btn-primary text-xs py-2.5 px-6">
                  Back to Generator
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1e2440] uppercase tracking-wider mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Alex Johnson"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[rgba(86,128,233,0.25)] text-[#1e2440] focus:border-[#5680E9] focus:ring-2 focus:ring-[rgba(86,128,233,0.20)] outline-none transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e2440] uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="alex@school.edu"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[rgba(86,128,233,0.25)] text-[#1e2440] focus:border-[#5680E9] focus:ring-2 focus:ring-[rgba(86,128,233,0.20)] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1e2440] uppercase tracking-wider mb-2">
                    I Am A...
                  </label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[rgba(86,128,233,0.25)] text-[#1e2440] focus:border-[#5680E9] outline-none transition-all shadow-sm cursor-pointer"
                  >
                    <option value="student">Student / Self-Learner</option>
                    <option value="teacher">Teacher / Educator</option>
                    <option value="parent">Parent</option>
                    <option value="developer">Developer / Researcher</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1e2440] uppercase tracking-wider mb-2">
                    Topic / Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Document Upload feedback"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[rgba(86,128,233,0.25)] text-[#1e2440] focus:border-[#5680E9] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e2440] uppercase tracking-wider mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind or how we can help..."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white border border-[rgba(86,128,233,0.25)] text-[#1e2440] focus:border-[#5680E9] focus:ring-2 focus:ring-[rgba(86,128,233,0.20)] outline-none transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-4"
              >
                {sending ? (
                  <span>Sending message…</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
