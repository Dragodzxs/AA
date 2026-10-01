import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, Paperclip, Send, Info, ChevronDown, CheckCircle, AlertTriangle, MessageCircle, X } from 'lucide-react';

// Mock data for the chat
const initialMessages = [
  { id: 1, sender: 'bot', text: 'Hello! I am your HR Assistant. How can I help you today?', timestamp: '09:00 AM' },
  { id: 2, sender: 'user', text: 'I have a question about the new remote work policy.', timestamp: '09:02 AM' },
  { 
    id: 3, 
    sender: 'bot', 
    text: 'According to the updated remote work guidelines, employees are allowed to work from home up to 3 days a week. Core hours are 10 AM to 3 PM.', 
    timestamp: '09:03 AM',
    citations: ['Remote Work Policy 2026', 'Employee Handbook Sec. 4']
  },
];

const ChatInterface = () => {
  const [role, setRole] = useState('Employee');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [escalated, setEscalated] = useState(false);
  
  // 'closed' | 'input' | 'full'
  const [chatState, setChatState] = useState('closed');
  
  // Login State
  const [showLogin, setShowLogin] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [botIsTyping, setBotIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginId === '11a' && loginPassword === '11b') {
      setRole('HR Manager');
      setShowLogin(false);
      setLoginId('');
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid ID or Password');
    }
  };

  const handleCancelLogin = () => {
    setShowLogin(false);
    setLoginId('');
    setLoginPassword('');
    setLoginError('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
    if (chatState !== 'full') {
      setChatState('full');
    }

    // If already escalated to a human, the AI stops responding
    if (escalated) {
      return;
    }

    setBotIsTyping(true);

    // Simulate escalation trigger
    if (inputValue.toLowerCase().includes('escalate') || inputValue.toLowerCase().includes('human')) {
      setTimeout(() => {
        setEscalated(true);
        setMessages(prev => [...prev, {
          id: prev.length + 2,
          sender: 'agent',
          text: 'Hi, I am Sarah from HR. I see you need some further assistance. How can I help?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'Sarah Jenkins'
        }]);
        setBotIsTyping(false);
      }, 1500);
    } else {
      // Simulate normal bot response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 2,
          sender: 'bot',
          text: 'I understand. Let me check that information for you.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setBotIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
    <div className="fixed bottom-6 right-6 w-full max-w-sm flex flex-col items-end justify-end font-sans pointer-events-none z-50">
      
      {/* Floating Chat Area & Tabs Wrapper */}
      <div 
        className={`w-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right overflow-hidden ${
          chatState !== 'full' ? 'scale-[0.8] opacity-0 invisible pointer-events-none h-0' : 'scale-100 opacity-100 visible pointer-events-auto h-[320px]'
        }`}
      >
        <div className="overflow-y-auto px-2 pb-4 space-y-4 scroll-smooth max-h-[260px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {messages.map((msg, index) => {
            
            const isEscalationBoundary = escalated && msg.sender === 'agent' && messages[index - 1]?.sender !== 'agent';
            
            return (
              <React.Fragment key={`msg-${msg.id}-${index}`}>
                {isEscalationBoundary && (
                  <div className="flex flex-col items-center my-6 select-none">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full shadow-sm">
                      <AlertTriangle size={14} className="text-purple-800" />
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">Escalated to Human Agent</span>
                    </div>
                  </div>
                )}

                <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.sender === 'agent' && (
                    <span className="text-xs font-bold text-slate-800 drop-shadow-md mb-1 ml-2 uppercase tracking-wider">{msg.agentName} • HR</span>
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
              </React.Fragment>
            );
          })}
          
          {botIsTyping && (
            <div className="flex flex-col items-start animate-in fade-in zoom-in duration-300">
              <span className="text-xs font-bold text-slate-800 drop-shadow-md mb-1 ml-2 uppercase tracking-wider">
                {escalated ? 'Sarah Jenkins • HR' : 'HR AI'}
              </span>
              <div className="px-4 py-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/40 border border-white/50 backdrop-blur-2xl rounded-bl-sm flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Bar with Integrated Tabs */}
      <div className="pointer-events-auto mt-2 px-1 flex flex-col gap-3">
        {/* Integrated Tabs */}
        <div className="flex justify-between items-center px-1">
          <div className="bg-white/30 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/40 shadow-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${escalated ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              {escalated ? 'Human Agent' : 'HR AI'}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white/30 backdrop-blur-xl hover:bg-white/40 text-slate-700 text-[11px] uppercase tracking-wider font-bold rounded-full transition-colors border border-white/40 shadow-sm"
            >
              {role === 'Employee' ? <User size={12} strokeWidth={2.5} /> : <Shield size={12} className="text-purple-700" strokeWidth={2.5} />}
              {role}
              <ChevronDown size={10} strokeWidth={3} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                <button 
                  onClick={() => { setRole('Employee'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/60 text-slate-800 text-sm border-b border-white/30"
                >
                  <User size={16} className={role === 'Employee' ? 'text-blue-600' : 'text-slate-500'} />
                  <span className={role === 'Employee' ? 'font-semibold' : ''}>Employee</span>
                  {role === 'Employee' && <CheckCircle size={14} className="ml-auto text-blue-600" />}
                </button>
                <button 
                  onClick={() => { 
                    if (role !== 'HR Manager') {
                      setShowLogin(true);
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/60 text-slate-800 text-sm"
                >
                  <Shield size={16} className={role === 'HR Manager' ? 'text-purple-600' : 'text-slate-500'} />
                  <span className={role === 'HR Manager' ? 'font-semibold' : ''}>HR Manager</span>
                  {role === 'HR Manager' && <CheckCircle size={14} className="ml-auto text-purple-600" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {role === 'HR Manager' && (
          <div className="px-4 py-2 bg-purple-500/20 backdrop-blur-xl text-purple-900 font-semibold text-xs rounded-full border border-purple-300/40 flex items-center gap-2 shadow-sm">
            <Shield size={14} strokeWidth={2.5} />
            Viewing as HR Manager (Internal Notes)
          </div>
        )}
      </div>
        
      </div>
      {/* End Floating Chat Area & Tabs Wrapper */}
        
      {/* Morphing Input Box / FAB */}
      <div 
        className={
          chatState === 'closed'
            ? "mt-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden shadow-2xl pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center cursor-pointer bg-blue-600 hover:bg-blue-700 hover:scale-105 group"
            : "mt-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden shadow-2xl pointer-events-auto w-full rounded-full px-2 py-1 flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/60"
        }
        onClick={() => chatState === 'closed' && setChatState('input')}
      >
        {chatState === 'closed' ? (
          <MessageCircle size={28} strokeWidth={2.5} className="text-white transition-transform duration-300 group-hover:scale-110" />
        ) : (
          <>
            <div className="flex gap-1 pl-1">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setChatState('closed');
                }}
                className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center rounded-full hover:bg-white/40"
                title="Close chat"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (chatState === 'full') setChatState('input');
                  else setChatState('full');
                }}
                className="p-1.5 text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center rounded-full hover:bg-white/40"
                title={chatState === 'full' ? "Hide Chat" : "Open Chat"}
              >
                <ChevronDown size={20} strokeWidth={2.5} className={`transition-transform duration-300 ${chatState === 'input' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            <button className="p-2.5 text-slate-600 hover:text-slate-800 transition-colors rounded-full hover:bg-white/40">
              <Paperclip size={20} strokeWidth={2} />
            </button>
            
            <textarea
              value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={escalated ? (role === 'HR Manager' ? "Reply to employee..." : "Messaging Sarah Jenkins...") : "Ask HR a question..."}
            className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-1 text-[15px] text-slate-800 placeholder-slate-600 font-medium min-h-[44px]"
            rows="1"
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center h-10 w-10 ${
              inputValue.trim() 
                ? 'bg-blue-600 text-white shadow-md scale-100 hover:scale-105' 
                : 'bg-black/5 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} strokeWidth={2} className={inputValue.trim() ? "ml-0.5" : "-ml-0.5"} />
          </button>
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">HR Authentication</h3>
                <p className="text-xs text-slate-500">Sign in to access internal records</p>
              </div>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID</label>
                <input 
                  type="text" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-800"
                  placeholder="Enter ID (e.g. 11a)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-800"
                  placeholder="Enter Password (e.g. 11b)"
                />
              </div>
              
              {loginError && <p className="text-xs text-red-500 font-semibold">{loginError}</p>}
              
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={handleCancelLogin}
                  className="flex-1 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors shadow-lg shadow-purple-500/30"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </>
  );
};

export default ChatInterface;
