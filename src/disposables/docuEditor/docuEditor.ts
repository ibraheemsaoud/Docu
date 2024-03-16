import * as vscode from "vscode";
import { getNonce } from "./util";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import * as hljs from "./highlight.min";
import * as path from "path";

/**
 * Provider for docu Markdown editors.
 */
export class docuEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new docuEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      docuEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  private static readonly viewType = "docu.docuDisplay";

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

    const marked = new Marked(
      //@ts-ignore
      markedHighlight({
        langPrefix: "hljs language-",
        highlight(code, lang, info) {
          //@ts-ignore
          const language = hljs.getLanguage(lang)?.name || "plaintext";
          //@ts-ignore
          return hljs.highlight(code, { language }).value;
        },
      })
    );

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: marked.parse(document.getText()).toString(),
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
        case "goToVsCode":
          this.goToVsCode(e.fileName, e.lineNumber);
          return;
        case "edit":
          console.log(e.text);
          // this.updateTextDocument(document, e.text);
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
      vscode.Uri.joinPath(this.context.extensionUri, "media", "script.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "styles.css")
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

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleCodeUri}" rel="stylesheet" />

				<title>Docu-ment</title>
			</head>
			<body class="content" contenteditable="true">				
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
