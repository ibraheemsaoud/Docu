import * as vscode from "vscode";

const slashType = {
  LinkToCode: "Type 1",
  C: "Type 2",
};

export class SlashProvider implements vscode.CompletionItemProvider {
  private context: vscode.ExtensionContext;
  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const options = [
      {
        label: "Option 1",
        insertText: "Text for Option 1",
        type: slashType.LinkToCode,
      },
      { label: "Option 2", insertText: "Text for Option 2", type: slashType.C },
    ];
    return options.map((option) => {
      const completionItem = new vscode.CompletionItem(
        option.label,
        vscode.CompletionItemKind.Function
      );
      if (option.type === slashType.LinkToCode) {
        completionItem.detail = "Link to code";
      }
      const insertText = new vscode.SnippetString(option.insertText);
      completionItem.insertText = insertText;
      completionItem.range = new vscode.Range(position, position);
      // completionItem.insertTextFormat = vscode.InsertTextFormat.Snippet;
      this.context.globalState.update("shouldSelectLines", true);
      return completionItem;
    });
  }
}
