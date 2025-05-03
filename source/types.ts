import { Command } from "@cliffy/command";

export type SessionData = {
  key: string;
  email: string;
  id: string;
  username: string;
};

export type SpotlightItem = {
  tag: string;
  name: string;
  stringForSearch?: string;
  description: string;
  handler?: () => Promise<any>;
};

export type DxAction = {
  name: string;
  description: string;
  handler: (args: any, options?: any) => Promise<any>;
};

export type DxTool = {
  tool: Command<any, any, any, any, any, any, any, any>;
  spotlight?: Array<SpotlightItem>;
};
