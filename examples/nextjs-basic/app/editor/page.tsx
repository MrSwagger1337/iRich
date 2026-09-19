'use client';

import React, { useEffect, useState } from 'react';
import {
  createEditor,
  type EditorInstance,
  type IRichDocument,
} from '@irich/core';
import { IRichProvider } from '@irich/react';
import { createNextjsRegistry } from '../components/definitions';
import { initialNextjsDocument } from '../components/sample-document';
import { initialArabicDocument } from '../components/sample-document-arabic';
import { EditorStudio } from '../../editor/EditorStudio';

export default function EditorPage() {
  const [currentFixture, setCurrentFixture] = useState<'english' | 'arabic'>('english');
  const [editor, setEditor] = useState<EditorInstance | null>(null);

  useEffect(() => {
    const registry = createNextjsRegistry();
    let initialDoc: IRichDocument =
      currentFixture === 'arabic' ? initialArabicDocument : initialNextjsDocument;

    const storageKey = `irich_nextjs_demo_doc_${currentFixture}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.root && parsed.version) {
          initialDoc = parsed;
        }
      }
    } catch {
      // fallback to initial sample
    }

    const ed = createEditor({
      registry,
      initialDocument: initialDoc,
    });

    setEditor(ed);

    return () => {
      ed.destroy();
    };
  }, [currentFixture]);

  if (!editor) {
    return (
      <div className="irich-editor-loading">
        <div className="irich-spinner" />
        <p>Loading iRich Editor Studio...</p>
      </div>
    );
  }

  return (
    <IRichProvider editor={editor}>
      <EditorStudio
        currentFixture={currentFixture}
        onSwitchFixture={(fix) => setCurrentFixture(fix)}
      />
    </IRichProvider>
  );
}

