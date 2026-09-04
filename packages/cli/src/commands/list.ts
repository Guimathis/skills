import pc from "picocolors";
import { fetchCatalog } from "../utils/github.js";

export async function listCommand(): Promise<void> {
  console.log(pc.bold("\n📦 Skills disponíveis em @guimathis/skills:\n"));

  try {
    const catalog = await fetchCatalog();

    for (const item of catalog) {
      console.log(`  ${pc.cyan(pc.bold(item.name))}`);
      console.log(`    ${pc.dim(item.description)}`);
      if (item.version) {
        console.log(`    ${pc.gray(`v${item.version}`)}`);
      }
      console.log();
    }

    console.log(
      pc.gray(
        `Para instalar, use: ${pc.cyan("npx @guimathis/skills add <nome>")} ou execute ${pc.cyan("npx @guimathis/skills")} para o menu interativo.\n`
      )
    );
  } catch (error: any) {
    console.error(pc.red(`✖ Erro ao listar skills: ${error.message}`));
    process.exit(1);
  }
}
