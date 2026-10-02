import React from 'react';
import { Info } from 'lucide-react';

export const MessageBubble = ({ msg }) => {
  return (
    <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
      {msg.sender === 'agent' && (
        <span className="text-xs font-bold text-slate-800 drop-shadow-md mb-1 ml-2 uppercase tracking-wider">
          {msg.agentName} • HR
        </span>
      )}
      
      <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
        <div 
          className={`px-5 py-3.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-[15px] leading-relaxed backdrop-blur-2xl max-w-[90%] animate-in slide-in-from-bottom-2 fade-in duration-300 border font-medium ${
            msg.sender === 'user' 
              ? 'bg-blue-500/30 border-blue-400/50 text-slate-900 rounded-br-sm shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]' 
              : msg.sender === 'agent'
                ? 'bg-purple-500/30 border-purple-400/50 text-slate-900 rounded-bl-sm shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]'
                : 'bg-emerald-500/30 border-emerald-400/50 text-slate-900 rounded-bl-sm shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]'
          }`}
        >
          <p className="whitespace-pre-wrap tracking-tight">{msg.text}</p>
          
          {msg.citations && msg.citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-900/10 flex flex-wrap gap-2">
              {msg.citations.map((citation, idx) => (
                <button 
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/40 hover:bg-white/60 text-slate-800 text-[11px] font-bold tracking-wide rounded-md transition-colors border border-white/40 shadow-sm"
                >
                  <Info size={12} strokeWidth={2.5} />
                  {citation}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-800 font-semibold drop-shadow-md mt-1 px-2">{msg.timestamp}</span>
      </div>
    </div>
  );
};
