// @ts-check

// @ts-ignore
const vscode = acquireVsCodeApi();

// Script run within the webview itself.
(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  // @ts-ignore
  // const vscode = acquireVsCodeApi();

  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  const contentContainer =
    document.querySelector(".content") || document.createElement("div");

  /**
   * Render the document in the webview.
   */
  function updateContent(/** @type {string} */ text) {
    if (!text) {
      text = "";
    }

    errorContainer.style.display = "none";

    // the text comes in MD format + some custom tags
    // like <LinkToVSCode path="/src/screens/Profile/Profile.tsx" line="22">
    // and that should generate a button that when clicked will open the file in vscode
    // but the normal text should be appeneded

    // @ts-ignore
    window.vscode = vscode;
    // @ts-ignore
    window.goToVsCode = function (path, line) {
      // @ts-ignore
      window.vscode.postMessage({
        type: "goToVsCode",
        fileName: path,
        lineNumber: line,
      });
    };

    contentContainer.innerHTML = "";

    let lines = text.split("\n");
    lines = lines.map((line) => {
      const matches = line.match(
        /<LinkToVSCode path="([^"]+)" line="([^"]+)" \/>/
      );
      if (matches) {
        const path = matches[1];
        const line = matches[2];
        // vscode.postMessage({
        //   type: "goToVsCode",
        //   fileName: path,
        //   lineNumber: line,
        // });

        const button = `<button id="1">${path}</button>`;
        contentContainer.innerHTML += button;
        return button;
      } else {
        return line;
      }
    });

    contentContainer.innerHTML = lines.join("\n");

    // @ts-ignore
    document.getElementById(`1`).addEventListener('click', () => {
      vscode.postMessage({
        type: "goToVsCode",
        fileName: document.getElementById(`1`)?.innerText,
      });
    });
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    switch (message.type) {
      case "update":
        const text = message.text;

        // Update our webview's content
        updateContent(text);

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text });

        return;
    }
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state.text);
  }
})();
