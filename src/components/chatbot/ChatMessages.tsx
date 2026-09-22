import React, { useRef, useEffect } from 'react';
import { ChatMessageItem, ActionChip } from './intentRouter';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { Shield, Sparkles } from 'lucide-react';

interface ChatMessagesProps {
  messages: ChatMessageItem[];
  isTyping: boolean;
  onActionClick: (action: ActionChip) => void;
  onSuggestionClick: (type: string, label: string) => void;
  onDurationClick: (domain: string, duration: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isTyping,
  onActionClick,
  onSuggestionClick,
  onDurationClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollRef = useRef<boolean>(true);

  // Handle user scroll detection
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 60;
    isAutoScrollRef.current = atBottom;
  };

  // Scroll to bottom when new message arrives or typing changes
  useEffect(() => {
    if (isAutoScrollRef.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  // Find index of latest assistant message
  const latestAssistantIndex = messages
    .map((m, idx) => (m.role === 'assistant' ? idx : -1))
    .filter((idx) => idx !== -1)
    .pop();

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-2 scrollbar-thin scrollbar-thumb-violet-900/30 scrollbar-track-transparent"
    >
      {/* Intentional Empty State Banner */}
      {messages.length === 1 && (
        <div className="text-center py-6 px-4 mb-3 border border-violet-500/20 bg-gradient-to-b from-violet-950/20 to-transparent rounded-2xl">
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-[#C6FF34]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">Welcome to Thread Security Education</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Ask questions about our offensive security tracks, blue team SOC programs, autonomous AI systems, virtual labs, and industry mentors.
          </p>
        </div>
      )}

      {/* Message Feed */}
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onActionClick={onActionClick}
          onSuggestionClick={onSuggestionClick}
          onDurationClick={onDurationClick}
          isLatestAssistantMessage={index === latestAssistantIndex}
          disabled={isTyping}
        />
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[#130d2a] border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 text-violet-300">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <TypingIndicator />
        </div>
      )}
    </div>
  );
};
