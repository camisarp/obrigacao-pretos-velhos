# Obrigação Pretos Velhos 2026

Dashboard web para organização da Obrigação de Pretos Velhos do **Ilè Asè Ôgún Méjèje ty Ộ'ṣun Íjimú**.

O projeto foi criado para facilitar o controle de presença, divisão financeira, organização de materiais, responsáveis por itens e geração de relatório final em PDF.

---

## ✨ Funcionalidades

- Controle de confirmação de presença por data
- Definição de data oficial da obrigação
- Controle financeiro da cota por pessoa
- Registro de valores pagos
- Registro de links de comprovantes visível apenas para administradores
- Controle de comparecimento no dia da obrigação
- Separação entre pessoas na cota e pessoas fora da cota
- Cadastro de novos tópicos pelo modo administrador
- Remoção/desativação de tópicos criados
- Cadastro de novos cards/itens por tópico
- Remoção/desativação de cards criados
- Cadastro de responsáveis por item
- Remoção de responsáveis
- Relatório final com resumo geral, financeiro, presença e materiais
- Relatório final com links de comprovantes para uso administrativo
- Geração de relatório em PDF com logo do Ilè
- Dados sincronizados em tempo real com Firebase/Firestore
- Layout responsivo para celular e desktop
- Deploy via Vercel

---

## 🛠️ Tecnologias utilizadas

- React
- TypeScript
- Vite
- TailwindCSS
- Firebase Authentication
- Firestore Database
- Lucide React
- Vercel

---

## 📁 Estrutura do projeto

```txt
public/
  favicon.svg
  logo-ile.png

src/
  components/
    AddResourceItemModal.tsx
    AddResourceSectionModal.tsx
    AttendanceControl.tsx
    BackToTopButton.tsx
    CurrencyInput.tsx
    ReportModal.tsx
    ResourceForm.tsx
    Section.tsx

  config/
    firebase.ts

  data/
    staticData.ts

  utils/
    formatters.ts
    normalizeName.ts
    report.ts

  App.css
  App.tsx
  index.css
  main.tsx

.env.example
.gitignore
eslint.config.js
index.html
package-lock.json
package.json
README.md
tsconfig.app.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

---

## 🔐 Variáveis de ambiente

O projeto usa variáveis de ambiente para proteger configurações sensíveis e evitar dados fixos diretamente no código.

Crie um arquivo **`.env.local`** na raiz do projeto:

```env
VITE_ADMIN_PIN=seu_pin_admin

VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

Também existe o arquivo:

```txt
.env.example
```

Ele serve como modelo para indicar quais variáveis são necessárias, sem expor valores reais.

> O arquivo `.env.local` não deve ser enviado para o GitHub.

---

## ▶️ Como rodar o projeto localmente

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/obrigacao-pretos-velhos.git
```

Entre na pasta:

```bash
cd obrigacao-pretos-velhos
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` com as variáveis necessárias.

Rode o projeto:

```bash
npm run dev
```

Acesse no navegador:

```txt
http://localhost:5173
```

---

## 🧪 Build de produção

Para gerar o build:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

---

## 🔥 Firebase

O projeto utiliza Firebase para:

- Login anônimo
- Armazenamento de confirmações de presença
- Armazenamento de valores dos materiais
- Armazenamento de pagamentos
- Armazenamento de comprovantes
- Armazenamento de tópicos e cards dinâmicos
- Controle de responsáveis por item
- Controle de presença real no dia da obrigação
- Configuração da data oficial

Coleções utilizadas:

```txt
votes
prices
settings
extra_items
resource_items
resource_sections
payments
attendance
```

---

## 👑 Modo administrador

O modo administrador permite:

- Definir a data oficial
- Editar valores dos materiais
- Registrar pagamentos
- Visualizar e editar links de comprovantes
- Registrar presença real no dia da obrigação
- Criar tópicos
- Remover tópicos criados
- Criar cards
- Remover cards criados
- Adicionar responsáveis por item
- Remover responsáveis por item
- Gerar relatório final
- Gerar PDF do relatório final com os links dos comprovantes

O PIN de administrador é definido pela variável:

```env
VITE_ADMIN_PIN
```

Usuários comuns conseguem visualizar o dashboard e a área financeira, mas não veem os links de comprovantes nem os controles administrativos.

---

## 📊 Relatório final

O relatório final consolida:

- Data oficial
- Total de pessoas confirmadas
- Pessoas na cota
- Pessoas fora da cota
- Custo total dos materiais
- Valor por pessoa
- Total arrecadado
- Pendência geral
- Status de pagamento
- Status de comparecimento
- Itens levados por pessoa
- Materiais organizados por tópico
- Links dos comprovantes
- Observações finais

O relatório pode ser visualizado no app e exportado como PDF.

> O relatório final é uma funcionalidade administrativa.

---

## 🚀 Deploy

O projeto está preparado para deploy na Vercel.

Na Vercel, cadastre as mesmas variáveis do `.env.local` em:

```txt
Project Settings → Environment Variables
```

Variáveis necessárias:

```txt
VITE_ADMIN_PIN
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Para testar branches antes de publicar na versão principal, utilize os deploys de **Preview** da Vercel.

---

## 🌱 Branches e deploy

Durante o desenvolvimento, alterações podem ser feitas em uma branch separada da `main`.

Exemplo:

```txt
refactor/organiza-estrutura
```

Na Vercel:

- `main` gera o deploy de produção
- outras branches geram deploys de preview

Antes de fazer merge para a `main`, recomenda-se testar tudo no Preview da branch.

---

## ⚠️ Observação sobre dados

Mesmo em deploys de Preview, o app pode usar o mesmo Firebase configurado nas variáveis de ambiente.

Isso significa que alterações feitas em Preview podem afetar os dados reais do banco, como:

- criação de tópicos
- remoção de cards
- alteração de pagamentos
- alteração de comprovantes
- marcação de presença
- responsáveis por item

---

## 🧹 Boas práticas aplicadas

- Separação de componentes
- Configuração do Firebase em arquivo próprio
- Utilitários separados para formatação, normalização e relatório
- Variáveis de ambiente para dados sensíveis
- `.env.local` fora do GitHub
- `.env.example` como modelo
- Estrutura limpa de pastas
- Componentes reutilizáveis
- Build testado antes do deploy
- Comprovantes restritos ao modo administrador
- Relatório tratado como funcionalidade administrativa

---

## 📌 Status do projeto

Primeira versão funcional concluída.

Funcionalidades principais implementadas:

```txt
✅ Dashboard
✅ Financeiro
✅ Presença
✅ Modo administrador
✅ Tópicos dinâmicos
✅ Cards dinâmicos
✅ Responsáveis por item
✅ Comprovantes restritos ao ADM
✅ Relatório final
✅ PDF
✅ Firebase
✅ Deploy na Vercel
```

---

## 🌿 Saudação

Saravá Pretos Velhos.  
Adorei as Almas.