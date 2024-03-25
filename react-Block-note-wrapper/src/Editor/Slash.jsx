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
      // You can only show something at root level
      if (!isTopLevel) return null;

      // Empty content ? Set your custom empty placeholder !
      if (!content) {
        return {};
      }

      // Define the placeholder & actions (dropdown items) you want to display depending on content
      if (content.startsWith("/")) {
        // Add some actions depending on your content's parent node
        // if (parentNode.type.name === "customNode") {
        //   actions.push({
        //     id: "custom",
        //     dom: createDropdownItem(ctx.get(), "Custom", "h1"),
        //     command: () =>
        //       ctx.get().call(/* Add custom command here */),
        //     keyword: ["custom"],
        //     typeName: "heading"
        //   });
        // }

        return content === "/"
          ? { actions: defaultActions(ctx) }
          : {
            actions: defaultActions(ctx, content.slice(1).toLocaleLowerCase())
          };
      }
    };
  }
});
