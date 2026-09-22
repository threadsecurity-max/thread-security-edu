import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatMessageItem, ActionChip } from './intentRouter';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  messages: ChatMessageItem[];
  input: string;
  setInput: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isTyping: boolean;
  onActionClick: (action: ActionChip) => void;
  onSuggestionClick: (type: string, label: string) => void;
  onDurationClick: (domain: string, duration: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  onReset,
  messages,
  input,
  setInput,
  onSubmit,
  isTyping,
  onActionClick,
  onSuggestionClick,
  onDurationClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 transition-all duration-300 ease-out inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[440px] sm:h-[620px] max-h-[100dvh] flex flex-col bg-[#0c081e]/95 border border-violet-500/30 sm:rounded-3xl shadow-2xl shadow-violet-950/50 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <ChatHeader onClose={onClose} onReset={onReset} />

      {/* Messages Feed */}
      <ChatMessages
        messages={messages}
        isTyping={isTyping}
        onActionClick={onActionClick}
        onSuggestionClick={onSuggestionClick}
        onDurationClick={onDurationClick}
      />

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        isTyping={isTyping}
      />
    </div>
  );
};
