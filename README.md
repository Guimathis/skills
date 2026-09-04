# @guimathis/skills  [![npm version](https://img.shields.io/npm/v/@guimathis/skills.svg)](https://www.npmjs.com/package/@guimathis/skills) 

> Central de skills para assistentes de IA (Google Antigravity / Gemini CLI, Claude Code e outros) com instalador sob demanda via `npx`.

> ![Claude](https://img.shields.io/badge/claude-%23D97757.svg?style=for-the-badge&logo=claude&logoColor=white) ![Google Gemini](https://img.shields.io/badge/google%20gemini-%238E75B2.svg?style=for-the-badge&logo=google%20gemini&logoColor=white) ![Cursor](https://img.shields.io/badge/Cursor-%23000000.svg?style=for-the-badge&logo=Cursor&logoColor=white)


<video src="https://github.com/user-attachments/assets/319efabe-a5d2-42b9-bd93-d210d9976746" controls></video>

## Como Usar

Você não precisa clonar este repositório nem instalar nada globalmente. Basta rodar o comando abaixo no terminal:

```bash
npx @guimathis/skills
```

Um menu interativo será exibido permitindo selecionar quais skills você deseja instalar e para qual assistente de IA configurá-las.

---

## Comandos Diretos (CLI)

Para automação rápida em scripts ou no terminal:

```bash
# Instalar uma skill específica (padrão: Antigravity global em ~/.gemini/skills)
npx @guimathis/skills add jpa-conventions

# Instalar múltiplas skills
npx @guimathis/skills add jpa-conventions api-conventions

# Instalar todas as skills do repositório
npx @guimathis/skills add --all

# Instalar para o Claude Code (~/.claude/skills)
npx @guimathis/skills add jpa-conventions --target claude

# Instalar no escopo local do projeto atual (./.gemini/skills)
npx @guimathis/skills add jpa-conventions --target local

# Instalar em um diretório personalizado
npx @guimathis/skills add jpa-conventions --path ./minhas-skills

# Sobrescrever sem solicitar confirmação
npx @guimathis/skills add --all -y

# Listar todas as skills disponíveis no catálogo
npx @guimathis/skills list
```

---

## Catálogo de Skills Disponíveis

| Skill | Descrição |
|-------|-----------|
| **`api-conventions`** | Boas práticas de REST APIs (Richardson Nível 2), OpenAPI/Swagger, DTOs de entrada e saída. |
| **`exception-handling-conventions`** | Tratamento centralizado de erros em APIs Spring Boot utilizando Problem Details (RFC 7807/9457). |
| **`jpa-conventions`** | Convenções de modelagem JPA/Hibernate, chaves UUID, validações de coluna e repositórios. |
| **`requirement-writer`** | Guia interativo para elicitação de requisitos e geração de documentos (Problem Framing, SRD e PRD). |
| **`save-last-response`** | Extrai a última resposta do assistente de IA e salva automaticamente em um arquivo `.md` estruturado. |
| **`skill-creator`** | Ferramenta completa para criação, teste iterativo, benchmarking e otimização de novas skills de IA. |

---

## Estrutura do Monorepo

```
skills/
├── .github/workflows/
│   ├── publish-cli.yml       # Publicação automatizada no npm
│   └── validate-skills.yml   # Validação de integridade do catálogo
├── catalog.json              # Manifesto oficial de skills
├── docs/                     # Especificações e arquitetura
│   ├── guia-adicionar-novas-skills.md
│   ├── guia-atualizacao-e-versionamento.md
│   ├── SRD-skills-repository-and-npm-installer.md
│   ├── PRD-skills-repository-and-npm-installer.md
│   └── review-log.md
├── packages/
│   └── cli/                  # Pacote npm executável (@guimathis/skills)
│       ├── src/
│       │   ├── commands/     # add, list, interactive
│       │   ├── utils/        # github, paths, prompts
│       │   └── index.ts      # Entrypoint do CLI
│       ├── package.json
│       └── tsup.config.ts
└── skills/                   # Catálogo com código-fonte de cada skill
    ├── api-conventions/
    ├── exception-handling-conventions/
    ├── jpa-conventions/
    ├── requirement-writer/
    ├── save-last-response/
    └── skill-creator/
```

---

## Como Adicionar uma Nova Skill

Para instruções completas e detalhadas, consulte o **[Guia para Adicionar Novas Skills](docs/guia-adicionar-novas-skills.md)**.

Resumo dos passos:
1. Crie uma nova pasta dentro de `skills/<nome-da-sua-skill>/`.
2. Adicione seu arquivo `SKILL.md` contendo o cabeçalho YAML (`name` e `description`) e as instruções.
3. Adicione quaisquer pastas auxiliares necessárias (`references/`, `scripts/`, etc.).
4. Adicione o item correspondente no arquivo `catalog.json`.
5. Faça o commit e envie para a branch `main`:
   ```bash
   git add .
   git commit -m "feat(skills): adiciona skill <nome>"
   git push origin main
   ```
>  O CLI busca o catálogo e o conteúdo diretamente do GitHub na branch `main`. Novas skills ficam disponíveis imediatamente para todos os usuários sem necessidade de republicação no npm!

---

## Desenvolvimento do CLI

Para detalhes sobre o ciclo de lançamentos, SemVer, npm audit e segurança, consulte o **[Guia de Atualização, Versionamento e Segurança](docs/guia-atualizacao-e-versionamento.md)**.

Se você quiser contribuir ou testar alterações no CLI localmente:

```bash
# Instalar dependências
npm install

# Compilar o CLI
npm run build

# Executar localmente
node packages/cli/dist/bin.js --help
node packages/cli/dist/bin.js list
```

---

## 📄 Licença

MIT © [guimathis](https://github.com/guimathis)
