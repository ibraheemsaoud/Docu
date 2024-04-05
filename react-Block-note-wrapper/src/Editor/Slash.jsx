import { commandsCtx, themeManagerCtx } from "@milkdown/core";
import {
  slashPlugin,
  slash,
  createDropdownItem,
  defaultActions
} from "@milkdown/plugin-slash";

export default slash.configure(slashPlugin, {
  config: (ctx) => {
    // Define a status builder
    return ({ isTopLevel, content, parentNode }) => {
      if (!content || content[0] !== "/") {
        return {};
      }

      // You can only show something at root level
      if (!isTopLevel) return null;

      const userInput = content.slice(1).toLocaleLowerCase();
      const actions = defaultActions(ctx, userInput || '');
      const customActions = [
        {
          id: "test",
          // third param is the icon
          dom: createDropdownItem(ctx.get(themeManagerCtx), "Test", "h3"),
          command: () =>
            ctx.get(commandsCtx).call('TurnIntoHeading', 1),
          keyword: ["test"],
          typeName: "test"
        }
      ]

      customActions.forEach(action => {
        if (content === "/" || action.keyword.some(keyword => keyword.includes(userInput))) {
          actions.push(action);
        }
      });

      return { actions }
    };
  }
});
