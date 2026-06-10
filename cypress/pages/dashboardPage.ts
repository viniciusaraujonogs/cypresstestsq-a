export class DashboardPage {
  get cardCadastradas(): Cypress.Chainable { 
    return cy.get('[data-cy="summary-cards"] p.text-\\[28px\\]').eq(0); 
  }
  
  get cardResolvidas(): Cypress.Chainable { 
    return cy.get('[data-cy="summary-cards"] p.text-\\[28px\\]').eq(1); 
  }

  get cardPendentes(): Cypress.Chainable { 
    return cy.get('[data-cy="summary-cards"] p.text-\\[28px\\]').eq(2); 
  }
  
  get cardAtrasadas(): Cypress.Chainable { 
    return cy.get('[data-cy="summary-cards"] p.text-\\[28px\\]').eq(3); 
  }

  get primeiroDropdownStatusTabela(): Cypress.Chainable { return cy.get('[data-cy="status-dropdown-0"]'); }
  get botaoAcoesPrimeiraLinha(): Cypress.Chainable { return cy.get('table tbody tr').first().find('button, svg, i').last(); }
  get opcaoEditarMenu(): Cypress.Chainable { return cy.contains('Editar'); }
  get opcaoDuplicarMenu(): Cypress.Chainable { return cy.contains('Duplicar'); }

  get inputAtividade(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade"] input[type="text"]').first(); }
  get selectPrioridade(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade"] select').eq(1); }
  get inputPrazo(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade"] input[type="date"]'); }
  get selectResponsavel(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade-responsavel"]'); }
  get contadorCaracteres(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade"]').contains(new RegExp('\\d+/50')); }
  get botaoSalvarAtividade(): Cypress.Chainable { return cy.get('[data-cy="btn-cadastrar"], button:contains("Cadastrar")').last(); }
  get botaoCancelarModalAtividade(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade"]').contains('button', 'Cancelar'); }
  get selectStatusModalEdicao(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade-status"]'); } 
  
  get msgErroResponsavel(): Cypress.Chainable { return cy.contains('Responsável é obrigatório'); }
  get msgErroAtividade(): Cypress.Chainable { return cy.contains('Atividade é obrigatória'); }
  get msgErroMotivoObrigatorio(): Cypress.Chainable { return cy.contains('Informe o motivo da rejeição'); }

  get botaoAbrirSubmodalResponsavel(): Cypress.Chainable { return cy.get('[data-cy="modal-atividade-btn-novo-responsavel"]'); }
  get inputNovoResponsavelNome(): Cypress.Chainable { return cy.get('[data-cy="modal-responsavel"] input').eq(0); }
  get inputNovoResponsavelEmail(): Cypress.Chainable { return cy.get('[data-cy="modal-responsavel"] input').eq(1); }
  get inputNovoResponsavelTelefone(): Cypress.Chainable { return cy.get('[data-cy="modal-responsavel"] input').eq(2); }
  get botaoSalvarSubmodalResponsavel(): Cypress.Chainable { return cy.get('[data-cy="modal-responsavel-btn-salvar"]'); }

  get inputMotivoRejeicao(): Cypress.Chainable { return cy.get('[data-cy="modal-rejeicao"] textarea, [data-cy="modal-rejeicao"] input').first(); }
  get botaoConfirmarRejeicao(): Cypress.Chainable { return cy.get('[data-cy="modal-rejeicao"] button:contains("Confirmar Rejeição")'); }
  get botaoLogout(): Cypress.Chainable { return cy.get('[data-cy="btn-logout"]'); }
  get modalAuth(): Cypress.Chainable { return cy.get('[data-cy="modal-auth"]'); }

  abrirModalCadastro(): void {
    cy.get('button:contains("Cadastrar Atividade")').click();
  }

  tentarSalvarIncompleto(descricao: string, prioridade: string, prazo: string): void {
    this.inputAtividade.type(descricao);
    this.selectPrioridade.select(prioridade);
    this.inputPrazo.type(prazo);
    this.botaoSalvarAtividade.click();
  }

  selecionarResponsavelPorIndice(posicao: number): void {
    this.selectResponsavel.find('option').eq(posicao).then((opcao) => {
      this.selectResponsavel.select(opcao.val() as string);
    });
    this.botaoSalvarAtividade.click();
  }

  cadastrarNovoResponsavel(nome: string, email: string, telefone: string): void {
    this.botaoAbrirSubmodalResponsavel.click();
    this.inputNovoResponsavelNome.type(nome);
    this.inputNovoResponsavelEmail.type(email);
    this.inputNovoResponsavelTelefone.type(telefone);
    this.botaoSalvarSubmodalResponsavel.click();
  }

  selecionarUltimoResponsavelCadastrado(): void {
    this.selectResponsavel.find('option').then((opcoes) => {
      const ultimoIndice = opcoes.length - 1;
      this.selectResponsavel.select(opcoes.eq(ultimoIndice).val() as string);
    });
  }
    
  fazerLogout(): void {
    this.botaoLogout.click();
  }
    
  validarModalAuth(): void {
    this.modalAuth.should('be.visible');
    this.modalAuth.contains('Gerenciador de Atividades').should('be.visible');
    this.modalAuth.contains('Entrar').should('be.visible');
    this.modalAuth.contains('Cadastrar').should('be.visible');
  }
    
  logoutEValidar(): void {
    this.fazerLogout();
    this.validarModalAuth();
  }
}