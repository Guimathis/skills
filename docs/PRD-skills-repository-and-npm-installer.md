# PRD — Central de Skills & Instalador CLI via npm

> Version: V0.1  
> Date: 2026-09-04  
> Author: guimathis  
> Related: [SRD-skills-repository-and-npm-installer.md](file:///C:/Users/guima/OneDrive/Documentos/projects/skills/docs/SRD-skills-repository-and-npm-installer.md)  

---

## 1. Histórico de Revisões

| Versão | Data | Autor | Descrição das Alterações |
|:------:|:----:|:-----:|--------------------------|
| V0.1 | 2026-09-04 | guimathis | Criação da versão inicial do PRD com arquitetura do CLI, comandos, regras de negócio e critérios de aceite. |

---

## 2. Contexto e Motivação

Atualmente, desenvolvedores que utilizam assistentes de IA (Google Antigravity / Gemini CLI, Claude Code, Cursor) mantêm suas *skills* (arquivos `SKILL.md`, scripts e referências de apoio) espalhadas em diretórios locais de sua máquina (`~/.gemini/skills/`). 

Conforme detalhado no [SRD](file:///C:/Users/guima/OneDrive/Documentos/projects/skills/docs/SRD-skills-repository-and-npm-installer.md), esse cenário gera três problemas críticos:
1. Falta de versionamento no Git das convenções e skills desenvolvidas.
2. Dificuldade de onboarding e compartilhamento entre máquinas ou desenvolvedores de uma equipe.
3. Risco de desatualização ou cópia incompleta de subpastas durante instalações manuais.

Este PRD especifica a implementação técnica de um **Monorepo no GitHub (`guimathis/skills`)** e de um **CLI distribuído via npm (`@guimathis/skills`)**, permitindo que qualquer desenvolvedor instale uma ou todas as skills com um único comando via `npx`.

---

## 3. Visão Geral da Solução

| Item | Especificação |
|------|---------------|
| **Repositório GitHub** | `https://github.com/guimathis/skills` |
| **Pacote npm** | `@guimathis/skills` |
| **Comando de Execução** | `npx @guimathis/skills [comando] [opções]` |
| **Ambiente de Execução** | Node.js >= 18 (Cross-platform: Windows, macOS, Linux) |
| **Linguagem / Stack** | TypeScript, ESM nativo, compilado com `tsup` |
| **Bibliotecas Principais** | `commander` (parsing de CLI), `@clack/prompts` (UI interativa de terminal), `tar` (descompactação) |
| **Agentes Suportados** | Google Antigravity / Gemini CLI, Claude Code e Modo Agnóstico / Local |

---

## 4. Requisitos do Produto

### 4.0 Fluxo de Uso do Usuário (CLI Flow)

```
                     [Início: Usuário roda `npx @guimathis/skills`]
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ O usuário passou argumentos na linha? │
                      └───────────────────┬───────────────────┘
                                          │
                         Não              │              Sim
               ┌──────────────────────────┴──────────────────────────┐
               ▼                                                     ▼
┌───────────────────────────────┐                  ┌───────────────────────────────────┐
│ Spinner: Buscando catálogo de │                  │ Identifica argumentos passados    │
│ skills no GitHub              │                  │ (ex: `add jpa-conventions`        │
└──────────────┬────────────────┘                  │  ou `add --all`)                  │
               ▼                                   └─────────────────┬─────────────────┘
┌───────────────────────────────┐                                    │
│ Exibe menu interativo com     │                                    │
│ checkboxes (@clack/prompts)   │                                    │
└──────────────┬────────────────┘                                    │
               ▼                                                     │
┌───────────────────────────────┐                                    │
│ Usuário escolhe as skills     │                                    │
└──────────────┬────────────────┘                                    │
               ▼                                                     │
┌───────────────────────────────┐                                    │
│ Pergunta o destino:           │                                    │
│ 1. Antigravity (Global)       │                                    │
│ 2. Claude Code (Global)       │                                    │
│ 3. Projeto Local (.gemini/)   │                                    │
└──────────────┬────────────────┘                                    │
               │                                                     │
               └──────────────────────────┬──────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ A skill já existe no diretório alvo?  │
                      └───────────────────┬───────────────────┘
                                          │
                         Sim              │              Não
               ┌──────────────────────────┴──────────────────────────┐
               ▼                                                     │
┌───────────────────────────────┐                                    │
│ Pergunta confirmação:         │                                    │
│ "Sobrescrever? (s/N)"         │                                    │
│ (Se flag `-y`, pula confirma) │                                    │
└──────────────┬────────────────┘                                    │
               │                                                     │
               └──────────────────────────┬──────────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ Faz download e extrai os arquivos     │
                      │ para o diretório final                │
                      └───────────────────┬───────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ Exibe sumário de sucesso com          │
                      │ caminhos absolutos instalados         │
                      └───────────────────────────────────────┘
```

---

### 4.1 Interface de Linha de Comando (CLI UX)

O CLI oferece duas modalidades de interação: **Modo Interativo** e **Modo Headless (Automação por Flags)**.

#### 4.1.1 Modo Interativo (Padrão ao executar sem argumentos)

Ao executar `npx @guimathis/skills`, o terminal exibe uma interface limpa estilizada com `@clack/prompts`:

1. **Boas-vindas e Identidade Visual:**
   ```text
   ┌  @guimathis/skills v0.1.0
   │  Gerenciador de Skills para Assistentes de IA
   ```
2. **Spinner de Carregamento:**
   ```text
   ◇  Buscando skills disponíveis no GitHub...
   ```
3. **Seleção de Skills (Multiselect):**
   ```text
   ?  Selecione as skills que deseja instalar:
   ◻  api-conventions (Padronização REST, DTOs e OpenAPI)
   ◼  jpa-conventions (Boas práticas Hibernate, entidades e repositórios)
   ◻  requirement-writer (Gerador de Problem Framing, SRD e PRD)
   ◼  save-last-response (Salva a última resposta da IA em arquivo Markdown)
   ```
4. **Seleção do Destino:**
   ```text
   ?  Onde deseja instalar as skills?
   ●  Antigravity / Gemini CLI — Global (~/.gemini/skills)
   ○  Claude Code — Global (~/.claude/skills)
   ○  Projeto Local Atual (./.gemini/skills)
   ○  Caminho customizado...
   ```
5. **Conclusão:**
   ```text
   ✔  Instalação concluída com sucesso!
   │
   ◇  Skills instaladas:
   │  - jpa-conventions → C:\Users\guima\.gemini\skills\jpa-conventions
   │  - save-last-response → C:\Users\guima\.gemini\skills\save-last-response
   └  Pronto para usar com seu assistente!
   ```

#### 4.1.2 Modo Headless (Comandos e Flags)

Permite automação direta em scripts ou por desenvolvedores experientes:

```bash
# Instalar uma skill específica para o Antigravity (global padrão)
npx @guimathis/skills add jpa-conventions

# Instalar múltiplas skills específicas
npx @guimathis/skills add jpa-conventions api-conventions

# Instalar todas as skills disponíveis
npx @guimathis/skills add --all

# Especificar destino
npx @guimathis/skills add jpa-conventions --target claude
npx @guimathis/skills add jpa-conventions --target local
npx @guimathis/skills add jpa-conventions --path ./minha-pasta/skills

# Forçar sobrescrita sem confirmação interativa
npx @guimathis/skills add --all -y
```

#### 4.1.3 Critérios de Aceite da Interface (Acceptance Criteria)

- [ ] Executar `npx @guimathis/skills` sem parâmetros abre o menu interativo com lista de seleção múltipla.
- [ ] O cancelamento via `Ctrl+C` em qualquer etapa do menu interativo encerra a execução com a mensagem amigável `Operação cancelada pelo usuário` e código de saída `0`, sem stack trace de erro.
- [ ] Informar o nome de uma skill inexistente (ex: `npx @guimathis/skills add skill-fake`) exibe mensagem de erro clara: `✖ Skill "skill-fake" não encontrada no repositório. Use 'list' para ver opções disponíveis.` com código de saída `1`.
- [ ] Ao término da instalação, o CLI exibe o caminho absoluto de cada skill instalada.

---

### 4.2 Lógica de Negócio e Dados

#### 4.2.1 Resolução de Diretórios por Agente e SO

A resolução de caminhos deve ser totalmente compatível com Windows, macOS e Linux, utilizando `os.homedir()` e `path.resolve()`:

| Alvo (`--target`) | Escopo | Caminho no Windows | Caminho no macOS / Linux |
|-------------------|:------:|-------------------|--------------------------|
| `antigravity` (padrão) | Global | `%USERPROFILE%\.gemini\skills\<skill>` | `$HOME/.gemini/skills/<skill>` |
| `antigravity` | Local | `<cwd>\.gemini\skills\<skill>` | `<cwd>/.gemini/skills/<skill>` |
| `claude` | Global | `%USERPROFILE%\.claude\skills\<skill>` | `$HOME/.claude/skills/<skill>` |
| `claude` | Local | `<cwd>\.claude\skills\<skill>` | `<cwd>/.claude/skills/<skill>` |
| `custom` (`--path`) | Customizado | `<caminho_informado>\<skill>` | `<caminho_informado>/<skill>` |

#### 4.2.2 Obtenção das Skills do GitHub (Estratégia Anti-Rate-Limit)

Para evitar os limites estritos da API REST do GitHub (60 requisições/hora por IP para requisições não autenticadas), o CLI adota o seguinte mecanismo de download:

1. **Obtenção do Catálogo:**
   - O CLI consulta o arquivo de manifesto `catalog.json` na branch `main` via raw content:
     `https://raw.githubusercontent.com/guimathis/skills/main/catalog.json`
   - *Fallback:* Caso `catalog.json` não esteja acessível, o CLI consulta a árvore Git pública através do endpoint:
     `https://api.github.com/repos/guimathis/skills/git/trees/main?recursive=1`
2. **Download dos Arquivos da Skill:**
   - O CLI faz o download do archive tarball da branch `main`:
     `https://codeload.github.com/guimathis/skills/tar.gz/refs/heads/main`
   - O tarball é processado em stream de memória usando a biblioteca `tar`, extraindo **apenas** o subdiretório `skills/<skill-name>/**` correspondente para o diretório de destino do usuário.
   - Isso garante:
     - Download em 1 única requisição HTTP leve compactada.
     - Zero dependência de binário local do `git`.
     - Preservação total de subpastas (`references/`, `scripts/`, etc.).

#### 4.2.3 Regras de Conflito e Sobrescrita

1. O CLI verifica se a pasta de destino `<diretório>/<skill-name>` já existe.
2. Se existir:
   - Se a flag `--yes` / `-y` estiver presente, sobrescreve silenciosamente.
   - Caso contrário, pausa e solicita confirmação:
     `A skill "jpa-conventions" já existe no destino. Deseja sobrescrever? (s/N)`
   - Se o usuário responder `N`, aquela skill específica é pulada e o CLI continua com as próximas selecionadas.

---

### 4.3 Estrutura do Monorepo e Catálogo de Skills

O repositório `guimathis/skills` possui a seguinte organização:

```
skills/
├── .github/
│   └── workflows/
│       ├── validate-skills.yml   # Validação de SKILL.md e geração de catalog.json
│       └── publish-cli.yml       # Publicação automatizada no npm
├── catalog.json                  # Manifesto gerado automaticamente com metadados das skills
├── packages/
│   └── cli/                      # Pacote npm @guimathis/skills
│       ├── bin/
│       │   └── index.js          # Executável (#/usr/bin/env node)
│       ├── src/
│       │   ├── commands/
│       │   │   ├── add.ts
│       │   │   ├── list.ts
│       │   │   └── interactive.ts
│       │   ├── utils/
│       │   │   ├── github.ts     # Download e extração de tarball
│       │   │   ├── paths.ts      # Resolução de diretórios por SO
│       │   │   └── prompt.ts     # Componentes @clack/prompts
│       │   └── index.ts          # Entrypoint do CLI
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── skills/                       # Diretório contendo todas as skills
│   ├── api-conventions/
│   │   └── SKILL.md
│   ├── exception-handling-conventions/
│   │   └── SKILL.md
│   ├── jpa-conventions/
│   │   └── SKILL.md
│   ├── requirement-writer/
│   │   ├── references/
│   │   └── SKILL.md
│   ├── save-last-response/
│   │   └── SKILL.md
│   └── skill-creator/
│       └── SKILL.md
├── docs/                         # Documentações de requisitos (SRD, PRD)
├── package.json                  # Root package.json (npm workspaces)
└── README.md
```

#### 4.3.1 Formato do `catalog.json`

O arquivo `catalog.json` na raiz do repositório serve como índice leve para o CLI exibir nomes e descrições sem baixar os arquivos individuais:

```json
[
  {
    "name": "jpa-conventions",
    "description": "Convenções e boas práticas de persistência JPA, Hibernate e repositórios",
    "version": "1.0.0"
  },
  {
    "name": "api-conventions",
    "description": "Padrões arquiteturais REST, DTOs, paginação e contratos OpenAPI",
    "version": "1.0.0"
  },
  {
    "name": "save-last-response",
    "description": "Salva a resposta mais recente do assistente em documento Markdown estruturado",
    "version": "1.0.0"
  }
]
```

---

### 4.4 Arquitetura Técnica / Backend (Camada de Desenvolvimento)

#### 4.4.1 Resumo Técnico da Implementação

> ⚠️ As especificações abaixo definem a arquitetura do pacote `@guimathis/skills`:

1. **Stack e Dependências:**
   - **Runtime:** Node.js >= 18.0.0 (utiliza `fetch` global nativo, dispensando `node-fetch` ou `axios`).
   - **Módulos:** ESM (`"type": "module"` no `package.json`).
   - **CLI Framework:** `commander` (versão 12+) para parsing de argumentos e geração de `--help`.
   - **UI do Terminal:** `@clack/prompts` e `picocolors` para uma experiência visual moderna e leve.
   - **Extração de Arquivos:** `tar` (versão 7+) com stream de descompactação direta em memória.
   - **Compilação:** `tsup` para empacotamento rápido em um bundle JavaScript único e minificado em `dist/bin.js`.

2. **Package.json do CLI (`packages/cli/package.json`):**
   ```json
   {
     "name": "@guimathis/skills",
     "version": "0.1.0",
     "description": "Instalador de skills para assistentes de IA via npx",
     "type": "module",
     "bin": {
       "skills": "./dist/bin.js"
     },
     "publishConfig": {
       "access": "public"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Prevenção de Vulnerabilidades (Path Traversal):**
   - Durante a extração do tarball, todos os caminhos de arquivos devem ser sanitizados para impedir que entradas maliciosas contenham `../` e gravem arquivos fora do diretório de destino pretendido.

---

## 5. Métricas e Telemetria

- **Métricas Primárias de Produto:**
  - Tempo total de instalação (download + escrita no disco): meta `< 5 segundos` para conexões de banda larga padrão.
  - Taxa de sucesso na extração: `100%` das subpastas e referências preservadas.
- **Privacidade e Telemetria:**
  - O CLI **não coleta telemetria nem dados pessoais** do usuário. Todas as operações são locais e anônimas em relação ao GitHub.

---

## 6. Requisitos Não-Funcionais

### 6.1 Performance
- Tamanho total do pacote npm publicado menor que `500 KB`.
- Inicialização do comando `npx @guimathis/skills` em menos de `800ms`.

### 6.2 Tolerância a Falhas e Modo Offline
- Em caso de falha de conexão de rede durante o download, o CLI remove quaisquer diretórios parciais ou temporários criados e exibe mensagem amigável: `✖ Falha de conexão ao baixar skills do GitHub. Verifique sua conexão com a internet.`
- Em caso de rate-limit ou bloqueio da API do GitHub, o CLI fornece instrução de como usar `GITHUB_TOKEN` como variável de ambiente.

### 6.3 Segurança
- Sanitização de caminhos de arquivos ao descompactar o tarball.
- Não execução arbitrária de código durante a instalação (o instalador apenas copia arquivos e markdown, sem rodar `postinstall` scripts que possam comprometer a máquina do usuário).

---

## 7. Estratégia de Lançamento e Publicação

| Etapa | Ação | Responsável |
|-------|------|-------------|
| **1. Estruturação do Monorepo** | Criar pastas `skills/` e `packages/cli/`, migrando as skills locais existentes. | Dev Lead / guimathis |
| **2. Implementação do CLI** | Desenvolver comandos `interactive` e `add` com testes locais via `npm link`. | Dev Lead / guimathis |
| **3. Testes Multi-Ambiente** | Validar instalação no Windows (PowerShell) e Linux/macOS. | QA / Dev |
| **4. Publicação no npm** | Publicar a versão inicial `0.1.0` do pacote `@guimathis/skills` com acesso público no npm. | guimathis |
| **5. Documentação no README** | README principal do repositório com badges, exemplos de comandos e guia de contribuição. | guimathis |
