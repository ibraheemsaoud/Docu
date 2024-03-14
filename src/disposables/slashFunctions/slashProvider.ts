import * as vscode from "vscode";
import { BACK_SLASH_CODE_SNIPPET, slashType } from "./slash.const";
import {
  updateSelectedLines,
  updateShouldSelectLines,
} from "../tools/globalState";

export class SlashProvider implements vscode.CompletionItemProvider {
  private context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const options = [
      {
        label: "Code Snippet",
        insertText: BACK_SLASH_CODE_SNIPPET,
        type: slashType.LinkToCode,
      },
    ];
    return options.map((option) => {
      const completionItem = new vscode.CompletionItem(
        option.label,
        vscode.CompletionItemKind.Function
      );
      if (option.type === slashType.LinkToCode) {
        completionItem.detail = "Select snippet from other code files";

        updateSelectedLines(this.context, false);
        updateShouldSelectLines(this.context, {
          initiatingDocuFile: document.fileName,
          activated: true,
          line: position.line,
          character: position.character,
        });
      }

      const insertText = new vscode.SnippetString(option.insertText);
      completionItem.insertText = insertText;
      completionItem.range = new vscode.Range(position, position);

      return completionItem;
    });
  }
}
