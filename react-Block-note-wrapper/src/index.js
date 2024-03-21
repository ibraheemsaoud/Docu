import React from "react";
import ReactDOM from "react-dom"; // Import the createRoot function from react-dom
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  console.warn("Root element is not empty. Clearing it before rendering the app.");
  rootElement.innerHTML = "";
}
createRoot(rootElement);
ReactDOM.createRoot(rootElement).render(<App />);

