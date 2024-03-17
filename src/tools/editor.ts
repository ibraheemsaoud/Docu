import * as vscode from "vscode";

export const getTextBetweenLines = (startLine: number, endLine: number) => {
  const startOfLine = new vscode.Position(startLine, 0);
  const endOfLine = new vscode.Position(
    endLine,
    vscode.window.activeTextEditor?.document.lineAt(endLine).text.length || 0
  );

  return (
    vscode.window.activeTextEditor?.document.getText(
      new vscode.Range(startOfLine, endOfLine)
    ) || ""
  );
};
