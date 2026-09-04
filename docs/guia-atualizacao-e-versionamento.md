# 🔄 Guia de Atualização, Versionamento e Segurança

Este guia explica como manter, versionar e publicar atualizações no projeto **`guimathis/skills`**, abrangendo correções de bugs, segurança de dependências (npm audit e Socket.dev) e o ciclo de releases do CLI no npm.

---

## ⚡ Regra Central: Skills vs. CLI

| Cenário | O que foi alterado? | Precisa de nova versão no npm? | Como disponibilizar? |
|---------|---------------------|:------------------------------:|----------------------|
| **Nova Skill ou Melhoria em Skill** | Pasta `skills/*` ou `catalog.json` | ❌ **Não** | Basta `git push origin main`. O CLI busca o conteúdo direto do GitHub em tempo real. |
| **Correção de Bug no CLI** | Código em `packages/cli/src/*` |  **Sim** | Incrementar versão no npm e publicar (ex: `0.1.0` → `0.1.1`). |
| **Vulnerabilidade ou Atualização de Pacote** | Dependências em `packages/cli/package.json` |  **Sim** | Incrementar versão no npm e publicar (ex: `0.1.0` → `0.1.1`). |
| **Nova Funcionalidade no CLI** | Novo comando (ex: `skills update`) ou novas opções |  **Sim** | Incrementar versão no npm e publicar (ex: `0.1.0` → `0.2.0`). |

---

## 🔢 1. Versionamento Semântico (SemVer)

O CLI segue o padrão [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/):

```text
  MAJOR . MINOR . PATCH
 ( 0   .  1   .   0  )
```

1. **PATCH (`0.1.0` → `0.1.1`):**  
   Correções de bugs, ajustes internos ou correções de segurança em dependências que mantêm a compatibilidade com a versão anterior.
2. **MINOR (`0.1.0` → `0.2.0`):**  
   Novas funcionalidades ou comandos no CLI adicionados de forma retrocompatível (ex: novo comando `list --filter`, suporte a novo agente).
3. **MAJOR (`0.1.0` → `1.0.0`):**  
   Mudanças que quebram compatibilidade (*breaking changes*), alterando a sintaxe de comandos ou requisitos mínimos do sistema.

---

## 🛡️ 2. Gerenciamento de Vulnerabilidades e Socket.dev

### 2.1 Entendendo os Relatórios do Socket.dev
Ao publicar no npm, ferramentas como o **Socket.dev** analisam os pacotes e destacam capacidades utilizadas pelo código:

- **Acesso à Rede (`Network Access`):**  
  O CLI utiliza a API nativa `fetch` para consultar `https://raw.githubusercontent.com/.../catalog.json` e baixar o tarball com as skills. Esse comportamento é legítimo e esperado para uma ferramenta instaladora.
- **Acesso ao Sistema de Arquivos (`Filesystem Access`):**  
  O CLI utiliza `fs` e `tar` para extrair os arquivos das skills para `~/.gemini/skills/` ou para o diretório do projeto. Esse comportamento é legítimo.
- **Não há Execução Arbitrária de Código:**  
  O CLI não executa scripts arbitrários (`eval`, `child_process.exec`) em máquinas de terceiros. Apenas faz download e cópia de arquivos markdown e scripts das skills.

### 2.2 `dependencies` de Produção vs. `devDependencies` de Build
Nem todo aviso de segurança afeta os usuários finais do pacote:
- **`dependencies` (Produção):** Pacotes distribuídos para os usuários finais (`@clack/prompts`, `commander`, `picocolors`, `tar`). Devem estar sempre livres de vulnerabilidades críticas.
- **`devDependencies` (Build):** Ferramentas que rodam apenas na sua máquina durante o desenvolvimento (`tsup`, `esbuild`, `typescript`). O código delas é compilado e **não é enviado** como dependência para quem roda `npx @guimathis/skills`.

Para corrigir vulnerabilidades nas dependências:
```bash
# Verificar pendências de segurança
npm audit

# Aplicar correções automáticas seguras
npm audit fix
```

---

## 🚀 3. Passo a Passo para Lançar uma Nova Versão

Siga este procedimento sempre que fizer alterações no código do CLI ou em suas dependências:

### Passo 1: Aplicar a correção e testar localmente
Faça as alterações necessárias em `packages/cli/src/` e rode:
```bash
# Compilar o TypeScript
npm run build

# Testar o comando localmente
node packages/cli/dist/bin.js --help
node packages/cli/dist/bin.js list
```

### Passo 2: Atualizar a versão do pacote
Você pode alterar o campo `"version"` em `packages/cli/package.json` manualmente ou usar o comando utilitário do npm:

```bash
# Para correções de bugs / segurança (Patch: 0.1.0 -> 0.1.1):
npm version patch --workspace=@guimathis/skills

# Para novas funcionalidades (Minor: 0.1.0 -> 0.2.0):
npm version minor --workspace=@guimathis/skills
```

### Passo 3: Publicar a nova versão

Você tem duas opções para publicar:

#### Opção A: Publicação Automática via GitHub Actions (Recomendado)
1. Faça o commit e push das alterações para a branch `main`:
   ```bash
   git add .
   git commit -m "chore: release v0.1.1"
   git push origin main
   ```
2. No GitHub, vá na aba **Releases** → **Draft a new release**.
3. Crie uma tag correspondente à versão (ex: `v0.1.1`), adicione uma descrição das melhorias e clique em **Publish release**.
4. O workflow `.github/workflows/publish-cli.yml` compilará o projeto e publicará automaticamente a nova versão no npm usando o seu segredo `NPM_TOKEN`.

#### Opção B: Publicação Manual via Terminal
Se preferir publicar diretamente da sua máquina:
```bash
cd packages/cli
npm publish --access public
```
> *(Caso não use token com bypass de 2FA configurado, adicione a flag `--otp=123456` com o código do seu celular).*

---

## 👥 4. Como os Usuários Recebem a Atualização?

- **Execução sob demanda via `npx` (Maioria dos usuários):**  
  O comando `npx @guimathis/skills` sempre consulta a versão mais recente (`@latest`) no registro do npm no momento da chamada. O usuário recebe a versão atualizada instantaneamente, sem precisar instalar nada!
- **Instalação Global (`npm i -g @guimathis/skills`):**  
  Usuários que optaram por instalação global podem atualizar rodando:
  ```bash
  npm update -g @guimathis/skills
  ```

---

## ✅ Checklist Rápido de Release

- [ ] Corrigi o problema ou atualizei a dependência em `packages/cli/`.
- [ ] O comando `npm run build` compilou sem erros (`dist/bin.js`).
- [ ] Testei localmente com `node packages/cli/dist/bin.js <comando>`.
- [ ] O `npm audit` não aponta vulnerabilidades não tratadas.
- [ ] Incrementei a versão no `packages/cli/package.json` seguindo SemVer.
- [ ] Fiz o commit e push para o GitHub.
- [ ] Criei a tag/release no GitHub ou executei `npm publish --access public`.
