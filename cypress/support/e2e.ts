// Importa o arquivo de comandos customizados (onde ficam seus scripts globais)
import './commands';
beforeEach(() => {
  // Exemplo: Limpar o localStorage ou cookies antes de cada teste começar
  cy.clearLocalStorage();
  
  // Se a regra do teste permitisse, um cy.visit() global poderia ficar aqui
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // Retornar false aqui impede o Cypress de falhar o teste 
  // devido a erros originados no código da própria aplicação (App Bugs de front-end)
  return false;
});

