# Review Log & Retrospective

## [2026-09-04] SRD — Central de Skills & Instalador CLI via npm

### 1. Multi-role Review

- **🎯 Product (Visão de Produto):**
  - [x] Problema bem delimitado: dor de fragmentação, falta de versionamento e setup manual repetitivo.
  - [x] Métricas mensuráveis: tempo de instalação (< 10s), integridade dos arquivos (100%) e redução para comando único.
  - [x] Limites de escopo explícitos: MVP focado no fluxo core de instalação, deixando update/diff e repos privados para fases posteriores.

- **🎨 Design (Terminal DX / CLI):**
  - [x] Estados visuais essenciais definidos: loading (spinners), sucesso com caminhos absolutos, confirmação para sobrescrita.
  - [x] Suporte duplo: interativo visual (com checkboxes) para iniciantes e headless com flags para automação.
  - [ ] *Ponto de atenção:* Detalhar mensagens de feedback para cenários offline ou timeout de rede no PRD.

- **🔧 Engineering (Arquitetura e Implementação):**
  - [x] Estrutura de repositório em monorepo separando o catálogo de skills (`/skills/*`) do CLI (`/packages/cli`).
  - [x] Mitigação de Rate Limit da API do GitHub ao priorizar tarball/raw em vez de chamadas REST por arquivo.
  - [x] Compatibilidade com SOs (Windows, macOS, Linux) através de resolução padronizada de diretórios de usuários.
  - [ ] *Ponto de atenção:* Definir no PRD a versão mínima do runtime Node.js (recomendado Node >= 18 com `fetch` nativo).

---

### 2. Retrospective

- **Seções mais suscintas / TBD:**
  - A/B Testing (§8.2) foi identificado como não aplicável para ferramenta utilitária de linha de comando.
  - A estratégia de distribuição de repositórios privados ficou postergada para a Fase 3 para manter o MVP simples e rápido de lançar.
- **Perguntas para a próxima fase (PRD):**
  - Namespace definitivo do pacote no npm: `@guimathis/skills` (confirmado).
  - A stack interna do CLI: TypeScript com `tsx` / `tsup` compilado para CJS/ESM? (confirmado: TypeScript + tsup ESM).
  - Quais bibliotecas de CLI serão adotadas? (confirmado: `commander` + `@clack/prompts`).

---

## [2026-09-04] PRD — Central de Skills & Instalador CLI via npm

### 1. Multi-role Review

- **🎯 Product (Visão de Produto):**
  - [x] O escopo funcional cobre exatamente a necessidade: monorepo com catálogo de skills e instalador sob demanda via npx.
  - [x] O fluxo de usuário (§4.0) abrange tanto o caminho interativo visual quanto automação com argumentos de terminal diretos.
  - [x] Critérios de aceite (§4.1.3) estão em formato de checklist acionável e testável.

- **🎨 Design (Terminal UI / DX):**
  - [x] Mockups de terminal detalhados com `@clack/prompts`, spinner de carregamento, multiselect e resumo final com caminhos absolutos.
  - [x] Estados de cancelamento (`Ctrl+C`) e feedback de erro amigável previstos.
  - [x] Prevenção de perda de dados com confirmação interativa antes de sobrescrever skills existentes.

- **🔧 Engineering (Arquitetura e Implementação):**
  - [x] Stack tecnológica especificada: Node >= 18 (com `fetch` nativo), TypeScript, `commander`, `@clack/prompts`, `tar` e `tsup`.
  - [x] Download em stream único do tarball do GitHub com extração filtrada, contornando o rate limit da REST API.
  - [x] Segurança: sanitização contra path traversal na descompactação do tarball.
  - [x] Resolução robusta de caminhos em Windows, macOS e Linux.

---

### 2. Retrospective

- **Seções mais sucintas / TBD:**
  - Seções web tradicionais (CMS, SEO, ADA) foram omitidas conforme as diretrizes do template para ferramentas CLI de terminal.
  - O catálogo inicial contempla as 6 skills já existentes localmente no ambiente do usuário.
- **Próximos passos de desenvolvimento:**
  - Inicializar o repositório git e workspaces npm.
  - Copiar as skills locais existentes para a pasta `/skills/`.
  - Implementar o pacote `/packages/cli` e testar localmente.

