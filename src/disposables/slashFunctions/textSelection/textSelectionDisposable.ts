import * as vscode from "vscode";
import * as cp from "child_process";
import * as url from "url";
import {
  ISelectedLines,
  getGlobalState,
  updateSelectedLines,
} from "../../tools/globalState";

export const textSelectionDisposable = (context: vscode.ExtensionContext) => {
  return vscode.window.onDidChangeTextEditorSelection(async (event) => {
    const shouldSelectLines = getGlobalState(context).shouldSelectLines;

    if (
      // not active
      shouldSelectLines.activated !== true ||
      // is on the file that initiated the selection
      shouldSelectLines.initiatingDocuFile ===
        vscode.window.activeTextEditor?.document.fileName
    ) {
      return;
    }

    const selection = event.selections;

    // once text is selected, we should generate a permalink to it (on github)
    if (selection.length > 0) {
      const startOfLine = new vscode.Position(selection[0].start.line, 0);
      const endOfLine = new vscode.Position(
        selection[0].end.line,
        vscode.window.activeTextEditor?.document.lineAt(selection[0].end.line)
          .text.length || 0
      );
      const start = selection[0].start.line;
      const end = selection[0].end.line;

      const selectedText =
        vscode.window.activeTextEditor?.document.getText(
          new vscode.Range(startOfLine, endOfLine)
        ) || "";

      const permalink = await getCurrentFileGitHubPermalink();
      const selectedLines: ISelectedLines = {
        text: selectedText,
        permalink: permalink || "",
        file: vscode.window.activeTextEditor?.document.fileName || "",
        startLine: start,
        endLine: end,
      };

      if (start === end) {
        selectedLines.permalink = `${permalink}#L${start + 1}`;
      } else {
        selectedLines.permalink = `${permalink}#L${start + 1}-L${end + 1}`;
      }

      updateSelectedLines(context, selectedLines);
    }
  });
};

async function getCurrentFileGitHubPermalink() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor");
    return;
  }

  const doc = editor.document;
  const filePath = doc.uri.fsPath;
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(doc.uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("Could not determine the workspace folder");
    return;
  }
  const repoRoot = workspaceFolder.uri.fsPath;

  const gitOutput = cp
    .execSync(`git -C "${repoRoot}" config --get remote.origin.url`)
    .toString()
    .trim();

  const gitUrlParsed = url.parse(gitOutput);
  if (gitUrlParsed?.pathname) {
    let [username, repoName] = gitUrlParsed?.pathname?.split("/").slice(1);
    repoName = repoName?.replace(/\.git$/, "");
    const commitSha = cp
      .execSync(`git -C "${repoRoot}" rev-parse HEAD`)
      .toString()
      .trim();

    const filePathRelativeToRepo = filePath.substring(repoRoot.length + 1);
    const githubFileUrl = `https://github.com/${username}/${repoName}/blob/${commitSha}/${encodeURIComponent(
      filePathRelativeToRepo
    )}`;

    return githubFileUrl;
  }
}
