import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import type { InstallOptions } from "../types.js";
import { fetchCatalog, downloadSkills } from "../utils/github.js";
import { resolveTargetDir, skillExists } from "../utils/paths.js";

export async function addCommand(
  skillArgs: string[],
  options: InstallOptions
): Promise<void> {
  try {
    const s = p.spinner();
    s.start("Consultando catálogo de skills...");

    const catalog = await fetchCatalog();
    s.stop("Catálogo carregado com sucesso.");

    let skillsToInstall: string[] = [];

    if (options.all) {
      skillsToInstall = catalog.map((item) => item.name);
    } else {
      if (!skillArgs || skillArgs.length === 0) {
        p.log.error(
          `Nenhuma skill informada. Use ${pc.cyan("skills add <nome>")} ou execute ${pc.cyan("skills")} para o menu interativo.`
        );
        process.exit(1);
      }

      // Validar se todas as skills passadas existem no catálogo
      const catalogNames = new Set(catalog.map((i) => i.name));
      const invalid = skillArgs.filter((name) => !catalogNames.has(name));

      if (invalid.length > 0) {
        p.log.error(
          `Skill(s) não encontrada(s): ${pc.red(invalid.join(", "))}.\nUse ${pc.cyan("skills list")} para ver todas as opções disponíveis.`
        );
        process.exit(1);
      }

      skillsToInstall = [...new Set(skillArgs)];
    }

    const targetDir = resolveTargetDir({
      target: options.target,
      path: options.path,
      global: options.global
    });

    // Verificação de conflito / sobrescrita
    const finalSkills: string[] = [];

    for (const skill of skillsToInstall) {
      if (skillExists(targetDir, skill) && !options.yes) {
        const overwrite = await p.confirm({
          message: `A skill "${pc.cyan(skill)}" já existe em ${pc.dim(targetDir)}. Deseja sobrescrever?`,
          initialValue: false
        });

        if (p.isCancel(overwrite) || !overwrite) {
          p.log.warn(`Ignorando "${skill}".`);
          continue;
        }
      }
      finalSkills.push(skill);
    }

    if (finalSkills.length === 0) {
      p.log.info("Nenhuma skill selecionada para instalação.");
      return;
    }

    s.start(`Baixando e instalando ${finalSkills.length} skill(s)...`);
    const { installed } = await downloadSkills(finalSkills, targetDir);
    s.stop("Download e extração concluídos.");

    p.note(
      installed.map((itemPath) => `✔ ${pc.cyan(path.basename(itemPath))} → ${pc.dim(itemPath)}`).join("\n"),
      "Skills instaladas com sucesso"
    );

    p.outro(pc.green("Pronto! As skills estão disponíveis para uso no seu assistente de IA."));
  } catch (error: any) {
    p.log.error(pc.red(`Erro durante a instalação: ${error.message}`));
    process.exit(1);
  }
}
