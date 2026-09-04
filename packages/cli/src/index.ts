import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { listCommand } from "./commands/list.js";
import { interactiveCommand } from "./commands/interactive.js";
import type { AgentTarget } from "./types.js";

const program = new Command();

program
  .name("skills")
  .description("Gerenciador e instalador de skills para assistentes de IA via npx")
  .version("0.1.0");

program
  .command("add [skills...]")
  .description("Instala uma ou mais skills no ambiente desejado")
  .option("-t, --target <agent>", "Assistente de destino (antigravity, claude, local)", "antigravity")
  .option("-p, --path <path>", "Caminho de diretório customizado para instalação")
  .option("-g, --global", "Instala globalmente no diretório do usuário (padrão)", true)
  .option("--no-global", "Instala no escopo local do projeto")
  .option("-y, --yes", "Pula confirmações de sobrescrita interativa", false)
  .option("-a, --all", "Instala todas as skills disponíveis no repositório", false)
  .action(async (skills: string[], options) => {
    await addCommand(skills, {
      target: options.target as AgentTarget,
      path: options.path,
      global: options.global,
      yes: options.yes,
      all: options.all
    });
  });

program
  .command("list")
  .description("Lista todas as skills disponíveis no catálogo oficial")
  .action(async () => {
    await listCommand();
  });

// Se nenhum argumento for passado, executa o modo interativo
if (process.argv.length <= 2) {
  await interactiveCommand();
} else {
  program.parse();
}
