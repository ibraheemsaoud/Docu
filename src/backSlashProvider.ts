import * as vscode from "vscode";

export enum LinkType {
  Code,
  File,
}

export class BackSlashProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const linePrefix = document
      .lineAt(position)
      .text.substring(0, position.character)
      .trim();
    if (linePrefix === "/") {
      const codeCompletionItem = new vscode.CompletionItem(
        "Link to Code",
        vscode.CompletionItemKind.Function
      );
      codeCompletionItem.command = {
        command: "myExtension.handleSelection",
        title: "Link to Code",
        arguments: [LinkType.Code],
      };

      const fileCompletionItem = new vscode.CompletionItem(
        "Link to File",
        vscode.CompletionItemKind.File
      );
      fileCompletionItem.command = {
        command: "myExtension.handleSelection",
        title: "Link to File",
        arguments: [LinkType.File],
      };

      return [codeCompletionItem, fileCompletionItem];
    }
    return undefined;
  }
}
