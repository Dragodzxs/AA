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
  Minus,
  Plus,
  MessageSquare,
  History,
  Trash2,
  Clock
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { MessageBubble } from './MessageBubble';
import { TEAM_MEMBERS } from './teamData';
import { sendChatMessage } from './chatService';

const INITIAL_SESSIONS = [
  {
    id: 'session-1',
    title: 'New Conversation',
    date: 'Just now',
    memberId: 'EMP-1042',
    messages: [
      {
        id: 1,
        sender: 'bot',
        text: 'Hello! I am your Enterprise HR Assistant. How can I assist you today with leave balance, reimbursements, or company policies?',
        timestamp: 'Just now',
        citations: [],
        suggestions: [
          'What are our WFH core hours?',
          'Check my remaining leave balance',
          'How to claim equipment reimbursement?'
        ]
      }
    ]
  }
];

const ChatInterface = () => {
  const [role, setRole] = useState('Employee');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(TEAM_MEMBERS[0].id);
  
  // Starts in 'input' mode so chat is docked cleanly on initial page load
  const [displayMode, setDisplayMode] = useState('input');
  
  // Hover Sidebar State
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Chat sessions state
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('hr_chat_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });
  
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const savedId = localStorage.getItem('hr_current_session_id');
    return savedId || 'session-1';
  });

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hr_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Save currentSessionId to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hr_current_session_id', currentSessionId);
  }, [currentSessionId]);

  const [inputValue, setInputValue] = useState('');
  const [escalated, setEscalated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const activeMember = TEAM_MEMBERS.find(m => m.id === selectedMemberId) || TEAM_MEMBERS[0];
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const currentMessages = currentSession?.messages || [];

  const handleLoginSuccess = () => {
    setRole('HR Manager');
    setShowLogin(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (displayMode !== 'input') {
      scrollToBottom();
    }
  }, [currentMessages, botIsTyping, displayMode]);

  // When a persona tab is clicked, update active member & session
  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
    const memberObj = TEAM_MEMBERS.find(m => m.id === memberId);
    
    const existingSession = sessions.find(s => s.memberId === memberId);
    if (existingSession) {
      setCurrentSessionId(existingSession.id);
    } else if (memberObj) {
      const newSessionId = `session-${Date.now()}`;
      const newSession = {
        id: newSessionId,
        title: `HR Chat (${memberObj.shortName})`,
        date: 'Just now',
        memberId: memberId,
        messages: [
          {
            id: 1,
            sender: 'bot',
            text: memberObj.greeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: memberObj.citations || ['Employee Handbook 2026'],
            suggestions: memberObj.suggestions || [
              'What is our WFH core hours policy?',
              'Check my remaining leave balance',
              'Escalate to Human HR'
            ]
          }
        ]
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSessionId);
    }
  };

  // Create a brand new chat session
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession = {
      id: newSessionId,
      title: `New Query (${activeMember.shortName})`,
      date: 'Just now',
      memberId: selectedMemberId,
      messages: [
        {
          id: 1,
          sender: 'bot',
          text: activeMember.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: activeMember.citations || ['Employee Handbook 2026', 'HR Policy Sec. 4'],
          suggestions: activeMember.suggestions || [
            'What is our WFH core hours policy?',
            'Check my remaining leave balance',
            'How to claim reimbursement?',
            'Escalate to Human HR'
          ]
        }
      ]
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setEscalated(false);
  };

  // Resolve Human Ticket and return to AI
  const handleResolveTicket = () => {
    setEscalated(false);
    
    const sysMsg = {
      id: currentMessages.length + 1,
      sender: 'agent',
      text: 'Ticket resolved by Human HR Representative. You are now connected to the AI Copilot again.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
      suggestions: ['Check leave balance', 'View remote policy']
    };
    
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSessionId) return s;
      return {
        ...s,
        messages: [...s.messages, sysMsg]
      };
    }));
  };

  // Switch to a previous chat session
  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    const targetSession = sessions.find(s => s.id === sessionId);
    if (targetSession && targetSession.memberId) {
      setSelectedMemberId(targetSession.memberId);
    }
  };

  // Delete a chat session
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(remaining[0].id);
      if (remaining[0].memberId) setSelectedMemberId(remaining[0].memberId);
    }
  };

  // Send message - Fully powered by chatService (backend rules it all!)
  const handleSendText = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      id: currentMessages.length + 1,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Add user message to current session
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSessionId) return s;
      
      // Auto-update title on first user message
      const isFirstUserMsg = !s.messages.some(m => m.sender === 'user');
      const newTitle = isFirstUserMsg 
        ? textToSend.substring(0, 25) + (textToSend.length > 25 ? '...' : '') 
        : s.title;

      return {
        ...s,
        title: newTitle,
        messages: [...s.messages, userMessage]
      };
    }));
    setInputValue('');

    // Open window automatically if minimized
    if (displayMode === 'input') {
      setDisplayMode('window');
    }

    if (escalated) return;

    setBotIsTyping(true);

    try {
      // 2. Query backend service (falls back gracefully to smart mock if backend is down)
      const botResponse = await sendChatMessage({
        text: textToSend,
        member: { ...activeMember, role },
        history: [...currentMessages, userMessage],
      });

      if (botResponse.escalated) {
        setEscalated(true);
      }

      // 3. Update session with exact data provided by backend
      setSessions(prev => prev.map(s => {
        if (s.id !== currentSessionId) return s;

        let newTitle = s.title;
        if (s.title.startsWith('New Query') || s.title.startsWith('HR Chat')) {
          newTitle = textToSend.length > 28 ? `${textToSend.slice(0, 28)}...` : textToSend;
        }

        return {
          ...s,
          title: newTitle,
          messages: [
            ...s.messages,
            {
              id: s.messages.length + 2,
              sender: 'bot', // The bot always delivers the escalation message
              agentName: botResponse.agentName,
              text: botResponse.text,
              citations: botResponse.citations || [],
              suggestions: botResponse.suggestions || [],
              confidence: botResponse.confidence,
              isEscalationTrigger: botResponse.escalated,
              backendSource: botResponse.backendSource,
              isGemini: botResponse.isGemini,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }));
    } catch (err) {
      console.error('Error in sendChatMessage:', err);
    } finally {
      setBotIsTyping(false);
    }
  };

  const handleSend = () => {
    handleSendText(inputValue);
  };

  const handleSelectSuggestion = (suggestionText) => {
    handleSendText(suggestionText);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
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

      {/* Main Container */}
      <div 
        onClickCapture={() => { if (isInputOnly) setDisplayMode('window') }}
        className={`font-sans pointer-events-none transition-all duration-500 ease-in-out fixed z-50 flex flex-col items-end justify-end group/main ${
          isFullscreen 
            ? 'bottom-0 right-0 md:bottom-8 md:right-[calc(50vw-min(50vw-2rem,36rem))] w-full md:w-[calc(100vw-4rem)] max-w-6xl' 
            : `bottom-6 right-8 w-full ${isInputOnly ? 'max-w-[620px] hover:max-w-[800px]' : 'max-w-[800px]'}`
        }`}
      >
        
        {/* Chat Window Card (Opens when in 'window' or 'fullscreen' mode) */}
        <div 
          className={`w-full flex flex-col transition-all duration-500 ease-in-out origin-bottom overflow-hidden ${
            isInputOnly 
              ? 'scale-95 opacity-0 invisible pointer-events-none h-0 group-hover/main:scale-100 group-hover/main:opacity-100 group-hover/main:visible group-hover/main:pointer-events-auto group-hover/main:h-[750px] group-hover/main:max-h-[calc(100vh-140px)]' 
              : isFullscreen
                ? 'scale-100 opacity-100 visible pointer-events-auto h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]'
                : 'scale-100 opacity-100 visible pointer-events-auto h-[750px] max-h-[calc(100vh-140px)]'
          }`}
        >
          {/* Card Glass Body */}
          <div className="w-full h-full flex flex-col bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/70 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative">
            
            {/* Top Brand Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-indigo-950/95 backdrop-blur-md text-white flex items-center justify-between border-b border-white/10 flex-shrink-0 z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold tracking-tight">Enterprise HR Copilot</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                      Smart Assistant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    AI Knowledge Base • Cited Policy Answers
                  </p>
                </div>
              </div>

              {/* Header Controls: Role Switcher + Mode Toggles */}
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

                {/* Mode Toggles */}
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

                <button 
                  onClick={() => setDisplayMode('input')}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize to Input Bar"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Middle Workspace: Hover-Expanding Sidebar on the Left + Main Chat Area */}
            <div className="flex-1 flex overflow-hidden relative">
              
              {/* SIDEBAR: EXPANDS ON HOVER */}
              <div 
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
                className={`absolute left-0 top-0 bottom-0 z-20 flex flex-col bg-slate-900/95 backdrop-blur-2xl text-white border-r border-white/15 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                  isSidebarHovered ? 'w-72 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'w-14'
                }`}
              >
                {/* Sidebar Header & New Chat Button */}
                <div className="p-2.5 border-b border-white/10 flex-shrink-0">
                  <button
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all duration-200 shadow-md shadow-blue-500/25 active:scale-95 group"
                    title="Start New Chat Session"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:rotate-90 transition-transform">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                    {isSidebarHovered && (
                      <span className="truncate whitespace-nowrap tracking-wide">
                        + New HR Chat
                      </span>
                    )}
                  </button>
                </div>

                {/* Section Title when Hovered */}
                <div className="px-3.5 pt-3 pb-1 flex items-center justify-between text-slate-400 flex-shrink-0">
                  {isSidebarHovered ? (
                    <span className="text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 text-slate-300">
                      <History size={13} className="text-blue-400" /> Previous Chats ({sessions.length})
                    </span>
                  ) : (
                    <div className="w-full flex justify-center py-1">
                      <Clock size={16} className="text-slate-400" title="Recent Chat Sessions" />
                    </div>
                  )}
                </div>

                {/* Scrollable Previous Sessions List */}
                <div 
                  className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 custom-scrollbar"
                >
                  {sessions.map((session) => {
                    const isSelected = session.id === currentSessionId;
                    const sessionMember = TEAM_MEMBERS.find(m => m.id === session.memberId);
                    
                    return (
                      <div
                        key={session.id}
                        onClick={() => handleSelectSession(session.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 text-left group relative ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold' 
                            : 'hover:bg-white/10 text-slate-300 hover:text-white'
                        }`}
                        title={session.title}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                          isSelected 
                            ? 'bg-white text-blue-700' 
                            : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                        }`}>
                          <MessageSquare size={14} />
                        </div>

                        {isSidebarHovered && (
                          <div className="flex-1 min-w-0 pr-1">
                            <p className="text-xs font-medium leading-tight truncate">
                              {session.title}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] opacity-75 mt-0.5">
                              <span>{session.date}</span>
                              {sessionMember && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{sessionMember.shortName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {isSidebarHovered && sessions.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteSession(e, session.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity"
                            title="Delete Chat"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sidebar Footer */}
                <div className="p-2 border-t border-white/10 bg-slate-950/60 flex items-center gap-2.5 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-tr ${activeMember.color} text-white flex-shrink-0 shadow-md`}>
                    {activeMember.avatar}
                  </div>
                  {isSidebarHovered && (
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight text-white">{activeMember.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono leading-tight">{activeMember.id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 flex flex-col min-w-0 pl-14 overflow-hidden">
                
                {/* PERSONA TABS: Clean Corporate Personas */}
                <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-2 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                      <Users size={11} /> Switch Employee Profile
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold font-mono">
                      Active: {activeMember.id}
                    </span>
                  </div>

                  {/* Horizontally Scrollable Persona Tabs */}
                  <div 
                    className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar"
                  >
                    {TEAM_MEMBERS.map((member) => {
                      const isActive = member.id === selectedMemberId;
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleSelectMember(member.id)}
                          className={`flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-2xl transition-all duration-200 border text-left ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 scale-[1.01]'
                              : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm ${
                            isActive 
                              ? 'bg-white text-blue-700' 
                              : `bg-gradient-to-tr ${member.color} text-white`
                          }`}>
                            {member.avatar}
                          </div>

                          <div className="flex flex-col pr-1">
                            <span className="text-xs font-bold leading-tight truncate max-w-[105px]">
                              {member.name}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] opacity-85 leading-tight">
                              <span className="font-mono">{member.id}</span>
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

                {/* Chat History Messages Stream */}
                <div 
                  className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scroll-smooth custom-scrollbar"
                >
                  
                  {/* Persona Context Badge inside Chat */}
                  <div className="flex items-center justify-center mb-2">
                    <div className="px-3.5 py-1 bg-white/75 backdrop-blur-md rounded-full border border-slate-200 text-xs text-slate-600 shadow-sm flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600" />
                      Active Session: <strong className="text-slate-800">{currentSession.title}</strong> • {activeMember.name}
                    </div>
                  </div>

                  {currentMessages.map((msg, index) => {
                    return (
                      <React.Fragment key={`msg-${msg.id}-${index}`}>
                        <MessageBubble 
                          msg={msg} 
                          onSelectSuggestion={handleSelectSuggestion} 
                        />
                        {msg.isEscalationTrigger && (
                          <div className="flex flex-col items-center my-4 select-none">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 backdrop-blur-md border border-purple-400/30 rounded-full shadow-sm">
                              <AlertTriangle size={14} className="text-purple-800" />
                              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                                Escalated to Human HR Representative
                              </span>
                            </div>
                          </div>
                        )}
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

          </div>
        </div>

        {/* TASKBAR / INPUT BAR (Clean single-line, NO scrollbars, NO clipped text) */}
        <div className="pointer-events-auto mt-3 w-full flex-shrink-0">
          
          {/* Welcome greeting banner when docked in input-only mode */}
          {isInputOnly && (
            <div 
              onClick={() => setDisplayMode('window')}
              className="mb-2 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-900 backdrop-blur-xl text-white rounded-2xl border border-white/20 shadow-xl cursor-pointer flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 transition-all duration-300 ease-out group group-hover/main:opacity-0 group-hover/main:scale-95 group-hover/main:h-0 group-hover/main:mb-0 group-hover/main:py-0 group-hover/main:border-0 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] bg-gradient-to-tr ${activeMember.color} text-white flex-shrink-0 shadow-sm`}>
                  {activeMember.avatar}
                </div>
                <p className="text-xs sm:text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors truncate">
                  <span className="font-bold text-white">Hello {activeMember.name},</span> how can HR assist you with leave, WFH, or company policies today?
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-400/30 whitespace-nowrap flex items-center gap-1 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                Open Chat <ChevronUp size={13} />
              </span>
            </div>
          )}

          {/* Resolve Ticket Button for prototype testing */}
          {escalated && !isInputOnly && (
            <div className="mb-3 w-full flex justify-center animate-in fade-in slide-in-from-bottom-2">
              <button 
                onClick={handleResolveTicket} 
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle size={15} />
                Resolve Ticket & Resume AI
              </button>
            </div>
          )}

          {/* Main Input Bar */}
          <div className="w-full rounded-[20px] p-2 sm:p-3 flex items-center gap-3 bg-white/95 backdrop-blur-3xl border border-white shadow-[0_12px_45px_rgb(0,0,0,0.15)] transition-all duration-500 ease-out">
            
            {/* Mode Switcher Button */}
            <button 
              onClick={() => {
                if (isInputOnly) setDisplayMode('window');
                else setDisplayMode('input');
              }}
              className="p-2 sm:p-2.5 text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center rounded-xl hover:bg-slate-100 flex-shrink-0"
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
                className="p-2 sm:p-2.5 text-slate-600 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-100 hidden sm:flex flex-shrink-0"
                title={isFullscreen ? "Restore Window" : "Maximize Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={21} /> : <Maximize2 size={21} />}
              </button>
            )}
            
            {/* Clean input field with single-line guarantee */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isInputOnly) setDisplayMode('window');
              }}
              placeholder={`Ask HR as ${activeMember.name} (e.g. leave balance, WFH, allowances)...`}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 py-3.5 px-3 text-[15px] sm:text-[16px] text-slate-900 placeholder-slate-400 font-medium min-w-0"
            />
            
            {/* Enlarged Send Button */}
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`p-2.5 sm:p-3 rounded-xl transition-all duration-300 flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 ${
                inputValue.trim() 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-100 hover:scale-105 active:scale-95' 
                  : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send size={19} strokeWidth={2.5} className={inputValue.trim() ? "ml-0.5" : ""} />
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
