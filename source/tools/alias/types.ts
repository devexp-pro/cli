export type AliasEntry = {
  command: string;
  favorite?: boolean;
  usage?: string[];
};

export type Aliases = Record<string, AliasEntry>;
