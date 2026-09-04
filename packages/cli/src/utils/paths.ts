import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import type { AgentTarget } from "../types.js";

export function resolveTargetDir(options: {
  target?: AgentTarget;
  path?: string;
  global?: boolean;
}): string {
  if (options.path) {
    return path.resolve(options.path);
  }

  const isGlobal = options.global !== false && options.target !== "local";

  if (options.target === "claude") {
    return isGlobal
      ? path.join(os.homedir(), ".claude", "skills")
      : path.resolve(process.cwd(), ".claude", "skills");
  }

  if (options.target === "local") {
    return path.resolve(process.cwd(), ".gemini", "skills");
  }

  // Padrão: Antigravity / Gemini CLI
  return isGlobal
    ? path.join(os.homedir(), ".gemini", "skills")
    : path.resolve(process.cwd(), ".gemini", "skills");
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function skillExists(targetDir: string, skillName: string): boolean {
  const dest = path.join(targetDir, skillName);
  return fs.existsSync(dest);
}
