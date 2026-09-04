# SRD — Central de Skills & Instalador CLI via npm

> Version: V0.1  
> Date: 2026-09-04  
> Author: guimathis  

---

## 1. Customer

- **Público Principal (Interno):** O próprio desenvolvedor que cria, aprimora e utiliza skills em múltiplas máquinas de trabalho e projetos.
- **Público Secundário (Externo / Equipes):** Desenvolvedores e times que utilizam assistentes de IA e desejam adotar convenções compartilhadas (ex: JPA, APIs, tratamento de exceções, regras de arquitetura).
- **Ambientes e Agentes Suportados:**
  - Google Antigravity / Gemini CLI (`~/.gemini/skills/` ou `.gemini/skills/` do projeto).
  - Claude Code (`~/.claude/skills/` ou `.claude/skills/`).
  - Cursor / Agentes agnósticos (estruturas de diretório configuráveis como `.agents/skills/` ou `.cursor/skills/`).

---

## 2. Job to be Done

Como desenvolvedor que utiliza assistentes de IA em diferentes projetos e ambientes de desenvolvimento, quero centralizar todas as minhas skills em um repositório versionado no GitHub e instalá-las sob demanda com um único comando via `npx`/`npm`, para que eu e minha equipe possamos padronizar e configurar agentes em segundos sem cópia manual de arquivos ou configurações repetitivas.

---

## 3. Benefit

### 3.1 Valor e Benefícios para o Usuário
- **Zero Configuração Manual:** Elimina a necessidade de clonar repositórios inteiros manualmente, navegar até diretórios de configuração ocultos do sistema operacional e copiar arquivos pasta por pasta.
- **Instalação Instantânea:** Instalação de uma ou várias skills com apenas um comando no terminal (`npx <pacote> add <skill>`) ou através de um menu interativo com seleção visual.
- **Flexibilidade de Escopo:** Possibilidade de instalar a skill globalmente (disponível para qualquer projeto na máquina) ou localmente dentro do projeto atual.
- **Suporte Multi-Assistente:** Capacidade de direcionar a instalação para o assistente de escolha (Antigravity, Claude Code, etc.) com resolução automática de diretórios.

### 3.2 Valor e Benefícios para o Negócio / Engenharia
- **Padronização e Governança de Código:** Facilita a adoção de convenções de engenharia (como `jpa-conventions`, `api-conventions` e `exception-handling-conventions`) entre múltiplos desenvolvedores e repositórios da organização.
- **Agilidade no Catálogo (Zero-Deploy Overhead):** Como o CLI consulta o GitHub diretamente para obter as skills mais recentes da branch principal, novas skills ou atualizações de conteúdo ficam disponíveis imediatamente para todos os usuários sem necessidade de recompilar e republicar o pacote no npm a cada alteração de skill.
- **Baixo Custo de Manutenção:** Estrutura unificada em monorepo contendo a biblioteca de skills e o pacote CLI.

### 3.3 Impacto na Marca / Comunidade
- **Potencial de Comunidade:** Criação de uma base sólida para compartilhamento público de skills de IA agentic, posicionando o autor como referência no ecossistema de ferramentas e boas práticas para agentes de IA.

---

## 4. Problem

Atualmente, o processo de criação, manutenção e distribuição de skills para assistentes de IA apresenta as seguintes dores e limitações:

1. **Fragmentação Local:** As skills desenvolvidas ficam salvas em pastas locais da máquina do usuário (ex: `C:\Users\guima\.gemini\skills\`), isoladas e sem versionamento centralizado no Git.
2. **Distribuição Ineficiente:** Para levar uma skill para uma nova máquina ou compartilhar com um colega de trabalho, o processo atual exige:
   - Enviar arquivos por mensagem/e-mail ou clonar um repositório genérico.
   - Localizar manualmente os diretórios corretos de cada ferramenta (que variam entre Windows, macOS e Linux).
   - Mover os arquivos na mão, aumentando o risco de copiar pastas incompletas (ex: esquecer subpastas `references/` ou `scripts/`).
3. **Falta de Sincronização e Atualizações:** Quando regras de uma convenção ou instruções de uma skill são atualizadas, não há mecanismo para descobrir ou aplicar as alterações em máquinas que já possuíam a versão antiga instalada.
4. **Acoplamento a Ferramentas Específicas:** Não há uma camada de abstração que permita direcionar uma skill para diferentes assistentes de IA de forma transparente.

---

## 5. Solution

A solução consiste em uma arquitetura monorepo com dois componentes principais:
1. **Repositório Central de Skills:** Um repositório no GitHub que funciona como a fonte de verdade (*single source of truth*) contendo as pastas de cada skill com sua especificação completa (`SKILL.md`, `references/`, `scripts/`).
2. **Pacote CLI no npm:** Um executável Node.js leve distribuído via npm e executável sob demanda via `npx`, responsável por consultar o repositório no GitHub, exibir as opções ao usuário e realizar o download e instalação no diretório correto.

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│ ┌─────────────────────────┐     ┌─────────────────────────┐ │
│ │     /packages/cli       │     │        /skills/*        │ │
│ │ (Publicado no npm como  │     │ - api-conventions       │ │
│ │  npx @guimathis/skills) │     │ - jpa-conventions       │ │
│ └────────────┬────────────┘     │ - requirement-writer    │ │
│              │                  │ - ...                   │ │
│              │ Publica          └────────────▲────────────┘ │
└──────────────┼───────────────────────────────┼──────────────┘
               ▼                               │ Download dinâmico
         ┌───────────┐                         │ via GitHub Raw/Tarball
         │ npm / npx │                         │
         └─────┬─────┘                         │
               │ Executa `npx @guimathis/skills`
               ▼                               │
      ┌─────────────────┐                      │
      │ Terminal do Dev ├──────────────────────┘
      └────────┬────────┘
               │ Instala arquivos
               ▼
    ┌──────────────────────────────────────────────┐
    │ Diretório de Destino:                        │
    │ - Antigravity: ~/.gemini/skills/<skill>      │
    │ - Claude Code: ~/.claude/skills/<skill>      │
    │ - Local:       ./.gemini/skills/<skill>      │
    └──────────────────────────────────────────────┘
```

### 5.1 Benchmark Analysis (Análise de Referências)

| Solução / Ferramenta | Abordagem | Pontos Fortes | Limitações frente ao nosso cenário |
|----------------------|-----------|---------------|------------------------------------|
| **`shadcn/ui`** (`npx shadcn@latest add`) | CLI que busca código fonte em repositório e copia para o projeto local. | Excelente DX, não requer republicação no npm para novos componentes, controle total do usuário. | Focado em componentes React, requer adaptação para estrutura de pastas de skills de agentes. |
| **`degit` / `tiged`** | Faz download de árvores do Git sem clonar o histórico `.git`. | Rápido, leve, sem dependência do binário do Git. | Não possui lógica de resolução de caminhos de agentes de IA nem menu interativo contextual. |
| **npm packages tradicionais** | Cada skill como um pacote npm individual (`npm i skill-x`). | Versionamento SemVer isolado. | Exige `npm publish` a cada alteração de skill, polui o `node_modules` e não instala nos diretórios nativos dos assistentes (`~/.gemini/skills`). |

### 5.2 Before/After Comparison (Comparação Antes / Depois)

| Dimensão | Estado Atual (Antes) | Estado Alvo (Depois) |
|----------|---------------------|----------------------|
| **Armazenamento das Skills** | Espalhadas localmente em `~/.gemini/skills/` sem versionamento. | Centralizadas e versionadas em repositório GitHub com CI/CD. |
| **Processo de Instalação** | Manual: abrir terminal/gerenciador de arquivos, criar pasta, copiar arquivos. | 1 comando no terminal: `npx @guimathis/skills add <skill>` ou menu interativo. |
| **Tempo de Setup** | 5 a 10 minutos por máquina/projeto. | Menos de 10 segundos. |
| **Disponibilização de Novas Skills** | Compartilhamento manual de arquivos. | `git push` no repositório; o CLI passa a listar a nova skill imediatamente. |
| **Suporte a Múltiplos Assistentes** | Manual para cada assistente. | Seleção guiada no CLI (Antigravity, Claude Code, Local). |

### 5.3 Scope (In / Out)

| In Scope (Fase 1 - MVP) | Out of Scope (Fora do MVP) |
|-------------------------|----------------------------|
| Estrutura de Monorepo com pasta `/skills` e `/packages/cli`. | Interface gráfica (GUI / Web Dashboard). |
| Catálogo inicial migrando as skills locais existentes. | Marketplace aberto com submissão por terceiros. |
| Comando interativo via `npx` (lista skills com checkboxes para seleção múltipla). | Resolução de merge bidirecional em caso de conflitos de código. |
| Comando com argumentos diretos (ex: `add <skill-name>`, `--all`). | Plugins nativos de IDE (extensão dedicada para VS Code/JetBrains). |
| Escolha do destino da instalação: Global (Home) vs Local do Projeto. | Gerenciamento de credenciais para repositórios privados na v1 (será público inicialmente). |
| Detecção e suporte para Antigravity (`~/.gemini/skills`) e Claude Code (`~/.claude/skills`). | Sistema de rating e telemetria complexa. |
| Verificação de conflito (prompt de confirmação caso a skill já exista no destino). | |
| Download eficiente via tarball da branch `main` ou GitHub API. | |

### 5.4 Phasing (Fases de Entrega)

| Fase | Escopo | Objetivo | Dependências |
|------|--------|----------|--------------|
| **Fase 1 (MVP)** | - Repositório GitHub estruturado.<br>- Migração das skills atuais.<br>- Pacote CLI publicado no npm.<br>- Comandos `npx <pkg>` (interativo) e `add <skill>`.<br>- Suporte Antigravity + Claude Code. | Validar a experiência de instalação e centralizar todas as skills em um único local acessível. | Nenhuma |
| **Fase 2** | - Comando `list` (listar instaladas vs disponíveis).<br>- Comando `diff` / `update` para atualizar skills.<br>- Suporte a Cursor e diretórios customizados via flag `--path`. | Permitir manutenção e atualização contínua das skills instaladas. | Fase 1 |
| **Fase 3** | - Suporte a repositórios privados (flag `--token` ou env `GITHUB_TOKEN`).<br>- Tags de release e versionamento fixo de skills (`add skill@v1.2.0`). | Atender cenários corporativos privados e projetos que exigem versões congeladas. | Fase 2 |

---

## 6. Success Metrics

| Tipo de Indicador | Nome do Indicador | Situação Atual | Meta / Valor Alvo |
|-------------------|-------------------|----------------|-------------------|
| **Métrica Primária** | Tempo de instalação de uma skill | ~5 minutos (manual) | < 10 segundos via `npx` |
| **Métrica Primária** | Passos manuais necessários | 5+ passos manuais | 1 único comando |
| **Métrica de Observação** | Taxa de integridade dos arquivos | Omissões ocasionais de referências | 100% dos arquivos e subpastas copiados |
| **Métrica de Observação** | Tempo de disponibilização de nova skill | N/A | < 1 minuto (tempo do push no GitHub) |
| **Métrica de Observação** | Compatibilidade de SO | Não testado de forma padronizada | Funcionamento uniforme em Windows, macOS e Linux |

---

## 7. Risks & Mitigation (Avaliação de Riscos)

| Tipo de Risco | Descrição do Risco | Nível | Medida de Mitigação |
|--------------|-------------------|:-----:|---------------------|
| **Técnico (API Rate Limit)** | O GitHub impõe limite de 60 requisições/hora por IP para requisições anônimas à API REST. | Médio | Não realizar chamadas individuais por arquivo na API REST. Em vez disso, baixar o tarball completo da branch ou buscar diretamente os arquivos via `raw.githubusercontent.com` ou clonagem temporária rasa (`git clone --depth 1`). |
| **Técnico (Sobrescrita Acidental)** | O usuário pode ter customizado localmente uma skill já instalada e o CLI sobrescrever suas alterações sem aviso. | Alto | O CLI deve verificar se a pasta de destino já existe e solicitar confirmação explícita do usuário: `A skill [nome] já existe. Deseja sobrescrever? (s/N)`. |
| **Técnico (Compatibilidade de SO e Caminhos)** | Diferenças de separadores de caminho (`\` no Windows vs `/` no POSIX) e localização da pasta home do usuário (`USERPROFILE` vs `HOME`). | Baixo | Utilizar as APIs padrão do Node.js (`path.join`, `os.homedir()`) e garantir testes em ambiente Windows e Linux. |
| **Operacional (Nome do Pacote no npm)** | O nome desejado do pacote pode já estar em uso no registro público do npm. | Baixo | Utilizar escopo pessoal no npm (ex: `@guimathis/skills` ou nome alternativo disponível como `agy-skills-hub`). |

---

## 8. Feedback Loops

### 8.1 Stakeholders Feedback
- **Principais Stakeholders:** O próprio autor e desenvolvedores parceiros que utilizam as convenções de código.
- **Canal de Coleta de Feedback:** GitHub Issues e Pull Requests no repositório oficial.
- **Critérios de Priorização de Feedback:**
  1. Bugs de instalação ou corrupção de arquivos (Bloqueadores).
  2. Suporte a novos agentes de IA (Alta prioridade).
  3. Comandos utilitários adicionais (`list`, `update`, `diff`) (Média prioridade).

### 8.2 A/B Testing
> ⚠️ N/A — Não aplicável a ferramentas utilitárias de linha de comando para desenvolvedores.

### 8.3 Before/After Data
- Coleta qualitativa e validação de tempo no primeiro onboarding em uma máquina limpa comparando o tempo de instalação manual vs o comando `npx`.

---

## 9. Product Requirements (Visão Resumida de Produto)

1. **CLI Intuitivo e Zero-Install:** O usuário pode rodar a ferramenta diretamente com `npx @guimathis/skills` sem necessidade de instalar globalmente antes.
2. **Modo Interativo (Terminal UI):** Se invocado sem argumentos, o CLI apresenta uma lista selecionável com checkbox de todas as skills disponíveis no catálogo.
3. **Modo Headless / Argumentos:**
   - `npx @guimathis/skills add <skill-name>`: Instala uma skill específica.
   - `npx @guimathis/skills add --all`: Instala todas as skills do catálogo.
   - Flag `--target <antigravity|claude|local>`: Define o assistente ou pasta de destino.
   - Flag `--global`: Força a instalação na pasta home do usuário (`~`).
   - Flag `--yes` / `-y`: Pula prompts de confirmação de sobrescrita.
4. **Resolução de Diretórios Padrão:**
   - Antigravity Global: `<home>/.gemini/skills/<skill-name>`
   - Antigravity Projeto: `./.gemini/skills/<skill-name>`
   - Claude Code Global: `<home>/.claude/skills/<skill-name>`
   - Claude Code Projeto: `./.claude/skills/<skill-name>`
5. **Estrutura de Repositório Monorepo:**
   ```
   skills/
   ├── packages/
   │   └── cli/             # Pacote npm executável
   │       ├── src/
   │       ├── package.json
   │       └── README.md
   ├── skills/              # Catálogo de skills
   │   ├── api-conventions/
   │   ├── exception-handling-conventions/
   │   ├── jpa-conventions/
   │   ├── requirement-writer/
   │   ├── save-last-response/
   │   └── skill-creator/
   ├── docs/                # Documentação e especificações
   ├── package.json         # Workspace raiz
   └── README.md
   ```

---

## 10. UI/UX Requirements (Terminal CLI)

1. **Design de Terminal Moderno:** Uso de bibliotecas de UI de terminal consagradas (como `@clack/prompts` ou `inquirer` com `chalk` e `ora`) para fornecer spinners durante download e ícones claros (`✔` sucesso, `✖` erro, `⚠` aviso).
2. **Feedback Visual Imediato:**
   - Exibição de spinner durante o fetch do catálogo do GitHub.
   - Exibição clara do progresso da cópia dos arquivos.
   - Resumo final listando cada skill instalada e o caminho absoluto do arquivo no disco.
3. **Resiliência a Cancelamentos:** Tratamento elegante de `SIGINT` (Ctrl+C), limpando quaisquer arquivos temporários criados e encerrando o processo sem imprimir stack traces desnecessários.
