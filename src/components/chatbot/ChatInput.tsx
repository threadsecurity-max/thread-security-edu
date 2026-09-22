import React, { useRef, useEffect } from 'react';
import { SendHorizonal } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isTyping: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSubmit, isTyping }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isTyping) {
        onSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-3 sm:p-4 border-t border-violet-500/20 bg-black/60 backdrop-blur-xl">
      <div className="flex items-end gap-2 bg-[#120d2a]/90 border border-violet-500/30 focus-within:border-violet-500/70 rounded-2xl p-2 transition-all shadow-inner shadow-black/60">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask TSE AI about courses, labs, mentors, or enrollment..."
          rows={1}
          maxLength={1000}
          disabled={isTyping}
          className="flex-1 bg-transparent border-0 text-xs text-white placeholder-zinc-500 resize-none focus:ring-0 focus:outline-none px-2 py-1 max-h-[120px] scrollbar-none disabled:opacity-50"
          aria-label="Chat input message"
        />

        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-md shadow-violet-950/40 shrink-0"
          aria-label="Send message"
        >
          <SendHorizonal className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between text-[10px] text-zinc-500 px-2 mt-1.5">
        <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline</span>
        <span>{input.length}/1000</span>
      </div>
    </form>
  );
};
