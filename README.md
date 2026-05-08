# ☕ Obrigação Pretos Velhos

Dashboard desenvolvido para auxiliar na organização da **Obrigação de Pretos Velhos 2026**, reunindo em um só lugar o controle de presença, materiais, contribuições financeiras, comparecimento e relatório final em PDF.

O projeto foi criado com foco em uso interno, praticidade no celular e facilidade para acompanhar a organização da obrigação de forma clara, visual e colaborativa.

---

## 🔗 Projeto online

Acesse o projeto publicado na Vercel:

[Obrigação Pretos Velhos](COLE_AQUI_O_LINK_DA_VERCEL)

---

## 📌 Sobre o projeto

O sistema permite organizar as informações principais da obrigação, como:

- quem confirmou presença;
- quais datas foram votadas;
- qual data foi definida como oficial;
- quem está dentro da cota financeira;
- quem está fora da cota, mas será considerado na presença;
- quanto cada pessoa pagou;
- quais pagamentos ainda estão pendentes;
- quem compareceu ou não compareceu;
- quais materiais serão levados;
- geração de relatório final com logo e opção de salvar em PDF.

---

## ✨ Funcionalidades

- Confirmação de presença por data;
- Bloqueio de confirmação duplicada na mesma data;
- Definição de data oficial pelo modo administrador;
- Controle de materiais e responsáveis;
- Cálculo automático da cota por pessoa;
- Separação entre pessoas na cota e pessoas sem cota;
- Controle financeiro individual;
- Registro de comprovantes;
- Controle de comparecimento com status:
  - Foi;
  - Não foi;
  - Limpar;
- Relatório final com:
  - logo do Ilè;
  - resumo geral;
  - resumo financeiro;
  - resumo de comparecimento;
  - status dos pagamentos;
  - detalhamento por pessoa;
  - pessoas sem cota;
  - materiais por categoria;
  - observações finais;
- Geração de relatório para salvar como PDF;
- Layout responsivo para celular e desktop;
- Botão flutuante para voltar ao topo da página.

---

## 🛠️ Tecnologias utilizadas

- React;
- TypeScript;
- Vite;
- Firebase Authentication;
- Firestore Database;
- Tailwind CSS;
- Lucide React;
- Vercel.

---

## 📸 Prints do projeto

> Adicione os prints na pasta `docs/images` e atualize os caminhos abaixo se necessário.

### Dashboard

![Dashboard](./docs/images/dashboard.png)

### Financeiro

![Financeiro](./docs/images/financeiro.png)

### Relatório

![Relatório](./docs/images/relatorio.png)

### Versão mobile

![Mobile](./docs/images/mobile.png)

---

## 🚀 Como rodar o projeto localmente

### 1. Clone o repositório

```bash
git clone link-do-repositorio
cd nome-do-projeto
npm install
npm run dev
git clone COLE_AQUI_O_LINK_DO_REPOSITORIO
