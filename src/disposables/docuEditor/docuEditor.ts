import * as vscode from "vscode";
import { getNonce } from "./util";
// import { Marked } from "marked";
// import { markedHighlight } from "marked-highlight";
// @ts-ignore
import * as hljs from "./highlight.min.js";
import * as path from "path";
// @ts-ignore
import index from "../../../media/main";

/**
 * Provider for docu Markdown editors.
 */
export class docuEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new docuEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      "docu.docuDisplay",
      provider
    );
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Called when our custom editor is opened.
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // const marked = new Marked(
    //   //@ts-ignore
    //   markedHighlight({
    //     langPrefix: "hljs language-",
    //     highlight(code, lang, info) {
    //       //@ts-ignore
    //       const language = hljs.getLanguage(lang)?.name || "plaintext";
    //       //@ts-ignore
    //       return hljs.highlight(code, { language }).value;
    //     },
    //   })
    // );

    function updateWebview(firstTime?: boolean) {
      webviewPanel.webview.postMessage({
        type: firstTime ? "init" : "update",
        text: document.getText(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case "readyToListen":
          updateWebview(true);
          return;
        case "goToVsCode":
          this.goToVsCode(e.fileName, e.lineNumber);
          return;
        case "edit":
          this.updateTextDocument(document, e.text);
          return;
      }
    });

    updateWebview();
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.js")
    );
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "styles.css")
    );
    const styleMain = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "main.css")
    );

    const styleCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "atom-one-light.min.css"
      )
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleCodeUri}" rel="stylesheet" />
				<link href="${styleMain}" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" />
      
				<title>Docu-ment</title>
			</head>
			<body id="root">
			</body>
      <script nonce="${nonce}" src="${scriptUri}"></script>
			</html>`;
  }

  private goToVsCode(fileName: string, lineNumber?: number) {
    if (vscode.workspace.workspaceFolders?.length) {
      const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const absolutePath = path.resolve(workspaceRoot, fileName);

      const uri = vscode.Uri.file(absolutePath);
      vscode.window.showTextDocument(uri).then((editor) => {
        if (lineNumber) {
          const line = lineNumber - 1;
          const range = editor.document.lineAt(line).range;
          editor.selection = new vscode.Selection(range.start, range.end);
          editor.revealRange(range);
        }
      });
    }
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, text: string) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      text
    );

    return vscode.workspace.applyEdit(edit);
  }
}
