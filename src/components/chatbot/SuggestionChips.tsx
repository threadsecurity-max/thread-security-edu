import React from 'react';
import { SuggestionChipItem } from './intentRouter';

interface SuggestionChipsProps {
  suggestions?: SuggestionChipItem[];
  onSelect: (type: string, label: string) => void;
  disabled?: boolean;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSelect, disabled }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {suggestions.map((chip, idx) => (
        <button
          key={`${chip.type}-${idx}`}
          type="button"
          onClick={() => onSelect(chip.type, chip.label)}
          disabled={disabled}
          className="text-xs px-3 py-1.5 rounded-full bg-violet-950/40 hover:bg-violet-900/60 border border-violet-500/30 text-violet-200 hover:text-white transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm hover:border-violet-400/50"
        >
          <span>{chip.label}</span>
        </button>
      ))}
    </div>
  );
};
