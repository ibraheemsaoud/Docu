import { insertOrUpdateBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";

import { RiAlertFill } from "react-icons/ri";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { MdInfo } from "react-icons/md";
import "./styles.css";

// The BlockQuote block.
export const BlockQuote = createReactBlockSpec(
  {
    type: "blockquote",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "blockquote",
        values: ["blockquote"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div className={"blockquote"}>
          <div className={"blockquote-icon-wrapper"} contentEditable={false}>
            <MdInfo className={"blockquote-icon"} size={32} />
          </div>
          {/*Rich text field for user to type in*/}
          <div className={"inline-content"} ref={props.contentRef} />
        </div>
      );
    },
  }
);

// Slash menu item to insert an blockquote block
export const insertBlockQuote = (editor) => ({
  title: "blockquote",
  onItemClick: () => {
    insertOrUpdateBlock(editor, {
      type: "blockquote",
    });
  },
  aliases: [
    "blockquote",
    "quote",
    "info",
    "info panel",
    "highlight",
    "important",
  ],
  group: "Other",
  icon: <RiAlertFill />,
});

export const normalizeBlockQuoteBlock = (blocks) => {
  return blocks.map((block) => {
    if (block.type === "blockquote") {
      const content = block.content;
      // if content has two empty lines after each other, delete one
      let newContent = content;
      if (newContent.length > 0) {
        newContent[0].text = "[BLOCKQUOTE]" + newContent[0].text;
      }
      return {
        ...block,
        type: "paragraph",
        props: {
          ...block.props,
          type: undefined,
        },
        content: newContent,
      };
    }
    return block;
  });
};

export const markdownedBlocksToBlockBlockQuote = (blocks) => {
  return blocks.map((block) => {
    if (
      block.type !== "paragraph" ||
      block.content.length === 0 ||
      !block.content[0].text.startsWith("[BLOCKQUOTE]")
    ) {
      return block;
    }
    const content = block.content;
    content[0].text = content[0].text.slice(12);
    return {
      ...block,
      type: "blockquote",
      props: {
        ...block.props,
        type: "blockquote",
      },
      content,
    };
  });
};

export const swapMarkdownForBlockQuote = (markdown) => {
  // replace escaped and unescaped > with [BLOCKQUOTE]
  return markdown.replace(/\\>/g, "[BLOCKQUOTE]").replace(/>/g, "[BLOCKQUOTE]");
};

export const fixMarkdownForBlockQuote = (markdown) => {
  return markdown.replace(/\\\[BLOCKQUOTE\]/g, ">").replace(/\[BLOCKQUOTE\]/g, ">");
};
