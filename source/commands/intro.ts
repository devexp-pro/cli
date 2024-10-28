import { Command } from "@cliffy/command";

const img = `
  \u001b[38;5;203;48;5;203m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;203;48;5;203m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;203;48;5;203m▄▄▄▄▄▄▄▄\u001b[38;5;209;48;5;203m▄▄\u001b[38;5;173;48;5;203m▄\u001b[38;5;131;48;5;203m▄\u001b[38;5;137;48;5;203m▄\u001b[38;5;187;48;5;203m▄\u001b[38;5;224;48;5;203m▄\u001b[38;5;254;48;5;203m▄\u001b[38;5;255;48;5;203m▄\u001b[38;5;217;48;5;203m▄\u001b[38;5;203;48;5;203m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;209;48;5;203m▄▄▄▄▄▄\u001b[38;5;216;48;5;203m▄\u001b[38;5;187;48;5;209m▄\u001b[38;5;230;48;5;137m▄\u001b[38;5;230;48;5;253m▄\u001b[38;5;230;48;5;230m▄\u001b[38;5;255;48;5;230m▄\u001b[38;5;251;48;5;230m▄\u001b[38;5;247;48;5;253m▄\u001b[38;5;248;48;5;255m▄\u001b[38;5;144;48;5;144m▄\u001b[38;5;239;48;5;8m▄\u001b[38;5;247;48;5;251m▄\u001b[38;5;252;48;5;138m▄\u001b[38;5;254;48;5;174m▄\u001b[38;5;181;48;5;173m▄\u001b[38;5;216;48;5;203m▄\u001b[38;5;167;48;5;203m▄\u001b[38;5;209;48;5;203m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;209;48;5;209m▄▄▄\u001b[38;5;217;48;5;209m▄\u001b[38;5;224;48;5;216m▄\u001b[38;5;230;48;5;223m▄\u001b[38;5;230;48;5;224m▄\u001b[38;5;188;48;5;255m▄\u001b[38;5;252;48;5;230m▄\u001b[38;5;255;48;5;230m▄\u001b[38;5;247;48;5;255m▄\u001b[38;5;243;48;5;255m▄\u001b[38;5;249;48;5;7m▄\u001b[38;5;152;48;5;248m▄\u001b[38;5;145;48;5;246m▄\u001b[38;5;238;48;5;243m▄\u001b[38;5;238;48;5;242m▄\u001b[38;5;245;48;5;247m▄\u001b[38;5;247;48;5;247m▄\u001b[38;5;251;48;5;247m▄\u001b[38;5;188;48;5;188m▄\u001b[38;5;246;48;5;246m▄\u001b[38;5;248;48;5;138m▄\u001b[38;5;243;48;5;167m▄\u001b[38;5;131;48;5;209m▄\u001b[38;5;209;48;5;209m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;210;48;5;209m▄\u001b[38;5;187;48;5;173m▄\u001b[38;5;230;48;5;181m▄\u001b[38;5;255;48;5;255m▄\u001b[38;5;247;48;5;230m▄\u001b[38;5;253;48;5;230m▄\u001b[38;5;102;48;5;254m▄\u001b[38;5;246;48;5;248m▄\u001b[38;5;102;48;5;247m▄\u001b[38;5;242;48;5;238m▄\u001b[38;5;238;48;5;254m▄\u001b[38;5;8;48;5;251m▄\u001b[38;5;187;48;5;243m▄\u001b[38;5;250;48;5;59m▄\u001b[38;5;249;48;5;252m▄\u001b[38;5;101;48;5;59m▄\u001b[38;5;243;48;5;251m▄\u001b[38;5;243;48;5;109m▄\u001b[38;5;246;48;5;247m▄\u001b[38;5;7;48;5;241m▄\u001b[38;5;250;48;5;103m▄\u001b[38;5;145;48;5;249m▄\u001b[38;5;247;48;5;237m▄\u001b[38;5;145;48;5;95m▄\u001b[38;5;180;48;5;174m▄\u001b[38;5;210;48;5;209m▄▄\u001b[38;5;209;48;5;209m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;230;48;5;187m▄\u001b[38;5;230;48;5;230m▄\u001b[38;5;255;48;5;255m▄\u001b[38;5;254;48;5;254m▄\u001b[38;5;254;48;5;245m▄\u001b[38;5;241;48;5;247m▄\u001b[38;5;242;48;5;248m▄\u001b[38;5;237;48;5;59m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;238;48;5;239m▄\u001b[38;5;60;48;5;145m▄\u001b[38;5;60;48;5;249m▄\u001b[38;5;66;48;5;246m▄\u001b[38;5;237;48;5;242m▄\u001b[38;5;238;48;5;240m▄\u001b[38;5;240;48;5;60m▄\u001b[38;5;103;48;5;247m▄\u001b[38;5;7;48;5;145m▄\u001b[38;5;248;48;5;7m▄\u001b[38;5;102;48;5;138m▄\u001b[38;5;246;48;5;8m▄▄\u001b[38;5;243;48;5;245m▄\u001b[38;5;249;48;5;251m▄\u001b[38;5;243;48;5;138m▄\u001b[38;5;95;48;5;180m▄\u001b[38;5;174;48;5;210m▄\u001b[38;5;173;48;5;210m▄\u001b[38;5;210;48;5;210m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[48;5;230m  \u001b[38;5;254;48;5;230m▄\u001b[38;5;187;48;5;187m▄\u001b[38;5;248;48;5;144m▄\u001b[38;5;255;48;5;181m▄\u001b[38;5;238;48;5;240m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;60;48;5;237m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;238;48;5;237m▄\u001b[38;5;237;48;5;239m▄\u001b[38;5;239;48;5;240m▄\u001b[38;5;101;48;5;249m▄\u001b[38;5;101;48;5;187m▄\u001b[38;5;247;48;5;247m▄\u001b[38;5;238;48;5;66m▄\u001b[38;5;8;48;5;109m▄\u001b[38;5;248;48;5;247m▄\u001b[38;5;241;48;5;8m▄\u001b[38;5;246;48;5;246m▄\u001b[38;5;250;48;5;247m▄\u001b[38;5;248;48;5;242m▄\u001b[38;5;8;48;5;95m▄\u001b[38;5;137;48;5;95m▄\u001b[38;5;174;48;5;174m▄\u001b[38;5;216;48;5;216m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;253;48;5;230m▄\u001b[38;5;251;48;5;255m▄\u001b[38;5;252;48;5;230m▄\u001b[38;5;251;48;5;230m▄\u001b[38;5;250;48;5;254m▄\u001b[38;5;7;48;5;249m▄\u001b[38;5;243;48;5;242m▄\u001b[38;5;8;48;5;237m▄\u001b[38;5;242;48;5;8m▄\u001b[38;5;248;48;5;240m▄\u001b[38;5;235;48;5;235m▄\u001b[38;5;239;48;5;60m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;237;48;5;239m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;60;48;5;23m▄\u001b[38;5;138;48;5;60m▄\u001b[38;5;174;48;5;239m▄\u001b[38;5;180;48;5;237m▄\u001b[38;5;180;48;5;247m▄\u001b[38;5;8;48;5;239m▄\u001b[38;5;242;48;5;247m▄\u001b[38;5;240;48;5;243m▄\u001b[38;5;242;48;5;246m▄\u001b[38;5;245;48;5;240m▄\u001b[38;5;245;48;5;138m▄\u001b[38;5;242;48;5;243m▄\u001b[38;5;138;48;5;138m▄\u001b[38;5;216;48;5;174m▄\u001b[38;5;216;48;5;216m▄▄▄▄▄▄▄▄▄▄\u001b[38;5;174;48;5;216m▄\u001b[38;5;210;48;5;216m▄▄\u001b[38;5;174;48;5;216m▄\u001b[38;5;216;48;5;216m▄▄▄\u001b[m
  \u001b[38;5;245;48;5;60m▄\u001b[38;5;59;48;5;242m▄\u001b[38;5;245;48;5;245m▄\u001b[38;5;66;48;5;246m▄\u001b[38;5;247;48;5;250m▄\u001b[38;5;245;48;5;247m▄\u001b[38;5;248;48;5;243m▄\u001b[38;5;243;48;5;102m▄\u001b[38;5;8;48;5;246m▄\u001b[38;5;8;48;5;8m▄\u001b[38;5;240;48;5;236m▄\u001b[38;5;145;48;5;66m▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;240;48;5;237m▄\u001b[38;5;237;48;5;23m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;60;48;5;60m▄\u001b[38;5;138;48;5;243m▄\u001b[38;5;216;48;5;180m▄\u001b[38;5;217;48;5;217m▄\u001b[38;5;217;48;5;216m▄\u001b[38;5;217;48;5;180m▄\u001b[38;5;217;48;5;137m▄\u001b[38;5;217;48;5;174m▄\u001b[38;5;217;48;5;138m▄\u001b[38;5;181;48;5;243m▄\u001b[38;5;242;48;5;247m▄\u001b[38;5;59;48;5;243m▄\u001b[38;5;180;48;5;95m▄\u001b[38;5;180;48;5;137m▄\u001b[38;5;216;48;5;216m▄\u001b[38;5;217;48;5;216m▄▄▄▄▄▄▄\u001b[38;5;216;48;5;216m▄\u001b[38;5;210;48;5;216m▄\u001b[38;5;167;48;5;210m▄\u001b[38;5;167;48;5;167m▄▄▄▄▄\u001b[38;5;167;48;5;216m▄\u001b[38;5;216;48;5;216m▄\u001b[m
  \u001b[38;5;144;48;5;8m▄\u001b[38;5;144;48;5;243m▄\u001b[38;5;145;48;5;8m▄\u001b[38;5;243;48;5;103m▄\u001b[38;5;242;48;5;59m▄\u001b[38;5;144;48;5;251m▄\u001b[38;5;240;48;5;144m▄\u001b[38;5;59;48;5;95m▄\u001b[38;5;240;48;5;145m▄\u001b[38;5;243;48;5;145m▄\u001b[38;5;8;48;5;247m▄\u001b[38;5;188;48;5;243m▄\u001b[38;5;8;48;5;239m▄\u001b[38;5;246;48;5;102m▄\u001b[38;5;239;48;5;102m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;60;48;5;60m▄\u001b[38;5;180;48;5;180m▄\u001b[38;5;216;48;5;217m▄\u001b[38;5;217;48;5;217m▄▄▄▄▄▄▄\u001b[38;5;180;48;5;137m▄\u001b[38;5;181;48;5;95m▄\u001b[38;5;217;48;5;217m▄▄▄▄▄▄▄▄▄▄\u001b[38;5;180;48;5;217m▄\u001b[38;5;167;48;5;209m▄\u001b[38;5;167;48;5;167m▄▄\u001b[48;5;167m  \u001b[38;5;167;48;5;167m▄▄▄\u001b[38;5;180;48;5;216m▄\u001b[m
  \u001b[38;5;246;48;5;247m▄\u001b[38;5;247;48;5;241m▄\u001b[38;5;243;48;5;239m▄\u001b[38;5;247;48;5;102m▄\u001b[38;5;247;48;5;8m▄\u001b[38;5;245;48;5;241m▄\u001b[38;5;248;48;5;239m▄\u001b[38;5;243;48;5;238m▄\u001b[38;5;239;48;5;239m▄\u001b[38;5;237;48;5;8m▄\u001b[38;5;238;48;5;109m▄\u001b[38;5;239;48;5;245m▄\u001b[38;5;102;48;5;245m▄\u001b[38;5;240;48;5;235m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;60;48;5;60m▄\u001b[38;5;243;48;5;138m▄\u001b[38;5;180;48;5;217m▄\u001b[38;5;180;48;5;180m▄\u001b[38;5;180;48;5;181m▄▄▄\u001b[38;5;180;48;5;180m▄\u001b[38;5;181;48;5;180m▄\u001b[38;5;101;48;5;180m▄\u001b[38;5;144;48;5;180m▄\u001b[38;5;138;48;5;180m▄\u001b[38;5;181;48;5;180m▄\u001b[38;5;180;48;5;181m▄▄▄▄▄▄▄▄▄\u001b[38;5;180;48;5;180m▄\u001b[38;5;174;48;5;167m▄\u001b[38;5;167;48;5;167m▄▄▄▄▄▄▄\u001b[38;5;180;48;5;180m▄\u001b[m
  \u001b[38;5;102;48;5;250m▄\u001b[38;5;243;48;5;250m▄\u001b[38;5;66;48;5;242m▄\u001b[38;5;237;48;5;239m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;243;48;5;242m▄\u001b[38;5;240;48;5;250m▄\u001b[38;5;242;48;5;249m▄\u001b[38;5;238;48;5;59m▄\u001b[38;5;60;48;5;23m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;235;48;5;237m▄\u001b[38;5;238;48;5;239m▄\u001b[38;5;236;48;5;235m▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;237;48;5;239m▄\u001b[38;5;60;48;5;242m▄\u001b[38;5;138;48;5;174m▄\u001b[38;5;174;48;5;174m▄▄▄▄▄\u001b[38;5;138;48;5;95m▄\u001b[38;5;240;48;5;237m▄\u001b[38;5;101;48;5;144m▄\u001b[38;5;174;48;5;174m▄\u001b[38;5;174;48;5;180m▄\u001b[38;5;174;48;5;174m▄▄▄▄▄▄▄▄▄▄▄\u001b[38;5;174;48;5;167m▄\u001b[38;5;167;48;5;167m▄\u001b[38;5;131;48;5;167m▄▄▄\u001b[38;5;138;48;5;167m▄\u001b[38;5;138;48;5;138m▄\u001b[38;5;174;48;5;180m▄\u001b[m
  \u001b[38;5;238;48;5;248m▄\u001b[38;5;60;48;5;102m▄\u001b[38;5;236;48;5;66m▄\u001b[38;5;60;48;5;239m▄\u001b[38;5;60;48;5;237m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;245;48;5;242m▄\u001b[38;5;237;48;5;8m▄\u001b[38;5;238;48;5;237m▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;236;48;5;235m▄\u001b[38;5;59;48;5;236m▄\u001b[38;5;230;48;5;235m▄\u001b[38;5;246;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;239;48;5;235m▄\u001b[38;5;60;48;5;236m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;60;48;5;96m▄\u001b[38;5;138;48;5;138m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;239;48;5;240m▄\u001b[38;5;23;48;5;239m▄\u001b[38;5;238;48;5;239m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;238;48;5;60m▄\u001b[38;5;239;48;5;237m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;236;48;5;236m▄▄\u001b[38;5;60;48;5;236m▄\u001b[38;5;249;48;5;239m▄\u001b[38;5;230;48;5;255m▄\u001b[38;5;230;48;5;230m▄\u001b[38;5;255;48;5;230m▄\u001b[38;5;7;48;5;230m▄\u001b[38;5;247;48;5;255m▄\u001b[38;5;255;48;5;250m▄\u001b[38;5;245;48;5;237m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;239;48;5;96m▄\u001b[38;5;96;48;5;132m▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[m
  \u001b[38;5;237;48;5;236m▄\u001b[38;5;236;48;5;237m▄▄\u001b[38;5;239;48;5;237m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;235;48;5;238m▄\u001b[38;5;8;48;5;238m▄\u001b[38;5;255;48;5;243m▄\u001b[38;5;230;48;5;253m▄\u001b[38;5;247;48;5;230m▄\u001b[38;5;254;48;5;230m▄\u001b[38;5;249;48;5;253m▄\u001b[38;5;250;48;5;250m▄\u001b[38;5;251;48;5;7m▄\u001b[38;5;246;48;5;243m▄\u001b[38;5;237;48;5;252m▄\u001b[38;5;250;48;5;188m▄\u001b[38;5;252;48;5;241m▄\u001b[38;5;243;48;5;236m▄\u001b[38;5;236;48;5;239m▄\u001b[38;5;237;48;5;96m▄\u001b[38;5;96;48;5;96m▄▄▄▄▄▄▄▄▄\u001b[38;5;242;48;5;96m▄\u001b[38;5;254;48;5;243m▄\u001b[38;5;251;48;5;241m▄\u001b[38;5;96;48;5;96m▄▄▄▄▄▄▄▄▄▄▄▄▄\u001b[38;5;241;48;5;96m▄\u001b[m
  \u001b[38;5;238;48;5;236m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;243;48;5;236m▄\u001b[38;5;254;48;5;239m▄\u001b[38;5;230;48;5;238m▄\u001b[38;5;255;48;5;8m▄\u001b[38;5;253;48;5;230m▄\u001b[38;5;254;48;5;7m▄\u001b[38;5;247;48;5;253m▄\u001b[38;5;247;48;5;145m▄\u001b[38;5;8;48;5;102m▄\u001b[38;5;246;48;5;251m▄\u001b[38;5;144;48;5;246m▄\u001b[38;5;8;48;5;247m▄\u001b[38;5;238;48;5;239m▄\u001b[38;5;247;48;5;249m▄\u001b[38;5;245;48;5;243m▄\u001b[38;5;243;48;5;248m▄\u001b[38;5;246;48;5;7m▄\u001b[38;5;243;48;5;253m▄\u001b[38;5;7;48;5;145m▄\u001b[38;5;252;48;5;59m▄\u001b[38;5;7;48;5;96m▄\u001b[38;5;96;48;5;96m▄\u001b[38;5;242;48;5;96m▄▄▄\u001b[38;5;240;48;5;96m▄\u001b[38;5;239;48;5;243m▄\u001b[38;5;243;48;5;241m▄\u001b[38;5;8;48;5;252m▄\u001b[38;5;248;48;5;249m▄\u001b[38;5;247;48;5;254m▄\u001b[38;5;245;48;5;249m▄\u001b[38;5;251;48;5;96m▄\u001b[38;5;246;48;5;96m▄\u001b[38;5;246;48;5;243m▄\u001b[38;5;60;48;5;96m▄\u001b[38;5;242;48;5;96m▄\u001b[38;5;60;48;5;96m▄\u001b[38;5;242;48;5;96m▄\u001b[38;5;243;48;5;96m▄\u001b[38;5;245;48;5;96m▄\u001b[38;5;245;48;5;243m▄\u001b[38;5;249;48;5;241m▄\u001b[38;5;247;48;5;249m▄\u001b[38;5;7;48;5;255m▄\u001b[m
  \u001b[38;5;255;48;5;246m▄\u001b[38;5;255;48;5;247m▄\u001b[38;5;152;48;5;248m▄\u001b[38;5;152;48;5;254m▄\u001b[38;5;252;48;5;230m▄▄\u001b[38;5;253;48;5;255m▄\u001b[38;5;248;48;5;7m▄\u001b[38;5;239;48;5;251m▄\u001b[38;5;247;48;5;248m▄\u001b[38;5;245;48;5;247m▄\u001b[38;5;245;48;5;243m▄\u001b[38;5;246;48;5;95m▄\u001b[38;5;246;48;5;101m▄\u001b[38;5;249;48;5;249m▄\u001b[38;5;247;48;5;243m▄\u001b[38;5;246;48;5;8m▄\u001b[38;5;245;48;5;242m▄\u001b[38;5;238;48;5;8m▄\u001b[38;5;238;48;5;246m▄\u001b[38;5;248;48;5;249m▄\u001b[38;5;252;48;5;7m▄\u001b[38;5;254;48;5;253m▄\u001b[38;5;253;48;5;253m▄\u001b[38;5;248;48;5;250m▄\u001b[38;5;248;48;5;242m▄\u001b[38;5;248;48;5;238m▄\u001b[38;5;109;48;5;237m▄\u001b[38;5;246;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;236;48;5;236m▄▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;60m▄\u001b[38;5;235;48;5;240m▄\u001b[38;5;236;48;5;239m▄\u001b[38;5;238;48;5;102m▄\u001b[38;5;249;48;5;103m▄\u001b[38;5;145;48;5;239m▄\u001b[38;5;145;48;5;238m▄\u001b[38;5;188;48;5;96m▄\u001b[38;5;255;48;5;247m▄\u001b[38;5;242;48;5;248m▄\u001b[38;5;241;48;5;254m▄\u001b[38;5;59;48;5;248m▄\u001b[38;5;8;48;5;8m▄\u001b[38;5;252;48;5;145m▄\u001b[38;5;109;48;5;60m▄\u001b[m
  \u001b[38;5;144;48;5;245m▄\u001b[38;5;245;48;5;8m▄\u001b[38;5;254;48;5;249m▄\u001b[38;5;250;48;5;250m▄\u001b[38;5;145;48;5;66m▄\u001b[38;5;103;48;5;238m▄\u001b[38;5;239;48;5;102m▄\u001b[38;5;240;48;5;250m▄\u001b[38;5;246;48;5;245m▄\u001b[38;5;251;48;5;252m▄\u001b[38;5;243;48;5;8m▄\u001b[38;5;101;48;5;241m▄\u001b[38;5;250;48;5;145m▄\u001b[38;5;144;48;5;243m▄\u001b[38;5;248;48;5;243m▄\u001b[38;5;247;48;5;248m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;239;48;5;238m▄\u001b[38;5;138;48;5;239m▄\u001b[38;5;138;48;5;59m▄\u001b[38;5;144;48;5;250m▄\u001b[38;5;247;48;5;252m▄\u001b[38;5;240;48;5;240m▄\u001b[38;5;236;48;5;60m▄\u001b[38;5;235;48;5;237m▄\u001b[38;5;17;48;5;238m▄\u001b[38;5;236;48;5;254m▄\u001b[38;5;252;48;5;103m▄\u001b[38;5;60;48;5;109m▄\u001b[38;5;109;48;5;251m▄\u001b[38;5;253;48;5;248m▄\u001b[38;5;255;48;5;247m▄\u001b[38;5;254;48;5;7m▄\u001b[38;5;255;48;5;252m▄\u001b[38;5;230;48;5;249m▄\u001b[38;5;255;48;5;249m▄\u001b[38;5;255;48;5;252m▄\u001b[38;5;230;48;5;255m▄▄\u001b[38;5;230;48;5;251m▄\u001b[38;5;255;48;5;8m▄\u001b[38;5;255;48;5;242m▄\u001b[38;5;250;48;5;243m▄\u001b[38;5;252;48;5;252m▄\u001b[38;5;255;48;5;251m▄\u001b[38;5;103;48;5;250m▄\u001b[38;5;236;48;5;7m▄\u001b[38;5;234;48;5;253m▄\u001b[m
  \u001b[38;5;145;48;5;249m▄\u001b[38;5;248;48;5;250m▄\u001b[38;5;246;48;5;248m▄\u001b[38;5;243;48;5;138m▄\u001b[38;5;248;48;5;243m▄\u001b[38;5;249;48;5;248m▄\u001b[38;5;247;48;5;7m▄\u001b[38;5;144;48;5;101m▄\u001b[38;5;101;48;5;243m▄\u001b[38;5;242;48;5;243m▄\u001b[38;5;240;48;5;235m▄\u001b[38;5;250;48;5;246m▄\u001b[38;5;243;48;5;247m▄\u001b[38;5;8;48;5;246m▄\u001b[38;5;243;48;5;245m▄\u001b[38;5;145;48;5;188m▄\u001b[38;5;59;48;5;243m▄\u001b[38;5;236;48;5;8m▄\u001b[38;5;239;48;5;246m▄\u001b[38;5;237;48;5;250m▄\u001b[38;5;60;48;5;246m▄\u001b[38;5;60;48;5;242m▄\u001b[38;5;247;48;5;145m▄\u001b[38;5;249;48;5;248m▄\u001b[38;5;248;48;5;237m▄\u001b[38;5;243;48;5;236m▄\u001b[38;5;234;48;5;235m▄\u001b[38;5;235;48;5;234m▄\u001b[38;5;235;48;5;238m▄\u001b[38;5;239;48;5;60m▄\u001b[38;5;238;48;5;103m▄\u001b[38;5;66;48;5;253m▄\u001b[38;5;7;48;5;253m▄\u001b[38;5;253;48;5;251m▄\u001b[38;5;247;48;5;252m▄\u001b[38;5;59;48;5;188m▄\u001b[38;5;103;48;5;252m▄\u001b[38;5;66;48;5;254m▄\u001b[38;5;251;48;5;254m▄\u001b[38;5;252;48;5;230m▄\u001b[38;5;246;48;5;254m▄\u001b[38;5;247;48;5;251m▄\u001b[38;5;247;48;5;7m▄\u001b[38;5;247;48;5;254m▄\u001b[38;5;66;48;5;252m▄\u001b[38;5;236;48;5;247m▄\u001b[38;5;236;48;5;246m▄\u001b[38;5;236;48;5;247m▄\u001b[m
  \u001b[38;5;238;48;5;240m▄\u001b[38;5;238;48;5;249m▄\u001b[38;5;236;48;5;242m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;237;48;5;241m▄\u001b[38;5;243;48;5;241m▄\u001b[38;5;59;48;5;138m▄\u001b[38;5;245;48;5;144m▄\u001b[38;5;109;48;5;8m▄\u001b[38;5;234;48;5;239m▄\u001b[38;5;245;48;5;248m▄\u001b[38;5;247;48;5;251m▄\u001b[38;5;252;48;5;102m▄\u001b[38;5;255;48;5;250m▄\u001b[38;5;187;48;5;101m▄\u001b[38;5;253;48;5;138m▄\u001b[38;5;247;48;5;239m▄\u001b[38;5;235;48;5;237m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;235;48;5;235m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;236;48;5;243m▄\u001b[38;5;238;48;5;251m▄\u001b[38;5;239;48;5;246m▄\u001b[38;5;248;48;5;245m▄\u001b[38;5;251;48;5;235m▄\u001b[38;5;247;48;5;239m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;235;48;5;60m▄\u001b[38;5;23;48;5;66m▄\u001b[38;5;239;48;5;251m▄\u001b[38;5;239;48;5;145m▄\u001b[38;5;248;48;5;237m▄\u001b[38;5;146;48;5;235m▄\u001b[38;5;235;48;5;66m▄\u001b[38;5;236;48;5;240m▄\u001b[38;5;238;48;5;60m▄\u001b[38;5;239;48;5;243m▄\u001b[38;5;235;48;5;235m▄\u001b[38;5;236;48;5;235m▄\u001b[38;5;234;48;5;235m▄\u001b[38;5;243;48;5;237m▄\u001b[38;5;251;48;5;240m▄\u001b[38;5;230;48;5;246m▄\u001b[m
  \u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;238m▄▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;236;48;5;8m▄\u001b[38;5;235;48;5;238m▄\u001b[38;5;236;48;5;241m▄\u001b[38;5;242;48;5;242m▄\u001b[38;5;239;48;5;241m▄\u001b[38;5;236;48;5;17m▄\u001b[38;5;235;48;5;235m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;60;48;5;103m▄\u001b[38;5;238;48;5;246m▄\u001b[38;5;251;48;5;254m▄\u001b[38;5;237;48;5;249m▄\u001b[38;5;146;48;5;251m▄\u001b[38;5;188;48;5;102m▄\u001b[38;5;246;48;5;237m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;235;48;5;235m▄\u001b[38;5;237;48;5;235m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;239m▄\u001b[38;5;235;48;5;23m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;237;48;5;240m▄\u001b[38;5;237;48;5;152m▄\u001b[38;5;240;48;5;240m▄\u001b[38;5;60;48;5;235m▄\u001b[38;5;109;48;5;235m▄▄\u001b[38;5;109;48;5;236m▄\u001b[38;5;245;48;5;236m▄\u001b[38;5;102;48;5;235m▄\u001b[38;5;8;48;5;17m▄▄\u001b[38;5;249;48;5;236m▄\u001b[38;5;255;48;5;236m▄▄\u001b[38;5;252;48;5;253m▄\u001b[38;5;188;48;5;230m▄\u001b[38;5;253;48;5;230m▄\u001b[38;5;247;48;5;255m▄\u001b[m
  \u001b[38;5;237;48;5;237m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;238;48;5;238m▄\u001b[38;5;237;48;5;238m▄\u001b[38;5;235;48;5;236m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;236m▄▄\u001b[38;5;237;48;5;242m▄\u001b[38;5;236;48;5;239m▄\u001b[38;5;239;48;5;241m▄\u001b[38;5;138;48;5;238m▄\u001b[38;5;102;48;5;239m▄\u001b[38;5;240;48;5;238m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;103;48;5;240m▄\u001b[38;5;236;48;5;239m▄\u001b[38;5;239;48;5;103m▄\u001b[38;5;240;48;5;103m▄\u001b[38;5;60;48;5;251m▄\u001b[38;5;247;48;5;242m▄\u001b[38;5;145;48;5;239m▄\u001b[38;5;246;48;5;238m▄\u001b[38;5;60;48;5;237m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;237;48;5;236m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;235;48;5;238m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;243;48;5;236m▄\u001b[38;5;246;48;5;236m▄\u001b[38;5;247;48;5;236m▄\u001b[38;5;246;48;5;236m▄\u001b[38;5;249;48;5;239m▄\u001b[38;5;255;48;5;8m▄\u001b[38;5;230;48;5;8m▄\u001b[38;5;230;48;5;247m▄\u001b[38;5;255;48;5;255m▄\u001b[38;5;248;48;5;7m▄\u001b[38;5;246;48;5;249m▄\u001b[38;5;102;48;5;246m▄\u001b[38;5;102;48;5;236m▄\u001b[38;5;246;48;5;235m▄\u001b[38;5;246;48;5;240m▄\u001b[38;5;247;48;5;248m▄\u001b[m
  \u001b[38;5;236;48;5;236m▄▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;236;48;5;236m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;23;48;5;17m▄\u001b[38;5;237;48;5;239m▄\u001b[38;5;236;48;5;59m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;239;48;5;236m▄\u001b[38;5;236;48;5;238m▄\u001b[38;5;236;48;5;237m▄\u001b[38;5;238;48;5;236m▄\u001b[38;5;237;48;5;237m▄\u001b[38;5;236;48;5;240m▄\u001b[38;5;239;48;5;23m▄\u001b[38;5;239;48;5;60m▄\u001b[38;5;236;48;5;66m▄▄\u001b[38;5;238;48;5;60m▄\u001b[38;5;246;48;5;60m▄\u001b[38;5;253;48;5;239m▄\u001b[38;5;255;48;5;242m▄\u001b[38;5;230;48;5;145m▄\u001b[38;5;230;48;5;250m▄\u001b[38;5;230;48;5;251m▄\u001b[38;5;230;48;5;254m▄\u001b[38;5;230;48;5;230m▄▄▄▄▄▄▄▄\u001b[38;5;255;48;5;230m▄\u001b[38;5;230;48;5;255m▄▄▄\u001b[38;5;230;48;5;230m▄▄▄\u001b[m
  `;

export const intro = new Command()
  .name("intro")
  .description("show system info")
  .hidden()
  .action(() => {
    console.log(img);
    Deno.exit();
  });
