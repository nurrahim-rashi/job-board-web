import { useEffect, useRef } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

type ToolbarButton = {
  label: string;
  title: string;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const toolbarButtons: ToolbarButton[] = [
  {
    label: "B",
    title: "Bold",
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: "I",
    title: "Italic",
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: "S",
    title: "Strikethrough",
    isActive: (editor) => editor.isActive("strike"),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    label: "H2",
    title: "Heading",
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "H3",
    title: "Subheading",
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
    run: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "•",
    title: "Bullet list",
    isActive: (editor) => editor.isActive("bulletList"),
    run: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: "1.",
    title: "Numbered list",
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "❝",
    title: "Quote",
    isActive: (editor) => editor.isActive("blockquote"),
    run: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
];

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

/**
 * A minimal WYSIWYG editor that behaves like a `<textarea>` for FormData
 * purposes: it keeps a hidden `<input name>` in sync with editor.getHTML()
 * so an uncontrolled `<form onSubmit>` can read it via `form.get(name)`,
 * unchanged from the plain-textarea version this replaces.
 */
export function RichTextEditor({ name, defaultValue = "", placeholder }: RichTextEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "rich-text-editor-content" },
    },
    onUpdate: ({ editor }) => {
      if (hiddenInputRef.current) hiddenInputRef.current.value = editor.getHTML();
    },
  });

  // Keep the hidden input correct even if the editor mounts after the form
  // already read its defaultValue (e.g. company data arriving after mount).
  useEffect(() => {
    if (editor && hiddenInputRef.current) hiddenInputRef.current.value = editor.getHTML();
  }, [editor]);

  function setLink(editor: Editor) {
    const existing = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", existing ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor-toolbar" role="toolbar" aria-label="Formatting">
        {editor &&
          toolbarButtons.map((button) => (
            <button
              key={button.title}
              type="button"
              title={button.title}
              aria-label={button.title}
              aria-pressed={button.isActive(editor)}
              className={button.isActive(editor) ? "is-active" : ""}
              onClick={() => button.run(editor)}
            >
              {button.label}
            </button>
          ))}
        {editor && (
          <button
            type="button"
            title="Link"
            aria-label="Link"
            aria-pressed={editor.isActive("link")}
            className={editor.isActive("link") ? "is-active" : ""}
            onClick={() => setLink(editor)}
          >
            🔗
          </button>
        )}
      </div>
      <EditorContent editor={editor} />
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue} />
    </div>
  );
}
