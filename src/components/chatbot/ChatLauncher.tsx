import React from 'react';
import { Bot, MessageSquare, X } from 'lucide-react';

interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({ isOpen, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {!isOpen && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c081e]/90 border border-violet-500/40 text-[11px] font-semibold text-white shadow-xl shadow-violet-950/50 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-pulse" />
          <span>Ask TSE AI</span>
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        aria-label={isOpen ? 'Close TSE AI Chat' : 'Open TSE AI Chat'}
        aria-expanded={isOpen}
        className="w-13 h-13 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-slate-950 text-white flex items-center justify-center shadow-2xl shadow-violet-900/60 border border-violet-400/40 hover:border-[#C6FF34]/60 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/60 group cursor-pointer"
      >
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 rotate-0 group-hover:rotate-90 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#C6FF34] border-2 border-slate-950" />
            </>
          )}
        </div>
      </button>
    </div>
  );
};
