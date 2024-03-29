import * as vscode from "vscode";

export function isDocuFile(editor?: vscode.TextEditor): boolean {
  if (!editor) {
    return false;
  }
  const document = editor.document;
  return (
    document.languageId === "docu" || document.fileName.endsWith(".docu.md")
  );
}

export const docuSelector: vscode.DocumentSelector = { language: '*', scheme: 'file', pattern: '**/*.docu.md' };
