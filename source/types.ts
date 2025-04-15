import { Command } from "@cliffy/command";

export type SessionData = {
  key: string;
  email: string;
  id: string;
  username: string;
};

export type DxTool = {
  tool: Command;
};
