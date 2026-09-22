import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-violet-950/30 border border-violet-500/20 rounded-2xl w-fit backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#C6FF34] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs text-violet-200/80 font-medium tracking-wide ml-1">TSE AI is thinking...</span>
    </div>
  );
};
