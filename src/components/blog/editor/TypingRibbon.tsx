'use client';

import React, { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
  Paintbrush,
  MessageSquarePlus,
  Highlighter,
  List,
  ListOrdered,
  ChevronDown,
  Check,
  Type,
  X,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';

interface TypingRibbonProps {
  editor: Editor;
  isFloating?: boolean;
}

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Inter', value: 'var(--font-inter), Inter, sans-serif' },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Outfit', value: 'Outfit, system-ui, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
];

const FONT_SIZES = [
  { label: '10', value: '10px' },
  { label: '11', value: '11px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow Marker', value: '#fef08a', border: 'border-yellow-400' },
  { name: 'Cyber Lime', value: '#C6FF34', border: 'border-lime-400' },
  { name: 'Sky Cyan', value: '#7dd3fc', border: 'border-sky-400' },
  { name: 'Rose Pink', value: '#f472b6', border: 'border-pink-400' },
  { name: 'Amber Orange', value: '#fed7aa', border: 'border-amber-400' },
  { name: 'Emerald', value: '#86efac', border: 'border-emerald-400' },
];

const TEXT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Slate Gray', value: '#94a3b8' },
  { name: 'Alert Red', value: '#ef4444' },
  { name: 'Cyber Lime', value: '#C6FF34' },
  { name: 'Sky Blue', value: '#38bdf8' },
  { name: 'Emerald Green', value: '#34d399' },
  { name: 'Violet Purple', value: '#c084fc' },
  { name: 'Amber Gold', value: '#f59e0b' },
];

interface StoredFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string | null;
  fontSize?: string | null;
  color?: string | null;
  highlightColor?: string | null;
}

export function TypingRibbon({ editor, isFloating = false }: TypingRibbonProps) {
  // Format painter memory
  const [copiedFormat, setCopiedFormat] = useState<StoredFormat | null>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [stylesMenuOpen, setStylesMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Sync linkUrl when popover opens or link status changes
  useEffect(() => {
    if (linkMenuOpen) {
      const href = editor.getAttributes('link')?.href || '';
      setLinkUrl(href);
    }
  }, [linkMenuOpen, editor]);

  // Read current active styles from editor
  const textAttrs = editor.getAttributes('customTextStyle') || {};
  const currentFontFamily = textAttrs.fontFamily || 'Arial, Helvetica, sans-serif';
  const currentFontSize = textAttrs.fontSize || '16px';
  const currentTextColor = textAttrs.color || '#ffffff';
  const currentHighlight = editor.getAttributes('customHighlight')?.color || null;

  // Active font family label
  const activeFontLabel =
    FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.label || 'Arial';

  // Active font size label
  const activeSizeLabel = currentFontSize.replace('px', '') || '16';

  // Format Painter trigger
  const handleToggleFormatPainter = () => {
    if (copiedFormat) {
      // Deactivate format painter
      setCopiedFormat(null);
    } else {
      // Capture current formats from selection
      const format: StoredFormat = {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        fontFamily: textAttrs.fontFamily || null,
        fontSize: textAttrs.fontSize || null,
        color: textAttrs.color || null,
        highlightColor: currentHighlight,
      };
      setCopiedFormat(format);
    }
  };

  // When format painter is active, apply to next selection
  useEffect(() => {
    if (!copiedFormat) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Apply copied formatting
        let chain = editor.chain().focus();

        if (copiedFormat.bold) chain = chain.setBold();
        else chain = chain.unsetBold();

        if (copiedFormat.italic) chain = chain.setItalic();
        else chain = chain.unsetItalic();

        if (copiedFormat.underline) chain = chain.setUnderline();
        else chain = chain.unsetUnderline();

        if (copiedFormat.fontFamily || copiedFormat.fontSize || copiedFormat.color) {
          chain = chain.setMark('customTextStyle', {
            fontFamily: copiedFormat.fontFamily,
            fontSize: copiedFormat.fontSize,
            color: copiedFormat.color,
          });
        }

        if (copiedFormat.highlightColor) {
          chain = chain.setMark('customHighlight', { color: copiedFormat.highlightColor });
        } else {
          chain = chain.unsetMark('customHighlight');
        }

        chain.run();
        // Clear painter after application
        setCopiedFormat(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, copiedFormat]);

  // Font size increments / decrements (A^ and Av)
  const changeFontSizeStep = (delta: number) => {
    const currentNum = parseInt(activeSizeLabel, 10) || 16;
    const newNum = Math.min(48, Math.max(9, currentNum + delta));
    editor
      .chain()
      .focus()
      .setMark('customTextStyle', {
        ...textAttrs,
        fontSize: `${newNum}px`,
      })
      .run();
  };

  // Add Comment / Note insertion
  const handleInsertComment = () => {
    const comment = window.prompt(
      'Enter an editorial note or reviewer comment to insert at cursor:',
      'Editorial Note: Verify source data and MITRE ATT&CK reference'
    );
    if (!comment) return;

    editor
      .chain()
      .focus()
      .insertContent(
        ` <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#C6FF34]/20 border border-[#C6FF34]/40 text-[#C6FF34]" title="Reviewer Comment">💬 ${comment}</span> `
      )
      .run();
  };

  // Hyperlink handlers
  const handleApplyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed || trimmed === 'https://' || trimmed === 'http://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkMenuOpen(false);
      return;
    }
    let finalUrl = trimmed;
    if (
      !/^https?:\/\//i.test(finalUrl) &&
      !finalUrl.startsWith('/') &&
      !finalUrl.startsWith('#') &&
      !finalUrl.startsWith('mailto:')
    ) {
      finalUrl = `https://${finalUrl}`;
    }
    const cleanUrl = finalUrl.replace(/["'<>\\]/g, '');
    editor.chain().focus().extendMarkRange('link').setLink({ href: cleanUrl }).run();
    setLinkMenuOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkUrl('');
    setLinkMenuOpen(false);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-1 text-slate-200 select-none ${
        isFloating
          ? 'bg-[#18181b]/95 backdrop-blur-xl border border-white/25 rounded-2xl p-1.5 shadow-2xl ring-1 ring-black/50 animate-in fade-in zoom-in-95 duration-100 z-50'
          : 'bg-[#101014] border-b border-white/10 p-2 text-xs'
      }`}
    >
      {/* 1. Font Family Dropdown (Arial, Inter, etc.) */}
      <Popover open={fontMenuOpen} onOpenChange={setFontMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-medium flex items-center justify-between gap-1 min-w-[76px] transition-colors"
            title="Font Family"
          >
            <span className="truncate max-w-[62px]">{activeFontLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-44 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-0.5 z-50"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400">
            Font Family
          </div>
          {FONT_FAMILIES.map((font) => (
            <button
              key={font.label}
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setMark('customTextStyle', {
                    ...textAttrs,
                    fontFamily: font.value,
                  })
                  .run();
                setFontMenuOpen(false);
              }}
              className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center justify-between text-slate-200 hover:text-white transition-colors"
              style={{ fontFamily: font.value }}
            >
              <span>{font.label}</span>
              {activeFontLabel === font.label && (
                <Check className="w-3.5 h-3.5 text-[#C6FF34]" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* 2. Font Size Dropdown (11, 12, 14, etc.) */}
      <Popover open={sizeMenuOpen} onOpenChange={setSizeMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-mono font-bold flex items-center justify-between gap-1 w-[46px] transition-colors"
            title="Font Size"
          >
            <span>{activeSizeLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-24 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-0.5 z-50 max-h-48 overflow-y-auto"
        >
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setMark('customTextStyle', {
                    ...textAttrs,
                    fontSize: size.value,
                  })
                  .run();
                setSizeMenuOpen(false);
              }}
              className="w-full text-left px-2 py-1 rounded-md hover:bg-white/10 flex items-center justify-between text-slate-200 hover:text-white font-mono"
            >
              <span>{size.label}</span>
              {activeSizeLabel === size.label && (
                <Check className="w-3 h-3 text-[#C6FF34]" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* 3. Increase Font Size (A^) */}
      <button
        type="button"
        onClick={() => changeFontSizeStep(2)}
        className="h-7 w-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
        title="Increase Font Size (+2px)"
      >
        <span className="font-serif font-bold text-xs flex items-center">
          A<span className="text-[9px] -mt-1 font-mono">^</span>
        </span>
      </button>

      {/* 4. Decrease Font Size (Av) */}
      <button
        type="button"
        onClick={() => changeFontSizeStep(-2)}
        className="h-7 w-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
        title="Decrease Font Size (-2px)"
      >
        <span className="font-serif font-bold text-xs flex items-center">
          A<span className="text-[9px] mt-1 font-mono">v</span>
        </span>
      </button>

      {/* 5. Format Painter (Brush Icon with yellow accent badge) */}
      <button
        type="button"
        onClick={handleToggleFormatPainter}
        className={`h-7 px-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
          copiedFormat
            ? 'bg-[#C6FF34] text-black border-[#C6FF34] font-bold shadow-lg shadow-[#C6FF34]/30 animate-pulse'
            : 'bg-black/40 hover:bg-white/10 border-white/10 text-amber-300 hover:text-amber-200'
        }`}
        title={
          copiedFormat
            ? 'Format Painter Active: Select text to paint styles (click to cancel)'
            : 'Format Painter: Copy text formatting and apply to next selection'
        }
      >
        <Paintbrush className="w-3.5 h-3.5" />
        {copiedFormat && <span className="text-[10px] font-mono">Painting</span>}
      </button>

      {/* 6. Styles Dropdown (Normal, H1, H2, H3, Blockquote, Code, Callout) */}
      <Popover open={stylesMenuOpen} onOpenChange={setStylesMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-medium flex items-center justify-between gap-1 transition-colors"
            title="Styles"
          >
            <span className="font-serif">Styles</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-48 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-1 z-50"
        >
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'bg-white/15 text-white font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>Normal Text</span>
            {editor.isActive('paragraph') && !editor.isActive('heading') && (
              <Check className="w-3 h-3 text-[#C6FF34]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#C6FF34]/20 text-[#C6FF34] font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="text-sm font-extrabold text-[#C6FF34]">Heading 1</span>
            {editor.isActive('heading', { level: 1 }) && (
              <Check className="w-3 h-3 text-[#C6FF34]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-sky-500/20 text-sky-300 font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="text-xs font-bold text-sky-400">Heading 2</span>
            {editor.isActive('heading', { level: 2 }) && (
              <Check className="w-3 h-3 text-sky-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-purple-500/20 text-purple-300 font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="text-[11px] font-semibold text-purple-400">Heading 3</span>
            {editor.isActive('heading', { level: 3 }) && (
              <Check className="w-3 h-3 text-purple-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleBlockquote().run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-[#C6FF34]/20 text-[#C6FF34] font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="italic">Quote Callout</span>
            {editor.isActive('blockquote') && (
              <Check className="w-3 h-3 text-[#C6FF34]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              editor.chain().focus().toggleCodeBlock().run();
              setStylesMenuOpen(false);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
              editor.isActive('codeBlock')
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            <span className="font-mono text-[10px]">Code Block Surface</span>
            {editor.isActive('codeBlock') && (
              <Check className="w-3 h-3 text-emerald-400" />
            )}
          </button>
        </PopoverContent>
      </Popover>

      {/* 7. New Comment / Editorial Note Button */}
      <button
        type="button"
        onClick={handleInsertComment}
        className="h-7 px-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
        title="Add Reviewer Note / Editorial Comment"
      >
        <MessageSquarePlus className="w-3.5 h-3.5" />
        <span className="text-[10px] hidden sm:inline font-mono">Comment</span>
      </button>

      <div className="w-px h-5 bg-white/15 mx-0.5" />

      {/* 8. Bold (B) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
          editor.isActive('bold')
            ? 'bg-[#C6FF34] text-black shadow-md'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* 9. Italic (I) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`h-7 w-7 rounded-lg text-xs italic transition-all flex items-center justify-center ${
          editor.isActive('italic')
            ? 'bg-[#C6FF34] text-black shadow-md'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* 10. Underline (U) */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`h-7 w-7 rounded-lg text-xs underline transition-all flex items-center justify-center ${
          editor.isActive('underline')
            ? 'bg-[#C6FF34] text-black shadow-md'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      {/* 11. Hyperlink (Link) Button & Popover */}
      <Popover open={linkMenuOpen} onOpenChange={setLinkMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`h-7 w-7 rounded-lg text-xs transition-all flex items-center justify-center ${
              editor.isActive('link')
                ? 'bg-[#C6FF34] text-black shadow-md font-bold'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
            title={editor.isActive('link') ? 'Edit / Remove Hyperlink (Ctrl+K)' : 'Insert Hyperlink (Ctrl+K)'}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-72 p-3 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2.5 z-50 text-xs"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1.5 text-[#C6FF34]">
              <LinkIcon className="w-3 h-3 text-[#C6FF34]" />
              {editor.isActive('link') ? 'Edit Hyperlink' : 'Insert Hyperlink'}
            </span>
            {editor.isActive('link') && (
              <span className="text-emerald-400 font-bold">Active</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 block">Link Destination (URL):</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLink();
                }
              }}
              placeholder="https://example.com or /courses/..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-[#C6FF34] focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {editor.isActive('link') ? (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                <Unlink className="w-3 h-3" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLinkMenuOpen(false)}
                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] font-mono transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-3 py-1 rounded-lg bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* 12. Highlight Color Picker (Pen with yellow marker bar) */}
      <Popover open={highlightMenuOpen} onOpenChange={setHighlightMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-7 px-1.5 rounded-lg hover:bg-white/10 flex items-center gap-0.5 text-slate-200 transition-colors"
            title="Text Highlight Color"
          >
            <div className="flex flex-col items-center">
              <Highlighter className="w-3.5 h-3.5 text-amber-300" />
              <span
                className="w-3.5 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: currentHighlight || '#facc15' }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
            <span>Highlight Color</span>
            {currentHighlight && (
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetMark('customHighlight').run();
                  setHighlightMenuOpen(false);
                }}
                className="text-rose-400 hover:underline flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {HIGHLIGHT_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setMark('customHighlight', { color: col.value })
                    .run();
                  setHighlightMenuOpen(false);
                }}
                className={`h-7 rounded-lg flex items-center justify-center border transition-transform hover:scale-105 ${col.border}`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              >
                {currentHighlight === col.value && (
                  <Check className="w-3.5 h-3.5 text-black font-bold" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* 12. Text Color Picker (A with red bar) */}
      <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-7 px-1.5 rounded-lg hover:bg-white/10 flex items-center gap-0.5 text-slate-200 transition-colors"
            title="Text Color"
          >
            <div className="flex flex-col items-center">
              <span className="font-serif font-bold text-xs leading-none">A</span>
              <span
                className="w-3.5 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: currentTextColor }}
              />
            </div>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
            <span>Text Color</span>
            <button
              type="button"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setMark('customTextStyle', {
                    ...textAttrs,
                    color: null,
                  })
                  .run();
                setColorMenuOpen(false);
              }}
              className="text-slate-400 hover:text-white hover:underline flex items-center gap-0.5"
            >
              Default
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {TEXT_COLORS.map((col) => (
              <button
                key={col.value}
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setMark('customTextStyle', {
                      ...textAttrs,
                      color: col.value,
                    })
                    .run();
                  setColorMenuOpen(false);
                }}
                className="h-6 w-full rounded-md border border-white/20 flex items-center justify-center transition-transform hover:scale-105"
                style={{ backgroundColor: col.value }}
                title={col.name}
              >
                {currentTextColor === col.value && (
                  <Check
                    className={`w-3 h-3 ${
                      col.value === '#ffffff' || col.value === '#C6FF34'
                        ? 'text-black'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-5 bg-white/15 mx-0.5" />

      {/* 13. Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-7 w-7 rounded-lg text-xs transition-all flex items-center justify-center ${
          editor.isActive('bulletList')
            ? 'bg-[#C6FF34] text-black shadow-md'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title="Bullet List (Ctrl+Shift+8)"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      {/* 14. Numbered List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-7 w-7 rounded-lg text-xs transition-all flex items-center justify-center ${
          editor.isActive('orderedList')
            ? 'bg-[#C6FF34] text-black shadow-md'
            : 'text-slate-200 hover:text-white hover:bg-white/10'
        }`}
        title="Numbered List (Ctrl+Shift+7)"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
