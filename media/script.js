// @ts-check

// @ts-ignore
const vscode = acquireVsCodeApi();

// Script run within the webview itself.
(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  const contentContainer =
    document.querySelector(".content") || document.createElement("div");

  /**
   * Render the document in the webview.
   */
  function updateContent(/** @type {string} */ text) {
    if (!text) {
      text = "";
    }
    text = text.replace(/<LinkToVSCodeHeader(.*?)>([\s\S]*?)<\/LinkToVSCodeHeader>/g, "");

    contentContainer.innerHTML = "";

    const LinkBackToVSCodeButtons = [];
    let LinkBackToVSCodeId = 1;

    let lines = text.split("\n");
    let allowEdit = true;

    lines = lines.map((line) => {
      const matchStartLTVSC = line.match(
        /<LinkToVSCode path="([^"]+)" line="([^"]+)">/
      );
      const matchEndLTVSC = line.match(/<\/LinkToVSCode>/);
      if (matchStartLTVSC) {
        allowEdit = false;
        const path = matchStartLTVSC[1];
        const line = matchStartLTVSC[2];
        let linkToVsCode = `<LinkToVSCode path="${path}" line="${line}">`;
        linkToVsCode += `<LinkToVSCodeHeader>${path} - Line: ${line}`;
        linkToVsCode += `<button id="${LinkBackToVSCodeId}" class="action">Go to code</button>`;
        linkToVsCode += `</LinkToVSCodeHeader>`;
        LinkBackToVSCodeButtons.push({ id: LinkBackToVSCodeId, path, line });
        LinkBackToVSCodeId++;
        return linkToVsCode;
      } else if (matchEndLTVSC) {
        allowEdit = true;
        return line;
      } else {
        if (!allowEdit) {
          return line;
        }
        return `<div class="markdown" contenteditable="true">${line}</div>`;
      }
    });

    contentContainer.innerHTML = lines.join("\n");

    for (const button of LinkBackToVSCodeButtons) {
      // @ts-ignore
      document.getElementById(`${button.id}`).addEventListener("click", () => {
        vscode.postMessage({
          type: "goToVsCode",
          fileName: button.path,
          lineNumber: button.line,
        });
      });
    }
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        updateContent(message.text);
        vscode.setState({ text: message.text });
        return;
    }
  });

  // @ts-ignore
  contentContainer.addEventListener("input", (event) => {
    vscode.postMessage({
      type: "edit",
      text: contentContainer.innerHTML,
    });
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
