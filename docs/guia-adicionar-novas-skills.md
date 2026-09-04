# 📘 Guia para Adicionar Novas Skills

Este guia orienta passo a passo como criar, documentar, testar e disponibilizar novas skills no repositório **`guimathis/skills`**, garantindo que fiquem disponíveis imediatamente para instalação via `npx @guimathis/skills`.

---

## ⚡ Como Funciona a Disponibilização (Zero-Deploy)

O CLI `@guimathis/skills` consulta dinamicamente o arquivo `catalog.json` e faz o download do código-fonte diretamente da branch `main` do GitHub. 

Isso significa que:
- **Você NÃO precisa republicar o pacote `@guimathis/skills` no npm** quando adicionar ou atualizar uma skill.
- Basta fazer `git push` das novas skills para a branch `main` do GitHub, e elas estarão disponíveis instantaneamente para qualquer usuário rodando `npx @guimathis/skills`.

---

## 📂 Estrutura de Pastas de uma Skill

Toda nova skill deve residir em sua própria subpasta dentro do diretório `skills/`:

```text
skills/
└── <nome-da-skill>/
    ├── SKILL.md                 # [OBRIGATÓRIO] Instruções e metadados da skill
    ├── references/              # [OPCIONAL] Guias, templates e documentações auxiliares
    │   ├── template.md
    │   └── guidelines.md
    ├── scripts/                 # [OPCIONAL] Scripts Python, Bash ou Node.js que o agente pode executar
    │   └── helper.py
    └── assets/                  # [OPCIONAL] Arquivos estáticos, esquemas JSON, exemplos
        └── schema.json
```

---

## 📝 1. Criando o `SKILL.md`

O arquivo `SKILL.md` é a peça central da skill. Ele **deve** conter um cabeçalho YAML frontmatter válido seguido pelas instruções para o assistente de IA.

### Exemplo de Template de `SKILL.md`:

```markdown
---
name: minha-nova-skill
description: Descrição concisa e orientada a gatilhos. Explique o que a skill faz e quando o assistente deve ativá-la. Ex: "Use when creating or refactoring..."
---

# Nome da Skill

Uma breve introdução sobre o propósito desta skill e o que ela resolve.

## Regras e Convenções

1. **Regra 1**: Explicação detalhada da diretriz técnica.
2. **Regra 2**: Boas práticas esperadas pelo projeto.

## Exemplos de Uso

```language
// Exemplo prático de código ou padrão recomendado
```

## Arquivos de Referência (se houver)
- `references/template.md`: Template padrão para o artefato.
```

### 💡 Boas Práticas para o Cabeçalho YAML:
- **`name`**: Deve coincidir exatamente com o nome da pasta em `skills/` (use apenas letras minúsculas, números e hífens: `kebab-case`).
- **`description`**: É lida pelos agentes de IA para decidir se a skill é relevante para o pedido do usuário. Inclua palavras-chave e cenários claros de ativação:
  - *Bom:* `Convenções de API REST, DTOs e validações. Use ao criar endpoints, controllers ou contratos OpenAPI.`
  - *Ruim:* `Ajuda com APIs.`

---

## 📋 2. Atualizando o `catalog.json`

Abra o arquivo `catalog.json` na raiz do monorepo e adicione a nova skill à lista JSON:

```json
[
  ...
  {
    "name": "minha-nova-skill",
    "description": "Descrição amigável em uma linha para exibição no menu interativo do terminal.",
    "version": "1.0.0"
  }
]
```

> **Atenção:** Mantenha o campo `name` idêntico ao nome da pasta criada em `skills/`.

---

## 🧪 3. Testando a Skill Localmente

Antes de enviar as alterações para o repositório remoto, valide se o CLI reconhece e instala sua nova skill corretamente:

### 3.1 Compilar o CLI (se fez alterações no código TypeScript)
```bash
npm run build
```

### 3.2 Verificar se a skill aparece na listagem
```bash
node packages/cli/dist/bin.js list
```
Sua nova skill deve ser exibida com o nome, descrição e versão informados no `catalog.json`.

### 3.3 Testar a instalação em uma pasta temporária
```bash
node packages/cli/dist/bin.js add minha-nova-skill --path ./tmp-teste -y
```

Verifique se a pasta `./tmp-teste/minha-nova-skill` foi criada com todos os arquivos (`SKILL.md`, `references/`, etc.) intactos.  
Após validar, remova a pasta temporária:
```bash
# Windows (PowerShell):
Remove-Item -Recurse -Force tmp-teste

# Linux / macOS:
rm -rf tmp-teste
```

---

## 🚀 4. Publicando a Skill no Repositório

Com tudo testado e validado, basta commitar e enviar para o GitHub:

```bash
# Adicionar a pasta da skill e o catálogo atualizado
git add skills/minha-nova-skill catalog.json

# Fazer o commit descritivo
git commit -m "feat(skills): adiciona skill minha-nova-skill"

# Enviar para a branch principal
git push origin main
```

Após o `git push`, o workflow do GitHub Actions (`validate-skills.yml`) executará automaticamente a validação de integridade.

A nova skill já estará disponível para qualquer desenvolvedor instalar com:
```bash
npx @guimathis/skills add minha-nova-skill
```

---

## ✅ Checklist Rápido de Criação de Skill

- [ ] Criei a pasta em `skills/<nome-da-skill>` em formato `kebab-case`.
- [ ] Criei o arquivo `SKILL.md` com YAML frontmatter (`name` e `description`).
- [ ] O `name` no YAML coincide com o nome da pasta.
- [ ] Adicionei subpastas complementares (`references/`, `scripts/`), se necessário.
- [ ] Adicionei a nova entrada no `catalog.json` na raiz do repositório.
- [ ] Testei a listagem com `node packages/cli/dist/bin.js list`.
- [ ] Testei a instalação com `node packages/cli/dist/bin.js add <nome> --path ./tmp-teste -y`.
- [ ] Fiz o `git push` para a branch `main`.
