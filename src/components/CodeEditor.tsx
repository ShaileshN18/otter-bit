"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, readOnly = false }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      defaultLanguage="javascript"
      value={code}
      theme="vs-dark"
      onChange={onChange}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        readOnly: readOnly
      }}
    />
  );
}
