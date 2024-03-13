import * as vscode from "vscode";

export async function generateMarkdownFile(editor: vscode.TextEditor) {
  const document = editor.document;
  // remove the extention from the file name:
  const oldFileName = document.fileName.replace(/\.[^/.]+$/, "");
  const newFileName = `${oldFileName}.md`;
  const destinationUri = vscode.Uri.file(newFileName);

  await vscode.workspace.fs.copy(document.uri, destinationUri, {
    overwrite: true,
  });
  vscode.window.showInformationMessage(
    `Markdown file generated: ${destinationUri.fsPath}`
  );
}
