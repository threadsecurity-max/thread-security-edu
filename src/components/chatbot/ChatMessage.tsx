import React from 'react';
import { Bot, User, ChevronRight } from 'lucide-react';
import { ChatMessageItem, ActionChip } from './intentRouter';
import { SuggestionChips } from './SuggestionChips';

interface ChatMessageProps {
  message: ChatMessageItem;
  onActionClick: (action: ActionChip) => void;
  onSuggestionClick: (type: string, label: string) => void;
  onDurationClick: (domain: string, duration: string) => void;
  isLatestAssistantMessage?: boolean;
  disabled?: boolean;
}

/**
 * Format markdown text safely into React elements.
 */
function renderMarkdownText(text: string) {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Heading 3
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="text-sm font-bold text-violet-400 mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }

    // Bullet point
    if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
      const itemText = line.substring(2);
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1 my-0.5 text-xs text-zinc-300">
          <span className="text-[#C6FF34] font-bold shrink-0">•</span>
          <span>{renderFormattedInline(itemText)}</span>
        </div>
      );
    }

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-2" />;
    }

    return (
      <p key={lineIdx} className="text-xs text-zinc-300 my-0.5 leading-relaxed">
        {renderFormattedInline(line)}
      </p>
    );
  });
}

/**
 * Parses bold text (**bold**) and inline code (`code`) safely.
 */
function renderFormattedInline(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-black/40 border border-zinc-700 text-violet-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onActionClick,
  onSuggestionClick,
  onDurationClick,
  isLatestAssistantMessage,
  disabled,
}) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 mb-4 group">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600 to-purple-700 text-white px-4 py-2.5 text-xs shadow-md shadow-violet-950/30 border border-violet-400/30 leading-relaxed">
          {message.text}
        </div>
        <div className="w-7 h-7 rounded-lg bg-violet-950/60 border border-violet-500/40 flex items-center justify-center shrink-0 mt-0.5 text-violet-300">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 mb-4 group">
      <div className="w-7 h-7 rounded-lg bg-[#130d2a] border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 text-[#C6FF34]">
        <Bot className="w-3.5 h-3.5" />
      </div>

      <div className="max-w-[90%] sm:max-w-[82%] space-y-2">
        <div className="rounded-2xl rounded-tl-sm bg-[#130d2a]/90 border border-violet-500/20 p-3.5 text-xs text-zinc-300 shadow-lg shadow-black/40 backdrop-blur-md">
          {renderMarkdownText(message.text)}

          {/* Interactive Catalog Tracks */}
          {message.catalogItems && message.catalogItems.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-3 pt-2 border-t border-violet-500/20">
              {message.catalogItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-violet-500/20 hover:border-violet-500/50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-white tracking-wide block">{item.label} Track</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{item.summary}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDurationClick(item.domain, item.duration)}
                    disabled={disabled}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50 shadow-sm shadow-violet-900/40"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Action Pills */}
          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-violet-500/20">
              {message.actions.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onActionClick(act)}
                  disabled={disabled}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-950/60 hover:bg-violet-900/80 border border-violet-500/40 text-violet-200 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{act.label}</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Chips shown under latest message */}
        {isLatestAssistantMessage && (
          <SuggestionChips
            suggestions={message.suggestions}
            onSelect={onSuggestionClick}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
};
