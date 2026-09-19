'use client';

/**
 * @irich/rich-text
 * React hook for managing headless rich-text editor instance via Tiptap.
 */

import { useEffect, useMemo } from 'react';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import type { IRichTextController, RichTextDocument, UseIRichTextOptions } from './types';
import { createEmptyRichText, ensureRichTextDocument } from './utils';

/**
 * Creates and coordinates a rich-text controller instance wrapping Tiptap under the hood.
 */
export function useIRichText({
  content,
  editable = true,
  dir,
  lang,
  onChange,
  onFocus,
  onBlur,
  autoFocus = false,
}: UseIRichTextOptions = {}): {
  editor: Editor | null;
  controller: IRichTextController;
} {
  const initialAst = useMemo(() => ensureRichTextDocument(content), []);

  const editor = useEditor({
    editorProps: {
      attributes: {
        ...(dir ? { dir } : {}),
        ...(lang ? { lang } : {}),
      },
    },
    extensions: [
      StarterKit.configure({
        link: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'irich-rich-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: initialAst as unknown as Record<string, unknown>,
    editable,
    autofocus: autoFocus ? 'end' : false,
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      const json = activeEditor.getJSON() as RichTextDocument;
      onChange?.(json);
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  // Synchronize external editable changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Synchronize external direction and language changes
  useEffect(() => {
    if (editor && editor.view?.dom) {
      if (dir) {
        editor.view.dom.setAttribute('dir', dir);
      } else {
        editor.view.dom.removeAttribute('dir');
      }
      if (lang) {
        editor.view.dom.setAttribute('lang', lang);
      } else {
        editor.view.dom.removeAttribute('lang');
      }
    }
  }, [editor, dir, lang]);

  // Construct stable, decoupled controller interface
  const controller: IRichTextController = useMemo(() => {
    return {
      isEditable: Boolean(editor?.isEditable),

      isActive: (name: string, attrs?: Record<string, unknown>) => {
        if (!editor) return false;
        return attrs ? editor.isActive(name, attrs) : editor.isActive(name);
      },

      canUndo: () => Boolean(editor?.can().undo()),
      canRedo: () => Boolean(editor?.can().redo()),

      toggleBold: () => {
        editor?.chain().focus().toggleBold().run();
      },

      toggleItalic: () => {
        editor?.chain().focus().toggleItalic().run();
      },

      toggleStrike: () => {
        editor?.chain().focus().toggleStrike().run();
      },

      toggleCode: () => {
        editor?.chain().focus().toggleCode().run();
      },

      toggleBlockquote: () => {
        editor?.chain().focus().toggleBlockquote().run();
      },

      toggleHeading: (level: 1 | 2 | 3 | 4 | 5 | 6) => {
        editor?.chain().focus().toggleHeading({ level }).run();
      },

      setParagraph: () => {
        editor?.chain().focus().setParagraph().run();
      },

      toggleBulletList: () => {
        editor?.chain().focus().toggleBulletList().run();
      },

      toggleOrderedList: () => {
        editor?.chain().focus().toggleOrderedList().run();
      },

      setLink: (url: string) => {
        if (!url) {
          editor?.chain().focus().unsetLink().run();
          return;
        }
        editor?.chain().focus().setLink({ href: url }).run();
      },

      unsetLink: () => {
        editor?.chain().focus().unsetLink().run();
      },

      undo: () => {
        editor?.chain().focus().undo().run();
      },

      redo: () => {
        editor?.chain().focus().redo().run();
      },

      setContent: (newContent: RichTextDocument | string) => {
        const normalized = ensureRichTextDocument(newContent);
        editor?.commands.setContent(normalized as unknown as Record<string, unknown>);
      },

      getJSON: () => {
        return (editor?.getJSON() as RichTextDocument) ?? createEmptyRichText();
      },

      getPlainText: () => {
        return editor?.getText() ?? '';
      },

      focus: () => {
        editor?.commands.focus();
      },

      blur: () => {
        editor?.commands.blur();
      },
    };
  }, [editor]);

  return {
    editor,
    controller,
  };
}
