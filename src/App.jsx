import React from 'react';
import ChatInterface from './ChatInterface';
import { 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Users2,
  Clock,
  ArrowRight
} from 'lucide-react';

function App() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white font-sans selection:bg-blue-500 selection:text-white"
    >
      {/* Subtle geometric grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Hackathon Banner */}
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                Microsoft Innovate 2026
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                Round 1 • Idea Submission
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-white">Team Glitch Theory</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Team #279</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline text-slate-400">Bennett University • Times Group</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-semibold">HR Copilot Live</span>
          </div>
        </div>
      </header>

      {/* Main Hackathon Project Dashboard Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles size={14} className="text-indigo-400" />
            Smart Assistants & Chatbots (Enterprise Conversational AI)
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            The HR Team Answering the <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Same 20 Questions
            </span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            An intelligent, enterprise-grade HR FAQ copilot that gives employees instant, policy-backed, cited answers—with personalized context per team member and seamless human escalation.
          </p>

          {/* Solution Highlight Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Grounded Policy Citations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answers cite exact handbook sections (e.g., Remote Policy, Leave rules) so employees can trust responses.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Users2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Multi-Persona Context</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Switch between employee profiles (Alex, Sarah, Jordan, etc.) to view personalized greetings, leave balances, and cited policies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Clock size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Seconds Instead of Days</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminates repetitive email tickets for common WFH, onboarding, and reimbursement policies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <HelpCircle size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Clean Human Hand-off</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless fallback to real HR contact (Sarah Jenkins) whenever confident answering is unavailable.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-0.5">Interactive Live Prototype</p>
              <p className="text-xs text-slate-300">
                👉 Click any employee tab in the widget on the bottom right to see customized HR responses!
              </p>
            </div>
            <ArrowRight size={20} className="text-blue-400 animate-pulse hidden sm:block flex-shrink-0" />
          </div>
        </div>
      </main>

      {/* Floating Chat Interface */}
      <ChatInterface />
    </div>
  );
}

export default App;
