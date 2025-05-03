import { DxTool } from "$/types";
import { toolCommand } from "./commands.ts";
import { spotlight } from "./spotlight.ts";

const dxTool: DxTool = {
  spotlight,
  tool: toolCommand,
};

export default dxTool;
