import React from 'react';
import { Info, Sparkles } from 'lucide-react';

export const MessageBubble = ({ msg, onSelectSuggestion }) => {
  const isBot = msg.sender === 'bot';
  const isAgent = msg.sender === 'agent';
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
      {isAgent && (
        <span className="text-xs font-bold text-slate-800 drop-shadow-md mb-1 ml-2 uppercase tracking-wider">
          {msg.agentName || 'Sarah Jenkins'} • HR Contact
        </span>
      )}
      
      {isBot && (
        <div className="flex items-center gap-2 mb-1 ml-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Enterprise HR Copilot
          </span>
          {msg.backendSource && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border shadow-xs ${
              msg.backendSource.includes('Gemini') || msg.isGemini
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/40 shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              <Sparkles size={10} className={msg.backendSource.includes('Gemini') || msg.isGemini ? 'text-amber-300 animate-spin-slow' : 'text-slate-500'} />
              {msg.backendSource}
            </span>
          )}
          {msg.confidence !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border shadow-xs ${
              msg.confidence >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
              msg.confidence >= 70 ? 'bg-amber-100 text-amber-700 border-amber-300' :
              'bg-rose-100 text-rose-700 border-rose-300'
            }`}>
              Confidence: {msg.confidence}%
            </span>
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[92%]`}>
        <div 
          className={`px-5 py-4 rounded-[22px] shadow-[0_10px_40px_rgb(0,0,0,0.12)] text-[16px] leading-relaxed backdrop-blur-3xl border font-medium ${
            isUser 
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500/50 text-white rounded-br-sm shadow-[0_8px_25px_rgba(37,99,235,0.25)]' 
              : isAgent
                ? 'bg-purple-50/95 border-purple-200 text-slate-900 rounded-bl-sm shadow-[inset_0_0_20px_rgba(168,85,247,0.08)]'
                : 'bg-white/95 border-white text-slate-900 rounded-bl-sm shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]'
          }`}
        >
          <p className="whitespace-pre-wrap tracking-tight leading-relaxed">{msg.text}</p>
          
          {/* Policy Citations */}
          {msg.citations && msg.citations.length > 0 && (
            <div className={`mt-3 pt-2.5 border-t flex flex-wrap gap-2 ${isUser ? 'border-white/20' : 'border-slate-900/10'}`}>
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 w-full ${isUser ? 'text-blue-100' : 'text-slate-500'}`}>
                <Info size={12} strokeWidth={2.5} /> Verified Policy Sources:
              </span>
              {msg.citations.map((citation, idx) => (
                <span 
                  key={idx}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors border shadow-sm ${
                    isUser 
                      ? 'bg-white/20 border-white/30 text-white' 
                      : 'bg-slate-100/90 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {citation}
                </span>
              ))}
            </div>
          )}

          {/* Contextual Suggestions: Directly underneath the AI's answer */}
          {isBot && msg.suggestions && msg.suggestions.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-600" />
                Suggested Follow-up Questions:
              </div>
              <div className="flex flex-wrap gap-2">
                {msg.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion && onSelectSuggestion(suggestion)}
                    className="text-left text-xs font-semibold px-3 py-1.5 bg-blue-50/90 hover:bg-blue-600 text-blue-950 hover:text-white rounded-xl transition-all duration-200 border border-blue-200/70 hover:border-blue-600 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-semibold drop-shadow-sm mt-1 px-2">{msg.timestamp}</span>
      </div>
    </div>
  );
};
