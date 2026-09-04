---
name: save-last-response
description: >-
  Extracts the complete previous assistant (AI) response and saves it as a structured
  Markdown (.md) file in the project root. Trigger this skill whenever the user asks to
  save, export, document, record, or convert the last/previous AI response or explanation into
  a markdown file, file on disk, or document. Examples include: "salve a última resposta",
  "crie um .md com a resposta anterior", "export last response to markdown", "salvar resposta em md",
  "guarde isso em um arquivo", "save this as md", or when invoking /save-last-response.
---

# Save Last Response

This skill extracts the most recent AI response from the current conversation, enriches it with metadata (timestamp, title, tags), and writes it to a `.md` file at the root of the project.

## Workflow

Follow these sequential steps when activated:

### 1. Extract Target Response
- Identify the immediately preceding assistant response from the conversation history.
- Ensure the full text, code snippets, lists, and formatting of that response are captured accurately.

### 2. Determine File Name and Target Path
- **Target Path**: Default to the workspace root directory (`./`). If the user explicitly specifies another directory (e.g., `docs/notes.md`), respect their specified path.
- **File Name**:
  - If the user provided a filename in their prompt (e.g., `salve como guia-docker.md`), use it (ensuring it ends with `.md`).
  - Otherwise, generate a concise, kebab-case filename representing the topic (e.g., `explicacao-jpa.md`, `configuracao-jwt.md`, `resumo-requisitos.md`).

### 3. Format Content with Metadata
Prepend a YAML frontmatter metadata block to the extracted response content:

```markdown
---
title: "<Descriptive Title of the Response Topic>"
date: "<YYYY-MM-DD HH:mm:ss (or current timestamp)>"
tags: [<tag1>, <tag2>, <tag3>]
---

<Exact content of the previous AI response>
```

### 4. Create the File
- Write the formatted content using `write_to_file`.
- If the target file already exists, avoid accidental overwriting unless explicitly requested; otherwise append a numerical suffix (e.g., `explicacao-jpa-1.md`) or overwrite if intended by the user.

### 5. Confirm to User
- Provide a concise confirmation message.
- Include a clickable markdown link using the `file://` scheme to the created file (e.g., `[explicacao-jpa.md](file:///path/to/project/explicacao-jpa.md)`).

## Examples

### Example 1: Automatic Topic Naming (Default)
**User Input:** "salve a última resposta em um arquivo md"
**Extracted Topic:** Guia de configuração de autenticação JWT
**Generated File:** `./autenticacao-jwt.md`
**Content Written:**
```markdown
---
title: "Guia de Autenticação JWT com Spring Security"
date: "2026-08-27 10:15:00"
tags: [spring-boot, jwt, security, backend]
---

## Configuração do JWT...
(conteúdo completo da resposta anterior)
```

### Example 2: Explicit Custom Filename
**User Input:** "crie um md com a resposta anterior com o nome docs/setup-database.md"
**Target File:** `./docs/setup-database.md`
**Behavior:** Writes to the requested path preserving the metadata header.
