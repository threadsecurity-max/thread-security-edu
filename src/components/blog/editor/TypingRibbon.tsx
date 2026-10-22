'use client';

import React, { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Unlink,
  Paintbrush,
  MessageSquarePlus,
  Highlighter,
  ChevronDown,
  Check,
  Type,
  X,
  Image as ImageIcon,
  Upload,
  Table as TableIcon,
  Undo,
  Redo,
  Eraser,
  Sparkles,
  Keyboard,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui';

interface TypingRibbonProps {
  editor: Editor;
  isFloating?: boolean;
  onUploadImage?: () => void;
  onAddImageUrl?: () => void;
  isUploadingImage?: boolean;
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
  { label: '22', value: '22px' },
  { label: '24', value: '24px' },
  { label: '28', value: '28px' },
  { label: '32', value: '32px' },
  { label: '36', value: '36px' },
  { label: '42', value: '42px' },
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
  strike?: boolean;
  fontFamily?: string | null;
  fontSize?: string | null;
  color?: string | null;
  highlightColor?: string | null;
}

export function TypingRibbon({
  editor,
  isFloating = false,
  onUploadImage,
  onAddImageUrl,
  isUploadingImage = false,
}: TypingRibbonProps) {
  // Format painter memory
  const [copiedFormat, setCopiedFormat] = useState<StoredFormat | null>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [stylesMenuOpen, setStylesMenuOpen] = useState(false);
  const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showCheatsheet, setShowCheatsheet] = useState(true);

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
  const currentTextColor = textAttrs.color || '#ffffff';
  const currentHighlight = editor.getAttributes('customHighlight')?.color || null;

  // Active font family label
  const activeFontLabel =
    FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.label || 'Arial';

  // Compute active font size based on active block hierarchy or inline style
  const getActiveSizeLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return '36';
    if (editor.isActive('heading', { level: 2 })) return '28';
    if (editor.isActive('heading', { level: 3 })) return '22';
    if (textAttrs.fontSize) {
      return textAttrs.fontSize.replace('px', '');
    }
    return '16';
  };

  const activeSizeLabel = getActiveSizeLabel();

  // Format Painter trigger
  const handleToggleFormatPainter = () => {
    if (copiedFormat) {
      setCopiedFormat(null);
    } else {
      const format: StoredFormat = {
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
        strike: editor.isActive('strike'),
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
        let chain = editor.chain().focus();

        if (copiedFormat.bold) chain = chain.setBold();
        else chain = chain.unsetBold();

        if (copiedFormat.italic) chain = chain.setItalic();
        else chain = chain.unsetItalic();

        if (copiedFormat.underline) chain = chain.setUnderline();
        else chain = chain.unsetUnderline();

        if (copiedFormat.strike) chain = chain.setStrike();
        else chain = chain.unsetStrike();

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
        setCopiedFormat(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, copiedFormat]);

  // Heading handlers with guaranteed execution & no focus loss
  const handleToggleHeading = (level: 1 | 2 | 3) => {
    if (editor.isActive('heading', { level })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().setHeading({ level }).run();
    }
  };

  const handleSetHeadingExplicit = (level: 1 | 2 | 3) => {
    editor.chain().focus().setHeading({ level }).run();
    setStylesMenuOpen(false);
  };

  const handleSetParagraph = () => {
    editor.chain().focus().setParagraph().run();
    setStylesMenuOpen(false);
  };

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

  // Clear all inline styling & marks
  const handleClearFormatting = () => {
    editor
      .chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
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

  // Table insertion helper
  const handleTableToggle = () => {
    if (editor.isActive('table')) {
      editor.chain().focus().deleteTable().run();
    } else {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  };

  // ==========================================
  // FLOATING SELECTION MINI-RIBBON (BUBBLE MENU)
  // ==========================================
  if (isFloating) {
    return (
      <div
        className="flex items-center gap-1 p-1 bg-[#141418]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ring-1 ring-black/50 text-slate-200 select-none z-50 animate-in fade-in zoom-in-95 duration-100 max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none"
        onMouseDown={(e) => {
          // Prevent losing selection focus when clicking anywhere inside the floating ribbon container
          e.stopPropagation();
        }}
      >
        {/* Quick Headings Switcher */}
        <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-xl border border-white/10 shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`h-7 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'bg-white/20 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Normal Paragraph (16px)"
          >
            P
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(1)}
            className={`h-7 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#C6FF34] text-black shadow-md'
                : 'text-[#C6FF34] hover:bg-[#C6FF34]/15'
            }`}
            title="Heading 1 — 36px (Ctrl+Alt+1)"
          >
            H1
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(2)}
            className={`h-7 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-sky-400 text-black shadow-md'
                : 'text-sky-400 hover:bg-sky-400/15'
            }`}
            title="Heading 2 — 28px (Ctrl+Alt+2)"
          >
            H2
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(3)}
            className={`h-7 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-purple-400 text-black shadow-md'
                : 'text-purple-400 hover:bg-purple-400/15'
            }`}
            title="Heading 3 — 22px (Ctrl+Alt+3)"
          >
            H3
          </button>
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 shrink-0" />

        {/* Basic Inlines */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 rounded-lg text-xs line-through transition-all flex items-center justify-center ${
              editor.isActive('strike')
                ? 'bg-[#C6FF34] text-black shadow-md'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 shrink-0" />

        {/* Colors & Highlight */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Popover open={highlightMenuOpen} onOpenChange={setHighlightMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className="h-7 px-1.5 rounded-lg hover:bg-white/10 flex items-center gap-0.5 text-slate-200 transition-colors"
                title="Highlight Color"
              >
                <div className="flex flex-col items-center">
                  <Highlighter className="w-3.5 h-3.5 text-amber-300" />
                  <span
                    className="w-3.5 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: currentHighlight || '#facc15' }}
                  />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span>Highlight Color</span>
                {currentHighlight && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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

          <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span>Text Color</span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 shrink-0" />

        {/* Link & Clear */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Popover open={linkMenuOpen} onOpenChange={setLinkMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className={`h-7 w-7 rounded-lg text-xs transition-all flex items-center justify-center ${
                  editor.isActive('link')
                    ? 'bg-[#C6FF34] text-black shadow-md font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={editor.isActive('link') ? 'Edit Link' : 'Insert Link (Ctrl+K)'}
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              className="w-72 p-3 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2.5 z-50 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5 text-[#C6FF34]">
                  <LinkIcon className="w-3 h-3 text-[#C6FF34]" />
                  {editor.isActive('link') ? 'Edit Link' : 'Insert Link'}
                </span>
                {editor.isActive('link') && (
                  <span className="text-emerald-400 font-bold">Active</span>
                )}
              </div>
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
                placeholder="https://example.com"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-[#C6FF34] focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                {editor.isActive('link') ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
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
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleApplyLink}
                    className="px-3 py-1 rounded-lg bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-[11px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleToggleFormatPainter}
            className={`h-7 w-7 rounded-lg text-xs flex items-center justify-center transition-all ${
              copiedFormat
                ? 'bg-[#C6FF34] text-black shadow-lg font-bold'
                : 'text-amber-300 hover:text-white hover:bg-white/10'
            }`}
            title="Format Painter"
          >
            <Paintbrush className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearFormatting}
            className="h-7 w-7 rounded-lg text-xs text-slate-400 hover:text-rose-300 hover:bg-white/10 flex items-center justify-center transition-colors"
            title="Clear Formatting"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DOCKED MASTER RIBBON (STICKY ON EDITOR CARD)
  // ==========================================
  return (
    <div className="w-full bg-[#101014]/95 border-b border-white/10 select-none text-slate-200">
      {/* Primary Toolbar Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 text-xs">
        {/* GROUP 1: HEADINGS & STRUCTURE (ONE-CLICK ACCESS FOR MANUAL WRITERS) */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          {/* Normal Body Paragraph Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSetParagraph}
            className={`h-7 px-2 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'bg-white/20 text-white font-bold ring-1 ring-white/30'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Normal Paragraph (16px text)"
          >
            <span>Body</span>
          </button>

          {/* Heading 1 (36px) — Cyber Lime Accent */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(1)}
            className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-[#C6FF34] text-black shadow-md shadow-[#C6FF34]/30 ring-1 ring-[#C6FF34]'
                : 'text-[#C6FF34] hover:bg-[#C6FF34]/15 border border-[#C6FF34]/30'
            }`}
            title="Heading 1 — Major Headline (36px text · Ctrl+Alt+1)"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-black' : 'bg-[#C6FF34]'}`} />
            <span>H1</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">36px</span>
          </button>

          {/* Heading 2 (28px) — Sky Blue Accent */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(2)}
            className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-sky-400 text-black shadow-md shadow-sky-400/30 ring-1 ring-sky-400'
                : 'text-sky-300 hover:bg-sky-400/15 border border-sky-400/30'
            }`}
            title="Heading 2 — Sub-section (28px text · Ctrl+Alt+2)"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-black' : 'bg-sky-400'}`} />
            <span>H2</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">28px</span>
          </button>

          {/* Heading 3 (22px) — Purple Accent */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleToggleHeading(3)}
            className={`h-7 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-purple-400 text-black shadow-md shadow-purple-400/30 ring-1 ring-purple-400'
                : 'text-purple-300 hover:bg-purple-400/15 border border-purple-400/30'
            }`}
            title="Heading 3 — Detail & Deep-dive (22px text · Ctrl+Alt+3)"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-black' : 'bg-purple-400'}`} />
            <span>H3</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">22px</span>
          </button>

          {/* Styles Dropdown Popover */}
          <Popover open={stylesMenuOpen} onOpenChange={setStylesMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-medium flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
                title="Browse Full Block Styles & Quotes"
              >
                <span>Styles</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-56 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-1 z-50"
            >
              <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-white/10 flex items-center justify-between">
                <span>Block Hierarchy</span>
                <span className="text-[9px] text-[#C6FF34]">Direct Click</span>
              </div>

              {/* Normal Body */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSetParagraph}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  editor.isActive('paragraph') && !editor.isActive('heading')
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Normal Body Text</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">16px</span>
              </button>

              {/* Heading 1 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSetHeadingExplicit(1)}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  editor.isActive('heading', { level: 1 })
                    ? 'bg-[#C6FF34]/20 text-[#C6FF34] font-bold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6FF34]" />
                  <span className="font-extrabold text-[#C6FF34]">Heading 1 (Major)</span>
                </div>
                <span className="text-[10px] font-mono text-[#C6FF34]">36px</span>
              </button>

              {/* Heading 2 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSetHeadingExplicit(2)}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-sky-500/20 text-sky-300 font-bold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="font-bold text-sky-400">Heading 2 (Sub-section)</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400">28px</span>
              </button>

              {/* Heading 3 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSetHeadingExplicit(3)}
                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  editor.isActive('heading', { level: 3 })
                    ? 'bg-purple-500/20 text-purple-300 font-bold'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold text-purple-400">Heading 3 (Detail)</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">22px</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              {/* Blockquote */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
                <div className="flex items-center gap-2 italic">
                  <Quote className="w-3.5 h-3.5 text-[#C6FF34]" />
                  <span>Blockquote Callout</span>
                </div>
                {editor.isActive('blockquote') && (
                  <Check className="w-3 h-3 text-[#C6FF34]" />
                )}
              </button>

              {/* Code Block */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
                <div className="flex items-center gap-2 font-mono">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminal / Code Block</span>
                </div>
                {editor.isActive('codeBlock') && (
                  <Check className="w-3 h-3 text-emerald-400" />
                )}
              </button>

              <div className="my-1 border-t border-white/10" />

              {/* Clear Formatting */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  handleClearFormatting();
                  setStylesMenuOpen(false);
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Reset to Plain Text</span>
              </button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 hidden sm:block" />

        {/* GROUP 2: TYPOGRAPHY & SIZING */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          {/* Font Family */}
          <Popover open={fontMenuOpen} onOpenChange={setFontMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-medium flex items-center justify-between gap-1 min-w-[76px] transition-colors"
                title="Font Family"
              >
                <span className="truncate max-w-[62px]">{activeFontLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-44 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-0.5 z-50"
            >
              <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400">
                Font Family
              </div>
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
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

          {/* Font Size Dropdown */}
          <Popover open={sizeMenuOpen} onOpenChange={setSizeMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className="h-7 px-2 rounded-lg bg-black/60 hover:bg-white/10 border border-white/15 text-[11px] font-mono font-bold flex items-center justify-between gap-1 min-w-[50px] transition-colors"
                title={`Font Size: ${activeSizeLabel}px`}
              >
                <span>{activeSizeLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-28 p-1.5 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl text-xs space-y-0.5 z-50 max-h-48 overflow-y-auto"
            >
              <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-white/10 mb-1">
                Font Size (px)
              </div>
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
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
                  className={`w-full text-left px-2 py-1 rounded-md hover:bg-white/10 flex items-center justify-between font-mono ${
                    activeSizeLabel === size.label
                      ? 'text-[#C6FF34] font-bold bg-[#C6FF34]/15'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <span>{size.label}px</span>
                  {activeSizeLabel === size.label && (
                    <Check className="w-3 h-3 text-[#C6FF34]" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* A^ / Av */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => changeFontSizeStep(2)}
            className="h-7 w-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Increase Font Size (+2px)"
          >
            <span className="font-serif font-bold text-xs flex items-center">
              A<span className="text-[9px] -mt-1 font-mono">^</span>
            </span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => changeFontSizeStep(-2)}
            className="h-7 w-7 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-colors"
            title="Decrease Font Size (-2px)"
          >
            <span className="font-serif font-bold text-xs flex items-center">
              A<span className="text-[9px] mt-1 font-mono">v</span>
            </span>
          </button>

          {/* Format Painter */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 hidden sm:block" />

        {/* GROUP 3: INLINE FORMATTING (B, I, U, S, Colors) */}
        <div className="flex items-center gap-0.5 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 rounded-lg text-xs line-through transition-all flex items-center justify-center ${
              editor.isActive('strike')
                ? 'bg-[#C6FF34] text-black shadow-md'
                : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Text Color Popover */}
          <Popover open={colorMenuOpen} onOpenChange={setColorMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span>Text Color</span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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

          {/* Highlight Color Popover */}
          <Popover open={highlightMenuOpen} onOpenChange={setHighlightMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
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
              sideOffset={6}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-48 p-2 bg-[#18181c] border border-white/20 rounded-xl shadow-2xl space-y-2 z-50 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span>Highlight Color</span>
                {currentHighlight && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
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
                    onMouseDown={(e) => e.preventDefault()}
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
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 hidden md:block" />

        {/* GROUP 4: ALIGNMENTS & LISTS */}
        <div className="flex items-center gap-0.5 bg-black/50 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`h-7 w-7 rounded-lg text-xs transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: 'left' })
                ? 'bg-white text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`h-7 w-7 rounded-lg text-xs transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: 'center' })
                ? 'bg-white text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`h-7 w-7 rounded-lg text-xs transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: 'right' })
                ? 'bg-white text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`h-7 w-7 rounded-lg text-xs transition-colors flex items-center justify-center ${
              editor.isActive({ textAlign: 'justify' })
                ? 'bg-white text-black font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Full Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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

          {/* Numbered List */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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

        <div className="w-px h-5 bg-white/15 mx-0.5 hidden lg:block" />

        {/* GROUP 5: INSERT MEDIA, LINKS & TABLE */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
          {/* Hyperlink */}
          <Popover open={linkMenuOpen} onOpenChange={setLinkMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                className={`h-7 px-2 rounded-lg text-xs transition-all flex items-center gap-1 ${
                  editor.isActive('link')
                    ? 'bg-[#C6FF34] text-black shadow-md font-bold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
                title={editor.isActive('link') ? 'Edit Link' : 'Insert Link (Ctrl+K)'}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[10px] font-mono">Link</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.commands.focus();
              }}
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
                placeholder="https://example.com or /blog/..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:border-[#C6FF34] focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                {editor.isActive('link') ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
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
                    className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-[11px] font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleApplyLink}
                    className="px-3 py-1 rounded-lg bg-[#C6FF34] text-black hover:bg-[#b2eb2a] font-mono font-bold text-[11px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Inline Image Upload */}
          {onUploadImage && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onUploadImage}
              disabled={isUploadingImage}
              className="h-7 px-2 rounded-lg text-xs font-mono font-bold text-slate-200 hover:text-[#C6FF34] hover:bg-white/10 flex items-center gap-1 bg-[#C6FF34]/10 border border-[#C6FF34]/20 transition-colors"
              title="Upload Inline Article Image to Cloudinary CDN"
            >
              {isUploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6FF34]" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#C6FF34]" />
              )}
              <span className="hidden xl:inline text-[10px]">Image</span>
            </button>
          )}

          {/* External Image URL */}
          {onAddImageUrl && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onAddImageUrl}
              className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Insert Image by External URL"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Insert Table */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleTableToggle}
            className={`h-7 px-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
              editor.isActive('table')
                ? 'bg-[#C6FF34] text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Insert 3x3 Table Matrix"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[10px]">Table</span>
          </button>
        </div>

        <div className="w-px h-5 bg-white/15 mx-0.5 hidden xl:block" />

        {/* GROUP 6: REVIEWER COMMENT & UTILITIES */}
        <div className="flex items-center gap-0.5 bg-black/50 p-1 rounded-xl border border-white/10">
          {/* Reviewer Note */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertComment}
            className="h-7 px-2 rounded-lg bg-black/40 hover:bg-white/10 border border-white/10 text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
            title="Add Reviewer Note / Editorial Comment"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline font-mono">Note</span>
          </button>

          {/* Undo */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearFormatting}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
            title="Clear Formatting from Selection"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Manual Writer Live Keyboard Cheatsheet Strip */}
      {showCheatsheet && (
        <div className="px-3 py-1 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#C6FF34] font-bold flex items-center gap-1">
              <Keyboard className="w-3 h-3 text-[#C6FF34]" /> MANUAL WRITING HELPER:
            </span>
            <span>Type <code className="text-[#C6FF34] bg-white/5 px-1 py-0.2 rounded"># </code> + Space for H1 (36px)</span>
            <span className="text-slate-600">·</span>
            <span>Type <code className="text-sky-400 bg-white/5 px-1 py-0.2 rounded">## </code> + Space for H2 (28px)</span>
            <span className="text-slate-600">·</span>
            <span>Type <code className="text-purple-400 bg-white/5 px-1 py-0.2 rounded">### </code> + Space for H3 (22px)</span>
            <span className="text-slate-600">·</span>
            <span>Type <code className="text-amber-400 bg-white/5 px-1 py-0.2 rounded">&gt; </code> for Quote</span>
            <span className="text-slate-600">·</span>
            <span>Type <code className="text-emerald-400 bg-white/5 px-1 py-0.2 rounded">- </code> for List</span>
          </div>
          <button
            type="button"
            onClick={() => setShowCheatsheet(false)}
            className="text-slate-500 hover:text-slate-300 text-[9px] uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
