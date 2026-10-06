import React, { useState } from 'react';
import ChatInterface from './ChatInterface';
import { 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Users2,
  Clock,
  ArrowRight,
  Palette
} from 'lucide-react';
import { useTheme, THEMES } from './ThemeContext';

const FEATURE_DETAILS = [
  {
    id: 'citations',
    title: 'Grounded Policy Citations',
    shortDesc: 'Answers cite exact handbook sections (e.g., Remote Policy, Leave rules) so employees can trust responses.',
    icon: <FileText size={18} />,
    iconLarge: <FileText size={32} className="text-blue-400" />,
    color: 'bg-blue-500/20 text-blue-400',
    content: 'Our RAG (Retrieval-Augmented Generation) pipeline ensures that every answer is grounded in actual enterprise policy documents. By utilizing a secure vector database of company handbooks, the AI avoids hallucination and always provides the exact section it pulled the information from. This builds absolute trust with employees.'
  },
  {
    id: 'persona',
    title: 'Multi-Persona Context',
    shortDesc: 'Switch between employee profiles (Alex, Sarah, Jordan, etc.) to view personalized greetings, leave balances, and cited policies.',
    icon: <Users2 size={18} />,
    iconLarge: <Users2 size={32} className="text-purple-400" />,
    color: 'bg-purple-500/20 text-purple-400',
    content: 'The Copilot integrates directly with the company\'s HRIS (Human Resources Information System). It knows who it is talking to. If an employee asks \'what is my leave balance?\', the bot doesn\'t ask for an employee ID. It automatically pulls their secure profile context and responds with exact numbers.'
  },
  {
    id: 'speed',
    title: 'Seconds Instead of Days',
    shortDesc: 'Eliminates repetitive email tickets for common WFH, onboarding, and reimbursement policies.',
    icon: <Clock size={18} />,
    iconLarge: <Clock size={32} className="text-emerald-400" />,
    color: 'bg-emerald-500/20 text-emerald-400',
    content: 'The average HR ticket takes 1.5 days to resolve. 70% of these tickets are repetitive policy questions (e.g. \'Can I expense this monitor?\'). The Enterprise HR Copilot resolves these queries in under 3 seconds, saving thousands of hours for both employees and HR staff annually.'
  },
  {
    id: 'handoff',
    title: 'Clean Human Hand-off',
    shortDesc: 'Seamless fallback to real HR contact (Sarah Jenkins) whenever confident answering is unavailable.',
    icon: <HelpCircle size={18} />,
    iconLarge: <HelpCircle size={32} className="text-amber-400" />,
    color: 'bg-amber-500/20 text-amber-400',
    content: 'AI should know its limits. If an employee asks a sensitive question (e.g. harassment reporting, complex salary negotiations), the Copilot\'s confidence threshold drops. It automatically halts AI generation and escalates the chat directly to a human HR Business Partner (like Sarah Jenkins), transferring the full context of the conversation.'
  }
];

function App() {
  const { theme, setThemeId, themeId } = useTheme();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <div 
      className={`min-h-screen ${theme.appBg} ${theme.appText} font-sans selection:bg-blue-500 selection:text-white transition-colors duration-700 relative overflow-hidden`}
    >
      {/* Background ambient glow effect */}
      <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${theme.glow}`} />

      {/* Subtle geometric grid background overlay */}
      <div 
        className="absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none transition-all duration-700"
        style={{
          backgroundImage: `linear-gradient(to right, ${theme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${theme.gridColor} 1px, transparent 1px)`
        }}
      />

      {/* Top Hackathon Banner */}
      <header className={`border-b ${theme.headerBg} backdrop-blur-xl sticky top-0 z-40 transition-colors duration-700`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-xl tracking-tight bg-gradient-to-r ${theme.logoGradient} bg-clip-text text-transparent transition-all duration-700`}>
                Microsoft Innovate 2026
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full ${theme.tagClass} font-semibold hidden sm:inline-block transition-colors duration-700 border`}>
                Round 1 • Idea Submission
              </span>
            </div>
            <span className={`${theme.appMuted} hidden md:inline transition-colors duration-700`}>|</span>
            <div className={`hidden md:flex items-center gap-2 text-xs ${theme.appMuted} transition-colors duration-700`}>
              <span className={`font-semibold ${theme.appText} transition-colors duration-700`}>Team Glitch Theory</span>
              <span>•</span>
              <span>Team #279</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Theme Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowThemes(!showThemes)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.cardBg} ${theme.appText} hover:bg-opacity-80 transition-colors border border-transparent hover:border-blue-500/30`}
              >
                <Palette size={14} className={theme.accentText} />
                <span className="hidden sm:inline font-medium">{theme.name}</span>
              </button>
              
              {showThemes && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemes(false)} />
                  <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 border ${theme.cardBg} backdrop-blur-xl ${theme.headerBg.replace('/60', '')}`}>
                    {Object.values(THEMES).map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setThemeId(t.id); setShowThemes(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${themeId === t.id ? t.tagClass : `${theme.appText} hover:bg-black/10 hover:bg-white/10`}`}
                      >
                        {t.name}
                        {themeId === t.id && <div className={`w-1.5 h-1.5 rounded-full bg-current`} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={`w-2.5 h-2.5 rounded-full bg-current animate-pulse hidden sm:block ${theme.accentText}`} />
            <span className={`font-bold hidden sm:block ${theme.accentText}`}>HR Copilot Live</span>
          </div>
        </div>
      </header>

      {/* Main Hackathon Project Dashboard Area */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative">
        <div className="max-w-2xl">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${theme.tagClass} border text-xs font-semibold mb-4 transition-colors duration-700`}>
            <Sparkles size={14} className={theme.accentText} />
            Smart Assistants & Chatbots
          </div>

          <h1 className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${theme.appText} mb-4 leading-tight transition-colors duration-700`}>
            The HR Team Answering the <br className="hidden sm:block" />
            <span className={`bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent transition-all duration-700`}>
              Same 20 Questions
            </span>
          </h1>

          <p className={`text-lg ${theme.appMuted} leading-relaxed mb-8 transition-colors duration-700`}>
            An intelligent, enterprise-grade HR FAQ copilot that gives employees instant, policy-backed, cited answers—with personalized context per team member and seamless human escalation.
          </p>

          {/* Solution Highlight Grid (Netflix Style Hover Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {FEATURE_DETAILS.map((feature, index) => (
              <div key={feature.id} className="relative z-10 hover:z-50 group flex">
                
                {/* Uniform invisible spacer to keep all grid items exactly the same size */}
                <div className="opacity-0 pointer-events-none w-full h-[180px] sm:h-[190px]"></div>

                {/* The actual interactive scaling card */}
                <div className={`absolute top-0 left-0 w-full min-h-full rounded-2xl border ${theme.cardBg} backdrop-blur-md transition-all duration-300 ease-out group-hover:scale-[1.08] group-hover:-translate-y-2 ${theme.cardHoverBg} group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] origin-top flex flex-col p-5`}>
                  
                  <div className={`w-10 h-10 rounded-xl ${theme.featureColors[index]} flex items-center justify-center mb-3 transition-all duration-700 group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className={`text-sm font-bold ${theme.appText} mb-1.5 transition-colors duration-700`}>{feature.title}</h3>
                  
                  <p className={`text-xs ${theme.appMuted} leading-relaxed ${theme.appMutedHover} transition-colors duration-300`}>
                    {feature.shortDesc}
                  </p>

                  {/* Expanded Details Section */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-out">
                    <div className="overflow-hidden">
                      <div className={`pt-3 mt-3 border-t border-black/10 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100`}>
                        <p className={`text-[11px] ${theme.appText} opacity-90 leading-relaxed font-medium transition-colors duration-700`}>
                          {feature.content}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          <div className={`p-4 rounded-2xl border ${theme.bannerBg} flex items-center justify-between transition-colors duration-700`}>
            <div>
              <p className={`text-xs font-bold ${theme.accentText} uppercase tracking-wider mb-0.5 transition-colors duration-700`}>Interactive Live Prototype</p>
              <p className={`text-xs ${theme.appMuted} transition-colors duration-700`}>
                👉 Click any employee tab in the widget on the bottom right to see customized HR responses!
              </p>
            </div>
            <ArrowRight size={20} className={`${theme.accentText} animate-pulse hidden sm:block flex-shrink-0 transition-colors duration-700`} />
          </div>
        </div>
      </main>

      {/* Floating Chat Interface */}
      <ChatInterface />
    </div>
  );
}

export default App;
