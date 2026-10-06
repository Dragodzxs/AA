import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Dark',
    appBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950',
    appText: 'text-white',
    appMuted: 'text-slate-400',
    appMutedHover: 'group-hover:text-slate-300',
    cardBg: 'bg-white/5 border-white/10',
    cardHoverBg: 'group-hover:bg-slate-800/95 group-hover:border-white/20',
    headerBg: 'bg-slate-900/60 border-white/10',
    bannerBg: 'bg-blue-950/40 border-blue-500/30',
    logoGradient: 'from-blue-400 via-indigo-400 to-cyan-400',
    titleGradient: 'from-cyan-400 to-blue-500',
    tagClass: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    accentText: 'text-blue-400',
    gridColor: '#ffffff0a',
    glow: 'bg-blue-500/10',
    featureColors: [
      'bg-blue-500/20 text-blue-400',
      'bg-purple-500/20 text-purple-400',
      'bg-emerald-500/20 text-emerald-400',
      'bg-amber-500/20 text-amber-400'
    ]
  },
  light: {
    id: 'light',
    name: 'Clean Light',
    appBg: 'bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50',
    appText: 'text-slate-900',
    appMuted: 'text-slate-500',
    appMutedHover: 'group-hover:text-slate-700',
    cardBg: 'bg-black/5 border-black/10',
    cardHoverBg: 'group-hover:bg-white/95 group-hover:border-black/20',
    headerBg: 'bg-white/60 border-black/10',
    bannerBg: 'bg-blue-50 border-blue-200',
    logoGradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    titleGradient: 'from-cyan-600 to-blue-600',
    tagClass: 'bg-blue-100 text-blue-600 border-blue-200',
    accentText: 'text-blue-600',
    gridColor: '#0000000a',
    glow: 'bg-blue-300/20',
    featureColors: [
      'bg-blue-100 text-blue-600',
      'bg-purple-100 text-purple-600',
      'bg-emerald-100 text-emerald-600',
      'bg-amber-100 text-amber-600'
    ]
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    appBg: 'bg-[#282a36]',
    appText: 'text-[#f8f8f2]',
    appMuted: 'text-[#6272a4]',
    appMutedHover: 'group-hover:text-[#bd93f9]',
    cardBg: 'bg-[#44475a]/40 border-[#6272a4]/30',
    cardHoverBg: 'group-hover:bg-[#44475a]/80 group-hover:border-[#bd93f9]/50',
    headerBg: 'bg-[#282a36]/80 border-[#6272a4]/30',
    bannerBg: 'bg-[#44475a]/50 border-[#bd93f9]/30',
    logoGradient: 'from-[#ff79c6] via-[#bd93f9] to-[#8be9fd]',
    titleGradient: 'from-[#50fa7b] to-[#8be9fd]',
    tagClass: 'bg-[#bd93f9]/20 text-[#bd93f9] border-[#bd93f9]/30',
    accentText: 'text-[#bd93f9]',
    gridColor: '#6272a420',
    glow: 'bg-[#bd93f9]/10',
    featureColors: [
      'bg-[#ff79c6]/20 text-[#ff79c6]',
      'bg-[#8be9fd]/20 text-[#8be9fd]',
      'bg-[#50fa7b]/20 text-[#50fa7b]',
      'bg-[#ffb86c]/20 text-[#ffb86c]'
    ]
  },
  nord: {
    id: 'nord',
    name: 'Nord',
    appBg: 'bg-[#2E3440]',
    appText: 'text-[#ECEFF4]',
    appMuted: 'text-[#D8DEE9]/70',
    appMutedHover: 'group-hover:text-[#ECEFF4]',
    cardBg: 'bg-[#3B4252] border-[#4C566A]',
    cardHoverBg: 'group-hover:bg-[#434C5E] group-hover:border-[#88C0D0]',
    headerBg: 'bg-[#2E3440]/90 border-[#4C566A]',
    bannerBg: 'bg-[#3B4252] border-[#81A1C1]/50',
    logoGradient: 'from-[#8FBCBB] via-[#88C0D0] to-[#81A1C1]',
    titleGradient: 'from-[#88C0D0] to-[#81A1C1]',
    tagClass: 'bg-[#5E81AC]/30 text-[#88C0D0] border-[#81A1C1]/40',
    accentText: 'text-[#88C0D0]',
    gridColor: '#4C566A40',
    glow: 'bg-[#88C0D0]/10',
    featureColors: [
      'bg-[#BF616A]/20 text-[#BF616A]',
      'bg-[#D08770]/20 text-[#D08770]',
      'bg-[#EBCB8B]/20 text-[#EBCB8B]',
      'bg-[#A3BE8C]/20 text-[#A3BE8C]'
    ]
  },
  monokai: {
    id: 'monokai',
    name: 'Monokai Classic',
    appBg: 'bg-[#2e2e2e]',
    appText: 'text-[#d6d6d6]',
    appMuted: 'text-[#797979]',
    appMutedHover: 'group-hover:text-[#d6d6d6]',
    cardBg: 'bg-[#797979]/10 border-[#797979]/30',
    cardHoverBg: 'group-hover:bg-[#797979]/20 group-hover:border-[#b4d273]/50',
    headerBg: 'bg-[#2e2e2e]/90 border-[#797979]/30',
    bannerBg: 'bg-[#797979]/20 border-[#e5b567]/30',
    logoGradient: 'from-[#b05279] via-[#9e86c8] to-[#e87d3e]',
    titleGradient: 'from-[#b4d273] to-[#e5b567]',
    tagClass: 'bg-[#9e86c8]/20 text-[#9e86c8] border-[#9e86c8]/30',
    accentText: 'text-[#9e86c8]',
    gridColor: '#79797920',
    glow: 'bg-[#b4d273]/10',
    featureColors: [
      'bg-[#b05279]/20 text-[#b05279]',
      'bg-[#e5b567]/20 text-[#e5b567]',
      'bg-[#b4d273]/20 text-[#b4d273]',
      'bg-[#e87d3e]/20 text-[#e87d3e]'
    ]
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    const saved = localStorage.getItem('theme');
    return THEMES[saved] ? saved : 'midnight';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', themeId);
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ theme: THEMES[themeId], setThemeId, themeId }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
