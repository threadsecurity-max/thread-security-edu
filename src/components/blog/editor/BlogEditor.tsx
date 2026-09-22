'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface BlogEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function BlogEditor({ content, onChange, placeholder = 'Start writing your cybersecurity research or editorial article...' }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-6 border border-white/10 shadow-xl mx-auto',
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
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[420px] px-6 py-4 text-slate-200 text-base leading-relaxed',
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
    const url = window.prompt('Enter link URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="w-full bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2.5 bg-[#141414] border-b border-white/10 sticky top-0 z-10 text-white select-none">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('bold') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('italic') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('underline') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('strike') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-8 px-2 rounded-lg text-xs font-mono ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
        >
          <Heading1 className="w-4 h-4 mr-1" /> H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-8 px-2 rounded-lg text-xs font-mono ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
        >
          <Heading2 className="w-4 h-4 mr-1" /> H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-8 px-2 rounded-lg text-xs font-mono ${editor.isActive('heading', { level: 3 }) ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
        >
          <Heading3 className="w-4 h-4 mr-1" /> H3
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('bulletList') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('orderedList') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('blockquote') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('codeBlock') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Code Block"
        >
          <Code2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={setLink}
          className={`h-8 w-8 p-0 rounded-lg ${editor.isActive('link') ? 'bg-white text-black font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={addImage}
          className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-5 bg-white/10 mx-1" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
          title="Undo"
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
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Surface */}
      <div className="bg-[#0a0a0a] min-h-[450px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
