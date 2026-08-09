"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface EditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const BTN_BASE =
  "px-2 py-1 text-sm rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-40";

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: placeholder ?? "请输入内容…",
      }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // 外部值变化时同步编辑器内容（如切换编辑对象）
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("输入链接地址");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const addImage = () => {
    const url = window.prompt("输入图片地址");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const isActive = editor.isActive.bind(editor);

  return (
    <div className="border rounded-lg bg-white">
      <div className="flex flex-wrap gap-1.5 border-b p-2">
        <button
          type="button"
          className={`${BTN_BASE} font-bold ${isActive("bold") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={`${BTN_BASE} italic ${isActive("italic") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={`${BTN_BASE} line-through ${isActive("strike") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          S
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("heading", { level: 2 }) ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("heading", { level: 3 }) ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("bulletList") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          列表
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("orderedList") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          编号
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("blockquote") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          引用
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("codeBlock") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          代码
        </button>
        <button
          type="button"
          className={`${BTN_BASE} ${isActive("link") ? "bg-blue-100 border-blue-300" : ""}`}
          onClick={addLink}
        >
          链接
        </button>
        <button type="button" className={BTN_BASE} onClick={addImage}>
          图片
        </button>
        <button
          type="button"
          className={BTN_BASE}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          撤销
        </button>
        <button
          type="button"
          className={BTN_BASE}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          重做
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose-cms [&_.tiptap]:min-h-[300px] [&_.tiptap]:p-4 [&_.tiptap:focus]:outline-none [&_.tiptap_.is-editor-empty]:text-gray-400"
      />
    </div>
  );
}
