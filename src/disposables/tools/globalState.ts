import * as vscode from "vscode";
import { SELECTED_LINES, SHOULD_SELECT_LINES } from "./tools.consts";

export interface IShouldSelectLines {
  initiatingDocuFile: string;
  activated: boolean;
  line: number;
  character: number;
}

export interface ISelectedLines {
  text: string;
  permalink: string;
  file: string;
  startLine: number;
  endLine: number;
}

export const getGlobalState = (context: vscode.ExtensionContext) => {
  const selectedLines =
    (context.globalState.get(SELECTED_LINES) as ISelectedLines) ||
    ({
      text: "",
      permalink: "",
      file: "",
      startLine: 0,
      endLine: 0,
    } as ISelectedLines);
  const shouldSelectLines =
    (context.globalState.get(SHOULD_SELECT_LINES) as IShouldSelectLines) ||
    ({
      initiatingDocuFile: "",
      activated: false,
      line: 0,
      character: 0,
    } as IShouldSelectLines);

  return {
    selectedLines,
    shouldSelectLines,
  };
};

export const updateSelectedLines = (
  context: vscode.ExtensionContext,
  selectedLines: false | ISelectedLines
) => {
  if (selectedLines === false) {
    selectedLines = {
      text: "",
      permalink: "",
      file: "",
      startLine: 0,
      endLine: 0,
    };
  }
  context.globalState.update(SELECTED_LINES, selectedLines);
};

export const updateShouldSelectLines = (
  context: vscode.ExtensionContext,
  shouldSelectLines: false | IShouldSelectLines
) => {
  if (shouldSelectLines === false) {
    shouldSelectLines = {
      initiatingDocuFile: "",
      activated: false,
      line: 0,
      character: 0,
    };
  }
  context.globalState.update(SHOULD_SELECT_LINES, shouldSelectLines);
};
