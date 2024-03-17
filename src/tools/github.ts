import * as vscode from "vscode";
import * as cp from "child_process";
import * as url from "url";

export const getCurrentFileGitHubPermalink = () => {
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
};
