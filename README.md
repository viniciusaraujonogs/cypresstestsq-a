## 🛠️ Guia Operacional: Instalação e Execução Local

Siga as instruções abaixo para clonar, configurar e executar a suíte de testes em seu ambiente de desenvolvimento local.

### 📌 Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* **Node.js** (Versão v18 ou superior recomendada)
* **Git**

### 📥 Clonagem e Instalação

Abra o seu terminal e execute os comandos abaixo:

```bash
# Clonar o repositório oficial do projeto
git clone [https://github.com/viniciusaraujonogs/cypresstestedq-a.git](https://github.com/viniciusaraujonogs/cypresstestedq-a.git)

# Acessar a pasta raiz do projeto clonado
cd cypresstestedq-a

# Instalar as dependências do projeto de forma limpa (Cypress, TypeScript, etc.)
npm ci

🏃 Execução dos Testes Automatizados
Você pode executar os testes em dois modos distintos:

Modo Interativo (Cypress Runner UI)


Bash
npx cypress open

Modo Headless (Execução em Background via Terminal)


Bash
npx cypress run --browser chrome
