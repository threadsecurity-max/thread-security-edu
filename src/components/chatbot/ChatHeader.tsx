import React from 'react';
import { Bot, RotateCcw, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onReset }) => {
  return (
    <header className="px-5 py-4 border-b border-violet-500/20 bg-[#0c081e]/80 backdrop-blur-xl flex items-center justify-between gap-3 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-700 to-slate-950 p-0.5 flex items-center justify-center shadow-lg shadow-violet-950/50 shrink-0">
          <div className="w-full h-full bg-[#0f0926] rounded-[10px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-300" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide truncate">TSE AI Assistant</h2>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/60 border border-[#C6FF34]/30 text-[#C6FF34] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF34] animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#C6FF34]" />
            Cybersecurity & AI Curriculum Guide
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <a
          href="/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-violet-950/40 transition-all active:scale-95 mr-1"
          title="Apply for admissions"
        >
          <span>Enroll</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>

        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          title="Start a new conversation"
          aria-label="Start new chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          title="Close assistant"
          aria-label="Close chat window"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
