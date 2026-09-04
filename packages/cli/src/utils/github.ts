import path from "node:path";
import fs from "node:fs";
import { Readable } from "node:stream";
import * as tar from "tar";
import type { SkillMeta } from "../types.js";
import { ensureDir } from "./paths.js";

export const GITHUB_OWNER = "guimathis";
export const GITHUB_REPO = "skills";
export const GITHUB_BRANCH = "main";

export function findLocalRepoRoot(): string | null {
  // 1. Verificar process.cwd()
  if (fs.existsSync(path.resolve(process.cwd(), "catalog.json")) && fs.existsSync(path.resolve(process.cwd(), "skills"))) {
    return process.cwd();
  }

  // 2. Verificar relativo ao módulo compilado (dist/ -> packages/cli/ -> raiz)
  try {
    let currentDir = path.dirname(new URL(import.meta.url).pathname);
    if (process.platform === "win32" && currentDir.startsWith("/")) {
      currentDir = currentDir.slice(1);
    }
    const candidate = path.resolve(currentDir, "../../../");
    if (fs.existsSync(path.resolve(candidate, "catalog.json")) && fs.existsSync(path.resolve(candidate, "skills"))) {
      return candidate;
    }
  } catch {
    // Ignora erro de resolução de URL
  }

  return null;
}

export async function fetchCatalog(): Promise<SkillMeta[]> {
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/catalog.json`;

  try {
    const res = await fetch(rawUrl, {
      headers: { "User-Agent": "guimathis-skills-cli" }
    });

    if (res.ok) {
      const data = (await res.json()) as SkillMeta[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Falha de rede remota - tenta fallback local
  }

  // Fallback local se estiver executando no repositório
  const localRoot = findLocalRepoRoot();
  if (localRoot) {
    const localCatalogPath = path.resolve(localRoot, "catalog.json");
    if (fs.existsSync(localCatalogPath)) {
      const content = fs.readFileSync(localCatalogPath, "utf-8");
      return JSON.parse(content) as SkillMeta[];
    }
  }

  throw new Error(
    `Não foi possível obter o catálogo de skills do GitHub (${GITHUB_OWNER}/${GITHUB_REPO}). Verifique sua conexão ou se o repositório foi publicado.`
  );
}

export async function downloadSkills(
  skills: string[],
  targetDir: string
): Promise<{ installed: string[]; skipped: string[] }> {
  ensureDir(targetDir);
  const installed: string[] = [];
  const skipped: string[] = [];

  const tarUrl = `https://codeload.github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tar.gz/refs/heads/${GITHUB_BRANCH}`;

  let remoteSuccess = false;

  try {
    const res = await fetch(tarUrl, {
      headers: { "User-Agent": "guimathis-skills-cli" }
    });

    if (res.ok && res.body) {
      const nodeStream = Readable.fromWeb(res.body as any);

      await new Promise<void>((resolve, reject) => {
        const extractor = tar.x({
          cwd: targetDir,
          strip: 2,
          filter: (entryPath) => {
            // Normalizar separadores para /
            const normalized = entryPath.replace(/\\/g, "/");
            const parts = normalized.split("/").filter(Boolean);

            // Estrutura esperada: skills-main/skills/<skill-name>/...
            if (parts.length >= 3 && parts[1] === "skills") {
              const skillName = parts[2];
              if (skills.includes(skillName) && !normalized.includes("..")) {
                return true;
              }
            }
            return false;
          }
        });

        nodeStream.pipe(extractor);
        extractor.on("finish", () => {
          remoteSuccess = true;
          resolve();
        });
        extractor.on("error", reject);
        nodeStream.on("error", reject);
      });
    }
  } catch {
    // Falha remota - tentará fallback local
  }

  // Se o download remoto não teve sucesso (ex: repo ainda não enviado ao GitHub), usa fallback local
  if (!remoteSuccess) {
    const localRoot = findLocalRepoRoot();
    if (localRoot) {
      const localSkillsDir = path.resolve(localRoot, "skills");
      for (const skill of skills) {
        const src = path.join(localSkillsDir, skill);
        const dest = path.join(targetDir, skill);
        if (fs.existsSync(src)) {
          fs.cpSync(src, dest, { recursive: true, force: true });
        }
      }
      remoteSuccess = true;
    }
  }

  if (!remoteSuccess) {
    throw new Error(
      `Falha ao baixar as skills de ${GITHUB_OWNER}/${GITHUB_REPO}. Verifique sua conexão com a internet ou se o repositório remoto está acessível.`
    );
  }

  // Verifica quais skills foram de fato instaladas no diretório alvo
  for (const skill of skills) {
    const checkPath = path.join(targetDir, skill);
    if (fs.existsSync(checkPath)) {
      installed.push(checkPath);
    } else {
      skipped.push(skill);
    }
  }

  return { installed, skipped };
}
