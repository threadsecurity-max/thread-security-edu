'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
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
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Code2,
  Loader2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. https://threadsecurity.in):', previousUrl || 'https://');
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === '' || trimmed === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    // Clean link URL to prevent unclosed quotes or illegal characters from breaking JSON payloads
    const cleanUrl = trimmed.replace(/["'<>\\]/g, '');
    editor.chain().focus().extendMarkRange('link').setLink({ href: cleanUrl }).run();
  };

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
      <div className="w-full bg-[#0c0c0e] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all">
        {/* Hidden file input for inline images */}
        <input
          ref={inlineFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInlineImageUpload}
          className="hidden"
        />

        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-[#141416] border-b border-white/10 sticky top-0 z-20 text-white select-none backdrop-blur-md">
          {/* Basic Text Formatting */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-all ${
                    editor.isActive('bold')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-md shadow-[#C6FF34]/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bold className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Bold (Ctrl+B)</p>
                <p className="text-[11px] text-slate-400">Emphasize key terms or metrics</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-all ${
                    editor.isActive('italic')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-md shadow-[#C6FF34]/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Italic (Ctrl+I)</p>
                <p className="text-[11px] text-slate-400">Latin terms, book titles, or nuances</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-all ${
                    editor.isActive('underline')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-md shadow-[#C6FF34]/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <UnderlineIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Underline (Ctrl+U)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-all ${
                    editor.isActive('strike')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-md shadow-[#C6FF34]/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Strikethrough className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Strikethrough</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Headings Hierarchy (H1, H2, H3) — Color Coded & High Contrast */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    editor.isActive('heading', { level: 1 })
                      ? 'bg-[#C6FF34] text-black shadow-md shadow-[#C6FF34]/30 ring-1 ring-[#C6FF34]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-[#C6FF34]/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#C6FF34] shrink-0" />
                  <Heading1 className="w-3.5 h-3.5" /> H1
                </Button>
              </TooltipTrigger>
              <TooltipContent className="space-y-1">
                <p className="font-bold text-[#C6FF34] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C6FF34]" /> Heading 1 — Major Topic Divider
                </p>
                <p className="text-[11px] text-slate-300">
                  Use for main subject breaks (e.g. <span className="text-white italic">"1. Threat Landscape Overview"</span>).
                </p>
                <p className="text-[10px] text-slate-400">
                  💡 Best practice: 2–4 per article for clear Google outline structure.
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    editor.isActive('heading', { level: 2 })
                      ? 'bg-sky-400 text-black shadow-md shadow-sky-400/30 ring-1 ring-sky-400'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-sky-400/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <Heading2 className="w-3.5 h-3.5" /> H2
                </Button>
              </TooltipTrigger>
              <TooltipContent className="space-y-1">
                <p className="font-bold text-sky-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Heading 2 — Sub-section Header
                </p>
                <p className="text-[11px] text-slate-300">
                  Nest under H1 to break down specific themes (e.g. <span className="text-white italic">"Attack Vectors"</span>, <span className="text-white italic">"Detection Mechanisms"</span>).
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    editor.isActive('heading', { level: 3 })
                      ? 'bg-purple-400 text-black shadow-md shadow-purple-400/30 ring-1 ring-purple-400'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 border border-purple-400/20'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <Heading3 className="w-3.5 h-3.5" /> H3
                </Button>
              </TooltipTrigger>
              <TooltipContent className="space-y-1">
                <p className="font-bold text-purple-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Heading 3 — Detail & Deep-Dive
                </p>
                <p className="text-[11px] text-slate-300">
                  Nest under H2 for granular items (e.g. <span className="text-white italic">"CVE-2024-XXXX Walkthrough"</span>, <span className="text-white italic">"Tool Comparison Table"</span>).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Text Alignment */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive({ textAlign: 'left' })
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Align Left (Default)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive({ textAlign: 'center' })
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Align Center</p>
                <p className="text-[11px] text-slate-400">Best for figures, callouts & section dividers</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive({ textAlign: 'right' })
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Align Right</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive({ textAlign: 'justify' })
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <AlignJustify className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Full Justify</p>
                <p className="text-[11px] text-slate-400">Even margins across both edges</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Lists & Quotes */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive('bulletList')
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Bullet List</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive('orderedList')
                      ? 'bg-white text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Numbered List</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive('blockquote')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Quote className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Blockquote Highlight</p>
                <p className="text-[11px] text-slate-400">Callouts, expert quotes, key takeaways</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive('codeBlock')
                      ? 'bg-[#C6FF34] text-black font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Code Block Surface</p>
                <p className="text-[11px] text-slate-400">Terminal snippets, Python, Bash commands</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Links & Cloudinary Upload */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={setLink}
                  className={`h-8 w-8 p-0 rounded-lg transition-colors ${
                    editor.isActive('link')
                      ? 'bg-[#C6FF34] text-black font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Insert / Edit Hyperlink</p>
                <p className="text-[11px] text-slate-400">Add external references or internal course links</p>
              </TooltipContent>
            </Tooltip>

            {/* Direct Device Upload to Cloudinary CDN */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => inlineFileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="h-8 px-2.5 rounded-lg text-xs font-mono font-bold text-slate-200 hover:text-[#C6FF34] hover:bg-white/10 flex items-center gap-1.5 bg-[#C6FF34]/10 border border-[#C6FF34]/20"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6FF34]" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-[#C6FF34]" />
                  )}
                  <span>Upload Image</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-[#C6FF34]">Inline Article Image Upload</p>
                <p className="text-[11px] text-slate-300">Uploads directly to Cloudinary CDN with WebP/AVIF auto-compression</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={addImageByUrl}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Insert Image via External URL</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-5 bg-white/10 mx-0.5" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-black/40 p-1 rounded-xl border border-white/5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold">Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Uploading Status Indicator */}
          {isUploadingImage && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-[#C6FF34] bg-[#C6FF34]/15 px-3 py-1 rounded-xl border border-[#C6FF34]/30 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Optimizing (WebP/AVIF) & Uploading...</span>
            </div>
          )}
        </div>

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
                    <span className="hidden sm:inline">✓ Pillar Post</span>
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
            <span className="text-slate-600">›</span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> H2 Sub
            </span>
            <span className="text-slate-600">›</span>
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
    </TooltipProvider>
  );
}
