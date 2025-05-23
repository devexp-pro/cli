import { Command } from "@cliffy/command";
import { config } from "$/providers/config.ts";
import { tool } from "npm/@lmstudio/sdk";
import { Input } from "@cliffy/prompt/input";

const services: {
  [name: string]: {
    description: string;
    hidden: boolean;
    handler: (request: string) => Promise<void>;
  };
} = {
  "cht": {
    description: "UNIX/Linux commands cheat sheets (http://cheat.sh)",
    hidden: false,
    handler: async (request: string) => {
      console.log(
        await (await fetch(`http://cheat.sh/${request}`, {
          headers: {
            "User-Agent": "curl/7.81.0",
          },
        })).text(),
      );
    },
  },

  "rate": {
    description: "Exploring (crypto)currencies exchange rates (http://rate.sx)",
    hidden: false,
    handler: async (request: string | undefined) => {
      let prompt = request;
      if (prompt == undefined) {
        prompt = await Input.prompt(`Type currency pair (e.g. BTC/USD):`);
      }

      console.log(
        await (await fetch(`https://rate.sx/${prompt}`, {
          headers: {
            "User-Agent": "curl/7.81.0",
          },
        })).text(),
      );
    },
  },

  "wttr": {
    description: "Check the weather (https://wttr.in)",
    hidden: false,
    handler: async (request: string = "") => {
      console.log(
        await (await fetch(`https://wttr.in/${request}`, {
          headers: {
            "User-Agent": "curl/7.81.0",
          },
        })).text(),
      );
    },
  },

  "ifc": { // curl ifconfig.io/all
    description: "What is my ip address? (https://ifconfig.io)",
    hidden: false,
    handler: async (request: string = "all") => {
      console.log(
        await (await fetch(`https://ifconfig.io/${request}`, {
          headers: {
            "User-Agent": "curl/7.81.0",
          },
        })).text(),
      );
    },
  },
};

const spotlight = [];

for (const [name, service] of Object.entries(services)) {
  spotlight.push({
    tag: "its",
    name: `${name}`,
    stringForSearch: `integration ${name}`,
    description: service.description,
    handler: service["handler"],
  });
}

const cmd = new Command();
if (config.data.integrations.hidden) cmd.hidden();
cmd
  .name("integrations")
  .alias("is")
  .usage("(or 't') [service_name] [request?]")
  .arguments("[service_name:string] [request:string]")
  .description("Interface for accessing web services running in the terminal")
  .action(async (options: any, ...args: any) => {
    if (args.length == 0 && Object.keys(options).length == 0) {
      cmd.showHelp();
      console.log("Terminal services:");
      for (const [name, service] of Object.entries(services)) {
        console.log(`  ${name} - ${service.description}`);
      }
      console.log();
      Deno.exit();
    }

    const [service_name, request] = args;

    if (!(service_name in services)) {
      console.log(`Service '${service_name}' not found =(`);
      Deno.exit();
    } else {
      await services[service_name].handler(request);
    }

    Deno.exit();
  });

export default {
  tool: cmd,
  spotlight,
};
