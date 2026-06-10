export {};

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', () => {
  
  cy.visit('https://cadastro-atividades-qa-teste.vercel.app/');

  
  cy.get('[data-cy="input-email-login"]', { timeout: 10000 }).should('be.visible');
  
  // 3. Preenche os campos (sem delay acelerado para o React não se perder)
  cy.get('[data-cy="input-email-login"]').clear().type('vinicius.araujo0397@outlook.com');
  cy.get('[data-cy="input-senha-login"]').clear().type('@Teste0231');
  
  
  cy.wait(500);

  // 4. Força o clique no botão de entrar para quebrar o bloqueio de pointer-events
  cy.get('[data-cy="btn-entrar"]').click({ force: true });

  
  cy.get('[data-cy="btn-entrar"]', { timeout: 15000 }).should('not.exist');
  cy.get('[data-cy="app-title"]').should('be.visible');
});