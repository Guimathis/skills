export interface SkillMeta {
  name: string;
  description: string;
  version?: string;
}

export type AgentTarget = "antigravity" | "claude" | "local" | "custom";

export interface InstallOptions {
  target?: AgentTarget;
  path?: string;
  global?: boolean;
  yes?: boolean;
  all?: boolean;
}
