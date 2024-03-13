import * as vscode from "vscode";
import * as cp from "child_process";
import * as url from "url";

export const textSelectionDisposable = (context: vscode.ExtensionContext) => {
  return vscode.window.onDidChangeTextEditorSelection(async (event) => {
    const selection = event.selections;

    if (context.globalState.get("shouldSelectLines") !== true) {
      return;
    }

    // once text is selected, we should generate a permalink to it (on github)
    if (selection.length > 0) {
      const start = selection[0].start.line;
      const end = selection[0].end.line;

      const selectedText = vscode.window.activeTextEditor?.document.getText(
        new vscode.Range(selection[0].start, selection[0].end)
      );

      const permalink = await getCurrentFileGitHubPermalink();

      console.log("selectedText", selectedText);
      console.log("permalink", `${permalink}#L${start + 1}-L${end + 1}`);

      context.globalState.update("selectedText", selectedText);
      if (start === end) {
        context.globalState.update("permalink", `${permalink}#L${start + 1}`);
      } else {
        context.globalState.update(
          "permalink",
          `${permalink}#L${start + 1}-L${end + 1}`
        );
      }
      // return [selectedText, `${permalink}#L${start}-L${end}`];
    }
    // return [undefined, undefined];
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
