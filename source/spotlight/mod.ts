import { DxTool } from "$/types";
import { autocompleteInput } from "$/providers/tui/autocompleteInput.ts";

const init = (tools: Array<DxTool>): any => {
  const spotlights: any = [];

  for (const tool of tools) {
    if (tool.spotlight) {
      spotlights.push(...tool.spotlight);
    }
  }

  return async () => {
    const autocompletes = spotlights.map((s: any, index: number) => {
      return {
        name: s.name,
        description: s.description,
        stringForSearch: s.stringForSearch || s.name,
        prefix: `[${s.tag}] `,
        value: index,
      };
    });

    const res = await autocompleteInput(
      autocompletes,
      {
        pageSize: 10,
        searchPrompt: "dx:",
      },
    );

    await spotlights[res.value]?.handler();
  };
};

export default {
  init,
};
