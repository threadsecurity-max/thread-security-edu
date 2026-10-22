'use client';

import React, { useState } from 'react';
import {
  Keyboard,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Command,
  FileCode2,
} from 'lucide-react';

export function ShortcutsHelpBar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#101014] border border-white/10 rounded-xl overflow-hidden transition-all text-xs font-mono">
      {/* Header Bar */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#C6FF34] font-bold">
            <Keyboard className="w-3.5 h-3.5" />
            <span className="uppercase text-[11px] tracking-wider">Shortcuts Ribbon & Quick Keys</span>
          </div>
          <span className="text-slate-500 hidden md:inline">|</span>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-300">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[#C6FF34]">Ctrl+B</kbd> Bold</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-sky-400">Ctrl+I</kbd> Italic</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-purple-400">Ctrl+U</kbd> Underline</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-emerald-400">Ctrl+K</kbd> Link</span>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
        >
          <span>{expanded ? 'Hide Cheatsheet' : 'Expand Cheatsheet'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Cheatsheet Drawer */}
      {expanded && (
        <div className="p-3 bg-black/60 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-150">
          {/* Column 1: Standard Hotkeys */}
          <div className="space-y-1.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C6FF34] flex items-center gap-1">
              <Command className="w-3 h-3" /> Keyboard Shortcuts
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              <li className="flex items-center justify-between">
                <span>Bold text</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + B</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Italic text</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + I</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Underline text</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + U</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Insert Hyperlink</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + K</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Undo / Redo</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl+Z / Ctrl+Y</kbd>
              </li>
            </ul>
          </div>

          {/* Column 2: Headings & Block Navigation */}
          <div className="space-y-1.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Headings & Structure
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              <li className="flex items-center justify-between">
                <span>Heading 1 (Main Topic)</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + Alt + 1</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Heading 2 (Sub-section)</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + Alt + 2</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Heading 3 (Detail)</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + Alt + 3</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Bullet List</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + Shift + 8</kbd>
              </li>
              <li className="flex items-center justify-between">
                <span>Numbered List</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Ctrl + Shift + 7</kbd>
              </li>
            </ul>
          </div>

          {/* Column 3: Markdown Live Typing Rules */}
          <div className="space-y-1.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <FileCode2 className="w-3 h-3" /> Markdown Live Triggers
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              <li className="flex items-center justify-between">
                <span>Type <code className="text-[#C6FF34]"># </code> + Space</span>
                <span className="text-slate-400 text-[10px]">Creates H1</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Type <code className="text-sky-400">## </code> + Space</span>
                <span className="text-slate-400 text-[10px]">Creates H2</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Type <code className="text-amber-400">&gt; </code> + Space</span>
                <span className="text-slate-400 text-[10px]">Creates Quote</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Type <code className="text-emerald-400">- </code> or <code className="text-emerald-400">* </code></span>
                <span className="text-slate-400 text-[10px]">Creates Bullet</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Type <code className="text-purple-400">```</code> + Enter</span>
                <span className="text-slate-400 text-[10px]">Creates Code</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
