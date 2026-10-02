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
  Users,
  Maximize2,
  Minimize2,
  Minus
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { MessageBubble } from './MessageBubble';
import { TEAM_MEMBERS } from './teamData';

const ChatInterface = () => {
  const [role, setRole] = useState('Employee');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(TEAM_MEMBERS[0].id);
  
  // 3 Modes: 'input' | 'window' | 'fullscreen'
  const [displayMode, setDisplayMode] = useState('window');
  
  const [inputValue, setInputValue] = useState('');
  const [escalated, setEscalated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);
  
  // Initial conversations stored per team member with suggestions under each greeting
  const [chatHistories, setChatHistories] = useState(() => {
    const initial = {};
    TEAM_MEMBERS.forEach(member => {
      initial[member.id] = [
        {
          id: 1,
          sender: 'bot',
          text: member.greeting,
          timestamp: '09:00 AM',
          citations: member.citations || ['Employee Handbook 2026', 'HR Policy Sec. 4'],
          suggestions: member.suggestions || [
            'What is our WFH core hours policy?',
            'Check my remaining leave balance',
            'Hackathon expense reimbursement',
            'Escalate to Human HR'
          ]
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
  }, [currentMessages, botIsTyping, displayMode]);

  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
  };

  const processQueryResponse = (queryText) => {
    const lower = queryText.toLowerCase();
    let responseText = '';
    let citations = [];
    let followUpSuggestions = [];

    if (lower.includes('escalate') || lower.includes('human') || lower.includes('sarah') || lower.includes('agent')) {
      setEscalated(true);
      responseText = `Hi ${activeMember.shortName}, I am Sarah from Human Resources. I've taken over this chat for team Glitch Theory (#279). How can I assist you with your specific query?`;
      citations = ['Direct HR Representative Hand-off'];
      followUpSuggestions = [
        'Review my grievance ticket',
        'Schedule a 1-on-1 HR call',
        'Confidential policy inquiry'
      ];

      setChatHistories(prev => ({
        ...prev,
        [selectedMemberId]: [
          ...(prev[selectedMemberId] || []),
          {
            id: (prev[selectedMemberId]?.length || 0) + 2,
            sender: 'agent',
            agentName: 'Sarah Jenkins',
            text: responseText,
            citations: citations,
            suggestions: followUpSuggestions,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
      setBotIsTyping(false);
      return;
    }

    if (lower.includes('wfh') || lower.includes('remote') || lower.includes('home')) {
      responseText = `Under the Bennett Enterprise Remote Policy, full-time engineering employees like yourself (${activeMember.role}) can work remotely up to 3 days/week with core synchronous hours between 10:00 AM and 3:00 PM.`;
      citations = ['Remote Work Policy 2026', 'Employee Handbook Sec. 4'];
      followUpSuggestions = [
        'Who approves my remote work days?',
        'Can I work remotely during hackathons?',
        'What equipment allowance do I get?'
      ];
    } else if (lower.includes('leave') || lower.includes('vacation') || lower.includes('holiday')) {
      responseText = `${activeMember.name}, your current record (${activeMember.id}) shows 14 remaining paid leave days. Planned leave over 2 consecutive days requires Team Leader (${TEAM_MEMBERS.find(m => m.role === 'Team Leader')?.name}) sign-off in the portal.`;
      citations = ['Annual Leave Guidelines', 'Manager Approval Matrix'];
      followUpSuggestions = [
        'How do I submit sick leave?',
        'View team leave calendar',
        'Can leave be carried over to 2027?'
      ];
    } else if (lower.includes('reimburse') || lower.includes('hackathon') || lower.includes('grant') || lower.includes('allowance')) {
      responseText = `For Microsoft Innovate 2026, team Glitch Theory members are eligible for up to ₹5,000 per member in hardware/cloud credit reimbursements upon submitting valid tax invoices under Project #279.`;
      citations = ['Innovation Grant Memo', 'Finance Travel & Event Policy'];
      followUpSuggestions = [
        'Where do I upload invoice receipts?',
        'Are Azure API credits covered?',
        'Reimbursement payment timeline'
      ];
    } else {
      responseText = `I have logged your inquiry regarding "${queryText}" for ${activeMember.name} (${activeMember.id}). All responses are verified against our centralized policy repository.`;
      citations = ['Enterprise FAQ Sec. 2', 'Bennett Code of Conduct'];
      followUpSuggestions = [
        'What is our WFH core hours policy?',
        'Check my remaining leave balance',
        'Escalate to Human HR'
      ];
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
          suggestions: followUpSuggestions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    }));
    setBotIsTyping(false);
  };

  const handleSendText = (textToSend) => {
    if (!textToSend.trim()) return;

    const newMessage = {
      id: currentMessages.length + 1,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedMemberId]: [...(prev[selectedMemberId] || []), newMessage]
    }));
    setInputValue('');

    // If currently in input mode, open standard window mode
    if (displayMode === 'input') {
      setDisplayMode('window');
    }

    if (escalated) return;

    setBotIsTyping(true);
    setTimeout(() => {
      processQueryResponse(textToSend);
    }, 1100);
  };

  const handleSend = () => {
    handleSendText(inputValue);
  };

  const handleSelectSuggestion = (suggestionText) => {
    handleSendText(suggestionText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isFullscreen = displayMode === 'fullscreen';
  const isInputOnly = displayMode === 'input';

  return (
    <>
      {/* Fullscreen Backdrop Blur Overlay */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 transition-opacity duration-300 pointer-events-auto"
          onClick={() => setDisplayMode('window')}
        />
      )}

      {/* Main Dynamic Container: changes size/position based on 3 modes */}
      <div 
        className={`font-sans pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isFullscreen 
            ? 'fixed inset-3 md:inset-8 z-50 flex flex-col max-w-6xl mx-auto' 
            : 'fixed bottom-6 right-6 w-full max-w-[560px] flex flex-col items-end justify-end z-50'
        }`}
      >
        
        {/* Chat Window Card (Visible in 'window' and 'fullscreen' modes) */}
        <div 
          className={`w-full flex flex-col transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom overflow-hidden ${
            isInputOnly 
              ? 'scale-95 opacity-0 invisible pointer-events-none h-0' 
              : isFullscreen
                ? 'scale-100 opacity-100 visible pointer-events-auto flex-1 h-full'
                : 'scale-100 opacity-100 visible pointer-events-auto h-[580px]'
          }`}
        >
          {/* Card Glass Body */}
          <div className="w-full h-full flex flex-col bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            
            {/* Top Brand Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-indigo-950/95 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight">Enterprise HR Copilot</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Team #279
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Microsoft Innovate 2026 • Glitch Theory
                  </p>
                </div>
              </div>

              {/* Header Controls: Role Switcher + Mode Toggles (Fullscreen / Window / Minimize) */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[11px] uppercase tracking-wider font-bold rounded-full transition-colors border border-white/20 shadow-sm"
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

                {/* Mode 1 & 2 Toggle: Fullscreen vs Window */}
                {isFullscreen ? (
                  <button 
                    onClick={() => setDisplayMode('window')}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Restore Window View"
                  >
                    <Minimize2 size={17} />
                  </button>
                ) : (
                  <button 
                    onClick={() => setDisplayMode('fullscreen')}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Fullscreen View"
                  >
                    <Maximize2 size={17} />
                  </button>
                )}

                {/* Mode 3 Toggle: Minimize to Input Bar */}
                <button 
                  onClick={() => setDisplayMode('input')}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize to Input Bar"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* PERSONA TABS: Team Members with ID, Name & Role */}
            <div className="bg-slate-100/80 border-b border-slate-200/80 px-4 py-2.5 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                  <Users size={12} /> Select Team Member Profile
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
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${
                        isActive 
                          ? 'bg-white text-blue-700' 
                          : `bg-gradient-to-tr ${member.color} text-white`
                      }`}>
                        {member.avatar}
                      </div>

                      <div className="flex flex-col pr-1">
                        <span className="text-xs font-bold leading-tight truncate max-w-[110px]">
                          {member.name}
                        </span>
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
              <div className="px-4 py-1.5 bg-purple-500/15 text-purple-900 font-semibold text-xs border-b border-purple-200/50 flex items-center gap-2 flex-shrink-0">
                <Shield size={13} strokeWidth={2.5} className="text-purple-700" />
                Viewing administrative records for {activeMember.name} ({activeMember.id})
              </div>
            )}

            {/* Chat History Area */}
            <div 
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              
              {/* Persona Context Badge inside Chat */}
              <div className="flex items-center justify-center mb-2">
                <div className="px-3.5 py-1 bg-white/70 backdrop-blur-md rounded-full border border-slate-200 text-xs text-slate-600 shadow-sm flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-600" />
                  Active Employee: <strong className="text-slate-800">{activeMember.name}</strong> ({activeMember.id}) • {activeMember.role}
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
                            Escalated to Human HR Representative
                          </span>
                        </div>
                      </div>
                    )}
                    <MessageBubble 
                      msg={msg} 
                      onSelectSuggestion={handleSelectSuggestion} 
                    />
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

          </div>
        </div>

        {/* TASKBAR / INPUT BAR (+30% INCREASE IN SIZE: min-h-[60px], py-3, px-4, text-[16px]) */}
        <div className="pointer-events-auto mt-3 w-full flex-shrink-0">
          <div className="w-full rounded-2xl p-2.5 flex items-center gap-2.5 bg-white/85 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-all duration-300">
            
            {/* Mode Switcher Button: Opens or toggles window */}
            <button 
              onClick={() => {
                if (isInputOnly) setDisplayMode('window');
                else setDisplayMode('input');
              }}
              className="p-2.5 text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center rounded-xl hover:bg-slate-100"
              title={isInputOnly ? "Expand Window" : "Minimize to Input Bar"}
            >
              {isInputOnly ? (
                <ChevronUp size={22} strokeWidth={2.5} className="text-blue-600" />
              ) : (
                <ChevronDown size={22} strokeWidth={2.5} />
              )}
            </button>

            {/* Quick Fullscreen Button on Taskbar */}
            {!isInputOnly && (
              <button
                onClick={() => setDisplayMode(isFullscreen ? 'window' : 'fullscreen')}
                className="p-2.5 text-slate-600 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-100 hidden sm:flex"
                title={isFullscreen ? "Restore Window" : "Maximize Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            )}
            
            <button 
              className="p-2.5 text-slate-600 hover:text-slate-800 transition-colors rounded-xl hover:bg-slate-100"
              title="Attach File / Screenshot"
            >
              <Paperclip size={22} strokeWidth={2} />
            </button>
            
            {/* Roomy enlarged input field */}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isInputOnly) setDisplayMode('window');
              }}
              placeholder={`Ask HR as ${activeMember.name} (e.g. leave balance, WFH, allowances)...`}
              className="flex-1 max-h-36 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-[16px] text-slate-900 placeholder-slate-500 font-medium min-h-[48px] leading-relaxed"
              rows="1"
            />
            
            {/* Enlarged Send Button */}
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
