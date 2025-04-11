import { colors } from "@std/colors";

export const logo = `
  ${colors.rgb24("██████╗ ███████╗██╗   ██╗", 0xFFA500)}${
  colors.magenta("███████╗██╗  ██╗██████╗")
}
  ${colors.rgb24("██╔══██╗██╔════╝██║   ██║", 0xFFA500)}${
  colors.magenta("██╔════╝╚██╗██╔╝██╔══██╗")
}
  ${colors.rgb24("██║  ██║█████╗  ██║   ██║", 0xFFA500)}${
  colors.magenta("█████╗   ╚███╔╝ ██████╔╝")
}
  ${colors.rgb24("██║  ██║██╔══╝  ╚██╗ ██╔╝", 0xFFA500)}${
  colors.magenta("██╔══╝   ██╔██╗ ██╔═══╝")
}
  ${colors.rgb24("██████╔╝███████╗ ╚████╔╝ ", 0xFFA500)}${
  colors.magenta("███████╗██╔╝ ██╗██║")
}
  ${colors.rgb24("╚═════╝ ╚══════╝  ╚═══╝  ", 0xFFA500)}${
  colors.magenta("╚══════╝╚═╝  ╚═╝╚═╝")
}`;

const r = colors.red;
const b = colors.blue;
const g = colors.green;
const y = colors.yellow;
const d = colors.reset;
export const logo2 = y(`
        ,~~.
   ,   (  - )${r(">")}    ${g("Crafted with")} ${r("<3")} ${
  b("https://devexp.pro")
}
   )\`~~'   (      ${g('Use "dx -h" to get help on commands.')}
  (  .__)   )
   \`-.____,'      ${colors.rgb24("Dev", 0xFFA500)}${colors.magenta("Exp")}
`);

export const introText = `  Crafted with ${colors.red("<3")} ${
  colors.blue("https://devexp.pro")
}
  Use "dx -h" to get help on commands.
`;
