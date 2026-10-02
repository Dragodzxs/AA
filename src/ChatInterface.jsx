import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Paperclip, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Bot,
  Users
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { MessageBubble } from './MessageBubble';
import { TEAM_MEMBERS } from './teamData';

const ChatInterface = () => {
  const [role, setRole] = useState('Employee');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(TEAM_MEMBERS[0].id);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [escalated, setEscalated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);
  
  // Conversations stored per team member
  const [chatHistories, setChatHistories] = useState(() => {
    const initial = {};
    TEAM_MEMBERS.forEach(member => {
      initial[member.id] = [
        {
          id: 1,
          sender: 'bot',
          text: member.greeting,
          timestamp: '09:00 AM',
          citations: member.citations || ['Employee Handbook 2026', 'HR Policy Sec. 4']
        }
      ];
    });
    return initial;
  });

  const messagesEndRef = useRef(null);
  const activeMember = TEAM_MEMBERS.find(m => m.id === selectedMemberId) || TEAM_MEMBERS[0];
  const currentMessages = chatHistories[selectedMemberId] || [];

  const handleLoginSuccess = () => {
    setRole('HR Manager');
    setShowLogin(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, botIsTyping]);

  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMessage = {
      id: currentMessages.length + 1,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedMemberId]: [...(prev[selectedMemberId] || []), newMessage]
    }));
    setInputValue('');

    // Ensure full window is open if minimized
    if (isMinimized) {
      setIsMinimized(false);
    }

    if (escalated) return;

    setBotIsTyping(true);

    // Simulate response tailored to question & member
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let responseText = '';
      let citations = [];

      if (lower.includes('escalate') || lower.includes('human') || lower.includes('agent')) {
        setEscalated(true);
        responseText = `Hi ${activeMember.shortName}, I am Sarah from Human Resources. I've taken over this chat for team Glitch Theory. How can I assist you with your specific query?`;
        setChatHistories(prev => ({
          ...prev,
          [selectedMemberId]: [
            ...(prev[selectedMemberId] || []),
            {
              id: (prev[selectedMemberId]?.length || 0) + 2,
              sender: 'agent',
              agentName: 'Sarah Jenkins',
              text: responseText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        }));
        setBotIsTyping(false);
        return;
      }

      if (lower.includes('wfh') || lower.includes('remote') || lower.includes('home')) {
        responseText = `Under the Bennett Enterprise Remote Policy, full-time engineering employees like yourself (${activeMember.role}) can work remotely up to 3 days/week with core hours between 10:00 AM and 3:00 PM.`;
        citations = ['Remote Work Policy 2026', 'Employee Handbook Sec. 4'];
      } else if (lower.includes('leave') || lower.includes('vacation') || lower.includes('holiday')) {
        responseText = `${activeMember.name}, your current record (${activeMember.id}) shows 14 remaining paid leave days. Planned leave over 2 consecutive days requires Team Leader (${TEAM_MEMBERS.find(m => m.role === 'Team Leader')?.name}) sign-off in the HR portal.`;
        citations = ['Annual Leave Guidelines', 'Manager Approval Matrix'];
      } else if (lower.includes('reimburse') || lower.includes('hackathon') || lower.includes('allowance')) {
        responseText = `For Microsoft Innovate 2026, team Glitch Theory members are eligible for up to ₹5,000 per member in hardware/cloud credit reimbursements upon submitting valid receipts under Project #279.`;
        citations = ['Innovation Grant Memo', 'Finance Travel & Event Policy'];
      } else {
        responseText = `I have logged your inquiry regarding "${userText}" for ${activeMember.name} (${activeMember.id}). All responses are verified against our centralized policy repository.`;
        citations = ['Enterprise FAQ Sec. 2'];
      }

      setChatHistories(prev => ({
        ...prev,
        [selectedMemberId]: [
          ...(prev[selectedMemberId] || []),
          {
            id: (prev[selectedMemberId]?.length || 0) + 2,
            sender: 'bot',
            text: responseText,
            citations: citations,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
      setBotIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Expanded Container: +35% width (540px vs 384px) */}
      <div className="fixed bottom-6 right-6 w-full max-w-[560px] flex flex-col items-end justify-end font-sans pointer-events-none z-50">
        
        {/* Full Chat Window (Collapses cleanly to input bar, NO circle button) */}
        <div 
          className={`w-full flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom overflow-hidden ${
            isMinimized 
              ? 'scale-95 opacity-0 invisible pointer-events-none h-0' 
              : 'scale-100 opacity-100 visible pointer-events-auto h-[550px]'
          }`}
        >
          {/* Card Body */}
          <div className="w-full h-full flex flex-col bg-white/75 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden">
            
            {/* Top Brand Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900/90 to-blue-950/90 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight">Smart HR Copilot</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Team #279
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Microsoft Innovate 2026 • Glitch Theory
                  </p>
                </div>
              </div>

              {/* Header Controls: Role Dropdown + Minimize */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white text-[11px] uppercase tracking-wider font-bold rounded-full transition-colors border border-white/20 shadow-sm"
                  >
                    {role === 'Employee' ? <User size={12} strokeWidth={2.5} /> : <Shield size={12} className="text-purple-300" strokeWidth={2.5} />}
                    {role}
                    <ChevronDown size={10} strokeWidth={3} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl overflow-hidden z-50 text-slate-800">
                      <button 
                        onClick={() => { setRole('Employee'); setIsDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 text-xs border-b border-slate-100"
                      >
                        <User size={14} className={role === 'Employee' ? 'text-blue-600' : 'text-slate-500'} />
                        <span className={role === 'Employee' ? 'font-bold' : ''}>Employee</span>
                        {role === 'Employee' && <CheckCircle size={12} className="ml-auto text-blue-600" />}
                      </button>
                      <button 
                        onClick={() => { 
                          if (role !== 'HR Manager') {
                            setShowLogin(true);
                            setIsDropdownOpen(false);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-100 text-xs"
                      >
                        <Shield size={14} className={role === 'HR Manager' ? 'text-purple-600' : 'text-slate-500'} />
                        <span className={role === 'HR Manager' ? 'font-bold' : ''}>HR Manager</span>
                        {role === 'HR Manager' && <CheckCircle size={12} className="ml-auto text-purple-600" />}
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize to taskbar"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* PERSONA TABS: Team Members with ID, Name & Role */}
            <div className="bg-slate-100/80 border-b border-slate-200/80 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                  <Users size={11} /> Select Active Employee Profile
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">
                  {activeMember.program}
                </span>
              </div>

              {/* Horizontally Scrollable Team Tabs */}
              <div 
                className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {TEAM_MEMBERS.map((member) => {
                  const isActive = member.id === selectedMemberId;
                  return (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member.id)}
                      className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all duration-200 border text-left ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 scale-[1.02]'
                          : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200/90 shadow-sm'
                      }`}
                    >
                      {/* Avatar with Initials */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${
                        isActive 
                          ? 'bg-white text-blue-700' 
                          : `bg-gradient-to-tr ${member.color} text-white`
                      }`}>
                        {member.avatar}
                      </div>

                      <div className="flex flex-col pr-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-tight truncate max-w-[110px]">
                            {member.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-85 leading-tight">
                          <span className="font-mono">{member.id}</span>
                          <span>•</span>
                          <span className={isActive ? 'text-blue-100 font-semibold' : 'text-slate-500'}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HR Manager Note Badge */}
            {role === 'HR Manager' && (
              <div className="px-4 py-1.5 bg-purple-500/15 text-purple-900 font-semibold text-xs border-b border-purple-200/50 flex items-center gap-2">
                <Shield size={13} strokeWidth={2.5} className="text-purple-700" />
                Viewing internal administrative notes for {activeMember.name} ({activeMember.id})
              </div>
            )}

            {/* Chat History Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              
              {/* Persona Context Banner inside Chat */}
              <div className="flex items-center justify-center mb-2">
                <div className="px-3 py-1 bg-white/70 backdrop-blur-md rounded-full border border-slate-200 text-[11px] text-slate-600 shadow-sm flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-600" />
                  Context: <strong className="text-slate-800">{activeMember.name}</strong> ({activeMember.id}) • {activeMember.role}
                </div>
              </div>

              {currentMessages.map((msg, index) => {
                const isEscalationBoundary = escalated && msg.sender === 'agent' && currentMessages[index - 1]?.sender !== 'agent';
                
                return (
                  <React.Fragment key={`msg-${msg.id}-${index}`}>
                    {isEscalationBoundary && (
                      <div className="flex flex-col items-center my-4 select-none">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full shadow-sm">
                          <AlertTriangle size={14} className="text-purple-800" />
                          <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                            Escalated to Human HR Contact
                          </span>
                        </div>
                      </div>
                    )}
                    <MessageBubble msg={msg} />
                  </React.Fragment>
                );
              })}
              
              {botIsTyping && (
                <div className="flex flex-col items-start animate-in fade-in zoom-in duration-300">
                  <span className="text-xs font-bold text-slate-800 drop-shadow-md mb-1 ml-2 uppercase tracking-wider">
                    {escalated ? 'Sarah Jenkins • HR' : 'HR AI Copilot'}
                  </span>
                  <div className="px-4 py-3 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-white/70 border border-white/80 backdrop-blur-2xl rounded-bl-sm flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Pills */}
            <div className="px-4 py-2 border-t border-slate-200/60 bg-white/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Suggested:</span>
              {[
                'WFH & Remote Policy',
                'My Leave Balance',
                'Hackathon Expense Policy',
                'Talk to Human HR'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputValue(suggestion);
                  }}
                  className="whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold bg-white/70 hover:bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 shadow-sm transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* TASKBAR / INPUT BAR (+30% INCREASE IN SIZE: min-h-[60px], py-3, px-4, larger fonts and icons) */}
        <div className="pointer-events-auto mt-3 w-full">
          <div className="w-full rounded-2xl p-2.5 flex items-center gap-2.5 bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-all duration-300">
            
            {/* Minimize / Maximize Toggle Button */}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2.5 text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center rounded-xl hover:bg-slate-100"
              title={isMinimized ? "Expand Chat" : "Collapse Chat"}
            >
              {isMinimized ? (
                <ChevronUp size={22} strokeWidth={2.5} className="text-blue-600" />
              ) : (
                <ChevronDown size={22} strokeWidth={2.5} />
              )}
            </button>
            
            <button 
              className="p-2.5 text-slate-600 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
              title="Attach File / Screenshot"
            >
              <Paperclip size={22} strokeWidth={2} />
            </button>
            
            {/* Roomy, enlarged input field */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isMinimized) setIsMinimized(false);
              }}
              placeholder={`Ask HR as ${activeMember.name} (e.g. leave, WFH, policies)...`}
              className="flex-1 max-h-36 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-[16px] text-slate-900 placeholder-slate-500 font-medium min-h-[48px] leading-relaxed"
              rows="1"
            />
            
            {/* Enlarged Send Button (+30% size) */}
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center h-12 w-12 flex-shrink-0 ${
                inputValue.trim() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 hover:scale-105 active:scale-95' 
                  : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send size={20} strokeWidth={2.5} className={inputValue.trim() ? "ml-0.5" : ""} />
            </button>
          </div>
        </div>

        {/* HR Manager Authentication Modal */}
        {showLogin && <AuthModal onLogin={handleLoginSuccess} onCancel={() => setShowLogin(false)} />}

      </div>
    </>
  );
};

export default ChatInterface;
