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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          class: 'rounded-xl max-w-full my-6 border border-white/10 shadow-xl mx-auto block',
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
          'tiptap prose prose-invert max-w-none focus:outline-none min-h-[420px] px-6 py-5 text-slate-200 text-base leading-relaxed',
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
    const url = window.prompt('Enter link URL (e.g. https://threadsecurity.in):', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));
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
        editor.chain().focus().setImage({ src: data.media.url, alt: data.media.altText || file.name }).run();
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

  return (
    <div className="w-full bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Hidden file input for inline images */}
      <input
        ref={inlineFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInlineImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#141414] border-b border-white/10 sticky top-0 z-10 text-white select-none">
        {/* Basic Text Formatting */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('bold')
              ? 'bg-[#C6FF34] text-black font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('italic')
              ? 'bg-[#C6FF34] text-black font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('underline')
              ? 'bg-[#C6FF34] text-black font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('strike')
              ? 'bg-[#C6FF34] text-black font-bold shadow'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Headings Hierarchy (H1, H2, H3) */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-[#C6FF34] text-black shadow-md ring-1 ring-[#C6FF34]'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
          title="Heading 1 (Main Section Title)"
        >
          <Heading1 className="w-4 h-4 mr-1 text-[#C6FF34] group-active:text-black" /> H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#C6FF34] text-black shadow-md ring-1 ring-[#C6FF34]'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
          title="Heading 2 (Sub-section Header)"
        >
          <Heading2 className="w-4 h-4 mr-1 text-sky-400" /> H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-8 px-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#C6FF34] text-black shadow-md ring-1 ring-[#C6FF34]'
              : 'text-slate-200 hover:text-white hover:bg-white/10'
          }`}
          title="Heading 3 (Minor Topic Header)"
        >
          <Heading3 className="w-4 h-4 mr-1 text-purple-400" /> H3
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Text Alignment Controls */}
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
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
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
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
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
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
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
          title="Align Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Lists & Blocks */}
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
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
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
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-[#C6FF34] text-black font-bold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`h-8 w-8 p-0 rounded-lg transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-[#C6FF34] text-black font-bold'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Links & Media */}
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
          title="Insert / Edit Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        {/* Upload Inline Image directly to Cloudinary CDN */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => inlineFileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="h-8 px-2 rounded-lg text-xs font-mono font-bold text-slate-200 hover:text-[#C6FF34] hover:bg-white/10 flex items-center gap-1.5"
          title="Upload image from device to article body"
        >
          {isUploadingImage ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C6FF34]" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-[#C6FF34]" />
          )}
          <span>Upload Image</span>
        </Button>

        {/* Insert Image via URL */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addImageByUrl}
          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          title="Insert image by web URL"
        >
          <ImageIcon className="w-3.5 h-3.5" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Undo / Redo */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>

        {/* Uploading Status Indicator */}
        {isUploadingImage && (
          <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-[#C6FF34] bg-[#C6FF34]/10 px-2.5 py-1 rounded-lg border border-[#C6FF34]/20 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Optimizing & Uploading to CDN...</span>
          </div>
        )}
      </div>

      {/* Editor Surface */}
      <div className="bg-[#0a0a0a] min-h-[460px] cursor-text" onClick={() => editor.chain().focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
