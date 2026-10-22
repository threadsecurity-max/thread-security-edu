'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CustomTextStyle, CustomHighlight } from './customExtensions';
import { TypingRibbon } from './TypingRibbon';
import { ContentBlocksPalette } from './ContentBlocksPalette';
import { ShortcutsHelpBar } from './ShortcutsHelpBar';
import {
  Table as TableIcon,
  Plus,
  Trash2,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useRef, useState } from 'react';

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  blogId?: string;
}

export function BlogEditor({
  content,
  onChange,
  placeholder = 'Start writing your cybersecurity research or editorial article...',
  blogId,
}: BlogEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      CustomTextStyle,
      CustomHighlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table border-collapse w-full my-6 text-sm text-left border border-white/20 rounded-xl overflow-hidden shadow-xl',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 border border-white/10 shadow-2xl mx-auto block',
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#C6FF34] underline font-medium hover:text-[#b2eb2a] transition-colors',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class:
          'tiptap prose prose-invert max-w-none focus:outline-none min-h-[460px] px-8 py-6 text-slate-200 text-base leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="w-full h-96 bg-[#121212] border border-white/10 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">
        Initializing Rich Text Blog Workspace...
      </div>
    );
  }

  const addImageByUrl = () => {
    const url = window.prompt('Enter Image URL (Direct CDN or HTTPS URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!blogId) {
      addImageByUrl();
      return;
    }

    const defaultAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const userAlt = window.prompt(
      'Enter Image Alt-Text (Descriptive label for Google Image Search & Screen Readers):',
      defaultAlt
    );
    const finalAlt = (userAlt !== null && userAlt.trim()) ? userAlt.trim() : defaultAlt;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', finalAlt);
      formData.append('caption', '');
      formData.append('isCover', 'false');

      const res = await fetch(`/api/mentor/blogs/${blogId}/media`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload inline image.');
      }

      if (data.media?.url) {
        editor.chain().focus().setImage({ src: data.media.url, alt: finalAlt }).run();
      }
    } catch (err: any) {
      console.error('Error uploading inline image:', err);
      alert(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (inlineFileInputRef.current) {
        inlineFileInputRef.current.value = '';
      }
    }
  };

  // Helper for current active node indicator
  const getActiveNodeLabel = () => {
    if (editor.isActive('heading', { level: 1 })) {
      return {
        label: 'Heading 1 (Major Section)',
        color: 'text-[#C6FF34] border-[#C6FF34]/30 bg-[#C6FF34]/10',
        dot: 'bg-[#C6FF34]',
      };
    }
    if (editor.isActive('heading', { level: 2 })) {
      return {
        label: 'Heading 2 (Sub-section Header)',
        color: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
        dot: 'bg-sky-400',
      };
    }
    if (editor.isActive('heading', { level: 3 })) {
      return {
        label: 'Heading 3 (Detail & Deep-dive)',
        color: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
        dot: 'bg-purple-400',
      };
    }
    if (editor.isActive('bulletList')) {
      return {
        label: 'Bullet List Item',
        color: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
        dot: 'bg-emerald-400',
      };
    }
    if (editor.isActive('orderedList')) {
      return {
        label: 'Numbered List Item',
        color: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
        dot: 'bg-amber-400',
      };
    }
    if (editor.isActive('blockquote')) {
      return {
        label: 'Blockquote / Highlighted Quote',
        color: 'text-[#C6FF34] border-[#C6FF34]/30 bg-[#C6FF34]/10',
        dot: 'bg-[#C6FF34]',
      };
    }
    if (editor.isActive('table')) {
      return {
        label: 'Academic Data Table Matrix',
        color: 'text-[#C6FF34] border-[#C6FF34]/30 bg-[#C6FF34]/10',
        dot: 'bg-[#C6FF34]',
      };
    }
    if (editor.isActive('codeBlock')) {
      return {
        label: 'Code Block Surface',
        color: 'text-emerald-300 border-emerald-300/30 bg-emerald-300/10',
        dot: 'bg-emerald-300',
      };
    }
    return {
      label: 'Normal Paragraph Body Text',
      color: 'text-slate-400 border-white/10 bg-white/5',
      dot: 'bg-slate-400',
    };
  };

  const activeNode = getActiveNodeLabel();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="w-full space-y-3">
        {/* Live Typing Shortcuts Ribbon & Markdown Cheatsheet */}
        <ShortcutsHelpBar />

        {/* Click-to-Type Structure Tools Palette */}
        <ContentBlocksPalette editor={editor} />

        {/* Floating Typing Ribbon (Bubble Menu on Text Selection while typing) */}
        {editor && (
          <BubbleMenu
            editor={editor}
            pluginKey="typingRibbonBubbleMenu"
            updateDelay={50}
            options={{
              strategy: 'fixed',
              placement: 'top-start',
              offset: 8,
              shift: {
                padding: 16,
              },
              flip: {
                fallbackPlacements: ['bottom-start', 'top-end', 'bottom-end'],
                padding: 16,
              },
            }}
            shouldShow={({ editor: currentEditor, from, to }) => {
              return from !== to && !currentEditor.isActive('image') && !currentEditor.isActive('table');
            }}
          >
            <TypingRibbon editor={editor} isFloating={true} />
          </BubbleMenu>
        )}

        {/* Main Editor Surface Card */}
        <div className="w-full bg-[#0c0c0e] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
          {/* Unified Sticky Master Typing Ribbon */}
          <div className="sticky top-0 z-30">
            <TypingRibbon
              editor={editor}
              isFloating={false}
              onUploadImage={() => inlineFileInputRef.current?.click()}
              onAddImageUrl={addImageByUrl}
              isUploadingImage={isUploadingImage}
            />
          </div>

          {/* Hidden file input for inline images */}
          <input
            ref={inlineFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInlineImageUpload}
            className="hidden"
          />

        {/* Dynamic Table Manipulation Toolbar (Visible when cursor is inside any table cell) */}
        {editor.isActive('table') && (
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-[#18181c] border-b border-[#C6FF34]/30 text-white select-none text-xs font-mono animate-in fade-in duration-200">
            <span className="text-[11px] font-bold uppercase text-[#C6FF34] flex items-center gap-1.5 mr-1">
              <TableIcon className="w-3.5 h-3.5 text-[#C6FF34]" />
              TABLE CONTROLS:
            </span>

            {/* Column actions */}
            <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Add Column Before"
              >
                <Plus className="w-3 h-3 mr-1 text-[#C6FF34]" /> Col Left
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Add Column After"
              >
                <Plus className="w-3 h-3 mr-1 text-[#C6FF34]" /> Col Right
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="h-7 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                title="Delete Current Column"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Del Col
              </Button>
            </div>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Row actions */}
            <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Add Row Above"
              >
                <Plus className="w-3 h-3 mr-1 text-sky-400" /> Row Above
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Add Row Below"
              >
                <Plus className="w-3 h-3 mr-1 text-sky-400" /> Row Below
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="h-7 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                title="Delete Current Row"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Del Row
              </Button>
            </div>

            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Cell merge / split & header toggle */}
            <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().mergeOrSplit().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Merge or Split Cells"
              >
                Merge / Split
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className="h-7 px-2 text-[11px] text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Toggle Header Row"
              >
                Header Row
              </Button>
            </div>

            {/* Delete entire table */}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="ml-auto h-7 px-2.5 text-[11px] text-rose-400 hover:text-white hover:bg-rose-600/30 border border-rose-500/30 rounded-lg cursor-pointer"
              title="Delete Entire Table"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Remove Table
            </Button>
          </div>
        )}

        {/* Live Block Hierarchy & Cursor Position Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#111113] border-b border-white/5 text-[11px] font-mono select-none">
          {/* Active Node Pill */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">CURRENT BLOCK:</span>
            <div className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 font-bold transition-all ${activeNode.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeNode.dot} animate-pulse`} />
              <span>{activeNode.label}</span>
            </div>
          </div>

          {/* Live Word Count & Reading Time Meter */}
          {(() => {
            const editorText = editor ? editor.getText() : '';
            const currentWordCount = editorText.trim() ? editorText.trim().split(/\s+/).filter(Boolean).length : 0;
            const currentReadingMinutes = Math.max(1, Math.ceil(currentWordCount / 200));

            return (
              <div className="flex items-center gap-2">
                <div
                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                    currentWordCount >= 1500
                      ? 'bg-[#C6FF34]/15 border-[#C6FF34]/30 text-[#C6FF34]'
                      : currentWordCount >= 300
                      ? 'bg-sky-400/15 border-sky-400/30 text-sky-400'
                      : 'bg-amber-400/15 border-amber-400/30 text-amber-400'
                  }`}
                >
                  <span>{currentWordCount.toLocaleString()} words</span>
                  <span>·</span>
                  <span>{currentReadingMinutes} min read</span>
                  {currentWordCount >= 1500 ? (
                    <span className="hidden sm:inline-flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#C6FF34]" /> Pillar Post
                    </span>
                  ) : currentWordCount < 300 ? (
                    <span className="hidden sm:inline">Short Draft</span>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* Heading Structure Guide for Faculty */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-400">
            <span className="text-slate-500 uppercase tracking-wider font-bold">OUTLINE GUIDE:</span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#C6FF34]" /> H1 Major
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> H2 Sub
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> H3 Detail
            </span>
          </div>
        </div>

        {/* Editor Surface */}
        <div className="bg-[#09090b] min-h-[480px] cursor-text" onClick={() => editor.chain().focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
