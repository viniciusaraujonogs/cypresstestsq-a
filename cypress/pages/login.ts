export class LoginPage {
  get inputEmail(): Cypress.Chainable { return cy.get('input[type="email"], input[placeholder*="email"]').first(); }
  get inputSenha(): Cypress.Chainable { return cy.get('input[type="password"]').first(); }
  get botaoEntrar(): Cypress.Chainable { return cy.get('[data-cy="btn-entrar"]').contains(/Entrar|Acessar/i); }

  acessarAplicacao(): void {
    
    cy.visit('https://cadastro-atividades-qa-teste.vercel.app/', { failOnStatusCode: false });
  }

  realizarLogin(email: string, senha: string): void {
    this.inputEmail.type(email);
    this.inputSenha.type(senha);
    this.botaoEntrar.click();
  }
}