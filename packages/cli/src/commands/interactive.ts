import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import type { AgentTarget } from "../types.js";
import { fetchCatalog, downloadSkills } from "../utils/github.js";
import { resolveTargetDir, skillExists } from "../utils/paths.js";

export async function interactiveCommand(): Promise<void> {
  p.intro(`${pc.bgCyan(pc.black(" @guimathis/skills "))} ${pc.bold("Gerenciador de Skills para Assistentes de IA")}`);

  const s = p.spinner();
  s.start("Consultando catálogo de skills disponíveis...");

  let catalog;
  try {
    catalog = await fetchCatalog();
    s.stop("Catálogo carregado.");
  } catch (error: any) {
    s.stop("Falha ao carregar catálogo.");
    p.log.error(pc.red(error.message));
    process.exit(1);
  }

  // 1. Seleção múltipla de skills
  const selectedSkills = await p.multiselect({
    message: "Selecione as skills que deseja instalar (espaço para marcar):",
    options: catalog.map((item) => ({
      value: item.name,
      label: item.name,
      hint: item.description
    })),
    required: true
  });

  if (p.isCancel(selectedSkills)) {
    p.cancel("Operação cancelada pelo usuário.");
    process.exit(0);
  }

  const skillsToInstall = selectedSkills as string[];

  // 2. Seleção de destino / agente
  const targetOption = await p.select({
    message: "Onde deseja instalar as skills selecionadas?",
    options: [
      {
        value: "antigravity-global",
        label: "Antigravity / Gemini CLI — Global",
        hint: "Instala em ~/.gemini/skills (disponível em toda a máquina)"
      },
      {
        value: "claude-global",
        label: "Claude Code — Global",
        hint: "Instala em ~/.claude/skills"
      },
      {
        value: "local",
        label: "Projeto Atual (Local)",
        hint: "Instala em ./.gemini/skills na pasta atual"
      },
      {
        value: "custom",
        label: "Caminho customizado",
        hint: "Especificar um diretório personalizado"
      }
    ]
  });

  if (p.isCancel(targetOption)) {
    p.cancel("Operação cancelada pelo usuário.");
    process.exit(0);
  }

  let targetDir = "";

  if (targetOption === "antigravity-global") {
    targetDir = resolveTargetDir({ target: "antigravity", global: true });
  } else if (targetOption === "claude-global") {
    targetDir = resolveTargetDir({ target: "claude", global: true });
  } else if (targetOption === "local") {
    targetDir = resolveTargetDir({ target: "local" });
  } else if (targetOption === "custom") {
    const customPath = await p.text({
      message: "Digite o caminho do diretório de destino:",
      placeholder: "./minhas-skills",
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return "O caminho não pode ser vazio.";
        }
      }
    });

    if (p.isCancel(customPath)) {
      p.cancel("Operação cancelada pelo usuário.");
      process.exit(0);
    }

    targetDir = path.resolve(customPath as string);
  }

  // 3. Verificação de sobrescrita
  const finalSkills: string[] = [];

  for (const skill of skillsToInstall) {
    if (skillExists(targetDir, skill)) {
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
    p.outro(pc.yellow("Nenhuma skill foi instalada."));
    return;
  }

  // 4. Download e instalação
  s.start(`Instalando ${finalSkills.length} skill(s) em ${pc.dim(targetDir)}...`);
  try {
    const { installed } = await downloadSkills(finalSkills, targetDir);
    s.stop("Instalação concluída!");

    p.note(
      installed.map((itemPath) => `✔ ${pc.cyan(path.basename(itemPath))} → ${pc.dim(itemPath)}`).join("\n"),
      "Skills instaladas"
    );

    p.outro(pc.green("Sucesso! As skills já estão prontas para uso com seu assistente de IA."));
  } catch (error: any) {
    s.stop("Falha na instalação.");
    p.log.error(pc.red(error.message));
    process.exit(1);
  }
}
