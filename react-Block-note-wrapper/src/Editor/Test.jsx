import { $node, $remark, $command } from '@milkdown/utils';
import directive from 'remark-directive';
import { blockquoteSchema } from '@milkdown/preset-commonmark';
import { wrapIn } from '@milkdown/prose/commands';
import { InputRule } from '@milkdown/prose/inputrules';
import { commandsCtx } from '@milkdown/core';
import { useNodeViewContext } from "@prosemirror-adapter/react"

export const Blockquote = () => {
  const { contentRef } = useNodeViewContext()

  return <blockquote className="bg-amber-50 p-0.5 rounded !border !border-slate-200" ref={contentRef} />
}

const wrapInBlockquoteCommand = $command('WrapInBlockquote',
  (ctx) => () => {
    wrapIn(blockquoteSchema.type(ctx))
  });

const remarkDirective = $remark(() => directive)
const directiveNode = $node('IOP', () => ({
  group: 'block',
  atom: true,
  isolating: true,
  marks: '',
  attrs: {
    src: { default: null },
  },
  parseDOM: [{
    tag: 'IOP',
    getAttrs: (dom) => ({
      src: dom.getAttribute('src'),
    }),
  }],
  toDOM: (node) => ['IOP', { ...node.attrs, 'contenteditable': false }, 0],
  parseMarkdown: {
    match: (node) => node.type === 'leafDirective' && node.name === 'IOP',
    runner: (state, node, type) => {
      state.addNode(type, { src: (node.attributes).src });
    },
  },
  toMarkdown: {
    match: (node) => node.type.name === 'IOP',
    runner: (state, node) => {
      state.addNode('leafDirective', undefined, undefined, {
        name: 'IOP',
        attributes: { src: node.attrs.src },
      });
    },
  }
}))

// const inputRule = $inputRule(
//   (ctx) => new InputRule(
//     /::IOP\{src\="(?<src>[^"]+)?"?\}/,
//     (state, match, start, end) => {
//       const [okay, src = ''] = match;
//       const { tr } = state;
//       console.log(plugin);
//       console.log(directiveNode)
//       if (okay) {
//         tr.replaceWith(start - 1, end, directiveNode.type().create({ src }));
//       }
//       return tr;
//     }))

export const test = [remarkDirective, directiveNode] // , inputRule]

// ::IOP{src="text"
