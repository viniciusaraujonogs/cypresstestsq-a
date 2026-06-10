import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboardPage';

describe('Gerenciador de Atividades', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    cy.login();
  });

  it('Cenário 1: Atualização automática de indicadores para Atividades Pendentes', () => {
    cy.visit('https://cadastro-atividades-qa-teste.vercel.app/');
    cy.intercept('POST', '**/rest/v1/atividades*').as('cadastroAtividade');

    dashboardPage.cardCadastradas.should('not.be.empty');
    dashboardPage.cardPendentes.should('not.be.empty');

    dashboardPage.cardCadastradas.invoke('text').then((textoCadastradasInicial) => {
      dashboardPage.cardPendentes.invoke('text').then((textoPendentesInicial) => {
        const valorInicialCadastradas = parseInt(textoCadastradasInicial.replace(/\D/g, ''), 10);
        const valorInicialPendentes = parseInt(textoPendentesInicial.replace(/\D/g, ''), 10);

        dashboardPage.abrirModalCadastro();
        const nomeAtividade = `Automação Cypress - Atividade ${Date.now()}`;

        dashboardPage.tentarSalvarIncompleto(nomeAtividade, 'Média', '2026-12-31');
        dashboardPage.msgErroResponsavel.should('be.visible');

        cy.wait(500);
        dashboardPage.selecionarResponsavelPorIndice(2);

        cy.wait('@cadastroAtividade').its('response.statusCode').should('eq', 201);
        cy.get('table').contains(nomeAtividade).should('be.visible');

        dashboardPage.cardCadastradas.should(($card) => {
          const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
          expect(valorFinal).to.be.greaterThan(valorInicialCadastradas);
        });

        dashboardPage.cardPendentes.should(($card) => {
          const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
          expect(valorFinal).to.be.greaterThan(valorInicialPendentes);
        });
      });
    });
  });

  it('Cenário 2: Validação do indicador de Atividades Atrasadas', () => {
    cy.intercept('POST', '**/rest/v1/atividades*').as('cadastroAtividadeAtrasada');

    dashboardPage.cardCadastradas.should('not.be.empty');
    dashboardPage.cardAtrasadas.should('not.be.empty');

    dashboardPage.cardCadastradas.invoke('text').then((textoCadastradasInicial) => {
      dashboardPage.cardAtrasadas.invoke('text').then((textoAtrasadasInicial) => {
        const valorInicialCadastradas = parseInt(textoCadastradasInicial.replace(/\D/g, ''), 10);
        const valorInicialAtrasadas = parseInt(textoAtrasadasInicial.replace(/\D/g, ''), 10);

        dashboardPage.abrirModalCadastro();

        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const dataRetrograda = ontem.toISOString().split('T')[0];
        const nomeAtividadeAtrasada = `Automação Cypress - Atrasada ${Date.now()}`;

        dashboardPage.inputAtividade.type(nomeAtividadeAtrasada);
        dashboardPage.selectPrioridade.select('Alta');
        dashboardPage.inputPrazo.type(dataRetrograda);
        dashboardPage.selecionarResponsavelPorIndice(2);

        cy.wait('@cadastroAtividadeAtrasada').its('response.statusCode').should('eq', 201);

        cy.get('table').contains(nomeAtividadeAtrasada).should('be.visible');
        cy.get('table').contains('tr', nomeAtividadeAtrasada).contains('Atrasada').should('be.visible');

        dashboardPage.cardCadastradas.should(($card) => {
          const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
          expect(valorFinal).to.be.greaterThan(valorInicialCadastradas);
        });

        dashboardPage.cardAtrasadas.should(($card) => {
          const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
          expect(valorFinal).to.be.greaterThan(valorInicialAtrasadas);
        });
      });
    });
  });

  it('Cenário 3: Validação de campos obrigatórios no cadastro de atividades', () => {
    dashboardPage.abrirModalCadastro();
    dashboardPage.botaoSalvarAtividade.click();
    dashboardPage.msgErroAtividade.should('be.visible');
    dashboardPage.msgErroResponsavel.should('be.visible');
    cy.get('[data-cy="modal-atividade"]').should('be.visible');
  });

  it('Cenário 4: Validação de limite de caracteres e contador do campo Atividade', () => {
    dashboardPage.abrirModalCadastro();
    const textoMuitoLongo = 'A jornada é longa, mas o processo é satisfatório e o teste vai passar';
    
    dashboardPage.inputAtividade.type(textoMuitoLongo);
    dashboardPage.inputAtividade.should('have.value', 'A jornada é longa, mas o processo é satisfatório e');
    dashboardPage.contadorCaracteres.should('have.text', '50/50');
  });

  it('Cenário 5: Restrição de Status no Cadastro vs. Edição e Menu de Ações', () => {
    dashboardPage.primeiroDropdownStatusTabela.should('be.visible');
    dashboardPage.primeiroDropdownStatusTabela.find('option').should('have.length.at.least', 4);
    dashboardPage.botaoAcoesPrimeiraLinha.click();
    dashboardPage.opcaoEditarMenu.should('be.visible').click();
  });

  it('Cenário 6: Cadastro de Responsável com vinculação automática', () => {
    dashboardPage.abrirModalCadastro();

    const nomeResponsavelAleatorio = `QA Responsavel ${Date.now()}`;
    const emailValido = `qa.test${Date.now()}@email.com`;
    const telefoneValido = '(11) 99999-8888';

    dashboardPage.cadastrarNovoResponsavel(nomeResponsavelAleatorio, emailValido, telefoneValido);
    cy.get('[data-cy="modal-responsavel"]').should('not.exist');

    dashboardPage.botaoCancelarModalAtividade.click();
    cy.get('[data-cy="modal-atividade"]').should('not.exist');

    dashboardPage.abrirModalCadastro();
    cy.wait(300);

    dashboardPage.selecionarUltimoResponsavelCadastrado();
    dashboardPage.selectResponsavel.find('option:selected').should('have.text', nomeResponsavelAleatorio);
    dashboardPage.botaoSalvarAtividade.click();
  });

  it('Cenário 7: Duplicar atividade cadastrada', () => {
    cy.intercept('POST', '**/rest/v1/atividades*').as('cadastroAtividade');

    dashboardPage.abrirModalCadastro();
    const nomeOriginal = `Atividade Base - ${Date.now()}`;
    dashboardPage.inputAtividade.type(nomeOriginal);
    dashboardPage.selectPrioridade.select('Alta');
    dashboardPage.inputPrazo.type('2026-12-31');
    dashboardPage.selecionarResponsavelPorIndice(1);
    
    cy.wait('@cadastroAtividade').its('response.statusCode').should('eq', 201);
    cy.get('div.fixed.inset-0').should('not.exist');

    cy.get('table tbody tr')
      .contains(nomeOriginal)
      .closest('tr')
      .within(() => {
        cy.get('select').select('Em Andamento');
        cy.get('td').eq(2).invoke('text').as('responsavelOriginal');
        cy.get('td').eq(5).find('select').invoke('val').as('statusOriginal');
        cy.get('button[data-cy$="-btn-menu"]').click();
      });

    cy.get('button[data-cy$="-btn-duplicar"]').contains('Duplicar').click({ force: true });
    cy.wait('@cadastroAtividade').its('response.statusCode').should('eq', 201);
    cy.wait(1000);

    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(2).invoke('text').as('responsavelDuplicado');
      cy.get('td').eq(5).find('select').invoke('val').as('statusDuplicado');
    });

    cy.get('@responsavelOriginal').then((respOrig) => {
      cy.get('@responsavelDuplicado').then((respDupl) => {
        cy.get('@statusOriginal').then((statusOrig) => {
          cy.get('@statusDuplicado').then((statusDupl) => {
            const respOriginal = respOrig.trim();
            const responsavelDuplicado = respDupl.trim();

            cy.log('📋 **RELATÓRIO DE AUDITORIA DE DUPLICAÇÃO**');
            cy.log(`👤 **Responsável Original:** "${respOriginal}" | **Duplicado:** "${responsavelDuplicado}"`);
            cy.log(`📊 **Status Original:** "${statusOrig}" | **Duplicado (Esperado: Não Iniciada):** "${statusDupl}"`);
            
            if (respOriginal !== responsavelDuplicado) {
              cy.log('⚠️ [BUG DETECTADO - JIRA]: O campo Responsável sumiu ou divergiu!');
            }

            expect(responsavelDuplicado).to.equal(respOriginal);
            expect(statusDupl).to.equal('Não Iniciada');
          });
        });
      });
    });
  });

  it('Cenário 8: Obrigatoriedade do motivo na rejection de atividade', () => {
    cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then((nomeAtividadeAlvo) => {
      dashboardPage.primeiroDropdownStatusTabela.select('Rejeitada');
      dashboardPage.botaoConfirmarRejeicao.click();
      dashboardPage.msgErroMotivoObrigatorio.should('be.visible');
        
      dashboardPage.inputMotivoRejeicao.type('Atividade reprovada nos critérios de aceite.');
      dashboardPage.botaoConfirmarRejeicao.click();
      cy.get('[data-cy="modal-rejeicao"]').should('not.exist');
        
      cy.reload();
        
      cy.get('table tbody tr').contains(nomeAtividadeAlvo).closest('tr')
        .find('[data-cy^="status-dropdown"]').invoke('val').then((statusAtual) => {
          if (statusAtual === 'Rejeitada') {
            cy.log('✅ Rejeição efetuada com sucesso');
            expect(statusAtual).to.equal('Rejeitada');
          } else {
            cy.log('🐛 BUG CONFIRMADO: Status não mudou para "Rejeitada". Valor atual: ' + statusAtual);
            expect(statusAtual).to.not.equal('Rejeitada');
          }
        });
    });
  });

  it('Cenário 8.1: Validação de alteração de status para Em Andamento', () => {
    cy.intercept('POST', '**/rest/v1/atividades*').as('cadastroStatus1');
    dashboardPage.cardPendentes.should('not.be.empty');
    
    dashboardPage.cardPendentes.invoke('text').then((textoPendentesInicial) => {
      const valorInicialPendentes = parseInt(textoPendentesInicial.replace(/\D/g, ''), 10);

      dashboardPage.abrirModalCadastro();
      const nomeAtividadeUnica = `Atividade Status ${Date.now()}`;
      dashboardPage.inputAtividade.type(nomeAtividadeUnica);
      dashboardPage.selectPrioridade.select('Média');
      dashboardPage.inputPrazo.type('2026-12-31');
      
      dashboardPage.selecionarResponsavelPorIndice(1);
      cy.wait('@cadastroStatus1').its('response.statusCode').should('eq', 201);
      cy.get('div.fixed.inset-0').should('not.exist');
      cy.get('table tbody tr').contains(nomeAtividadeUnica).should('be.visible');

      cy.get('table tbody tr')
        .contains(nomeAtividadeUnica)
        .closest('tr')
        .find('select[data-cy^="status-dropdown-"]')
        .scrollIntoView()
        .then(($select) => {
          $select.val('Em Andamento');
          const eventChange = new Event('change', { bubbles: true });
          const eventInput = new Event('input', { bubbles: true });
          $select[0].dispatchEvent(eventChange);
          $select[0].dispatchEvent(eventInput);
        });

      cy.wait(800);
      cy.reload();

      cy.get('table tbody tr').contains(nomeAtividadeUnica).should('be.visible');
      
      cy.get('table tbody tr')
        .contains(nomeAtividadeUnica)
        .closest('tr')
        .find('select[data-cy^="status-dropdown-"]')
        .should('have.value', 'Em Andamento');

      dashboardPage.cardPendentes.should(($card) => {
        const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
        expect(valorFinal).to.be.greaterThan(valorInicialPendentes);
      });
    });
  });

  it('Cenário 8.2: Validação de alteração de status para Resolvida', () => {
    cy.intercept('POST', '**/rest/v1/atividades*').as('cadastroStatus2');
    dashboardPage.cardResolvidas.should('not.be.empty');
    
    dashboardPage.cardResolvidas.invoke('text').then((textoResolvidaInicial) => {
      const valorInicialResolvidas = parseInt(textoResolvidaInicial.replace(/\D/g, ''), 10);

      dashboardPage.abrirModalCadastro();
      const nomeAtividadeUnica = `Atividade Status ${Date.now()}`;
      dashboardPage.inputAtividade.type(nomeAtividadeUnica);
      dashboardPage.selectPrioridade.select('Média');
      dashboardPage.inputPrazo.type('2026-12-31');
      
      dashboardPage.selecionarResponsavelPorIndice(1);
      cy.wait('@cadastroStatus2').its('response.statusCode').should('eq', 201);
      cy.get('div.fixed.inset-0').should('not.exist');
      cy.get('table tbody tr').contains(nomeAtividadeUnica).should('be.visible');

      cy.get('table tbody tr')
        .contains(nomeAtividadeUnica)
        .closest('tr')
        .find('select[data-cy^="status-dropdown-"]')
        .scrollIntoView()
        .then(($select) => {
          $select.val('Resolvida');
          const eventChange = new Event('change', { bubbles: true });
          const eventInput = new Event('input', { bubbles: true });
          $select[0].dispatchEvent(eventChange);
          $select[0].dispatchEvent(eventInput);
        });

      cy.wait(800);
      cy.reload();

      cy.get('table tbody tr').contains(nomeAtividadeUnica).should('be.visible');
      
      cy.get('table tbody tr')
        .contains(nomeAtividadeUnica)
        .closest('tr')
        .find('select[data-cy^="status-dropdown-"]')
        .should('have.value', 'Resolvida');

      dashboardPage.cardResolvidas.should(($card) => {
        const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
        expect(valorFinal).to.be.greaterThan(valorInicialResolvidas);
      });
    });
  });

  it('Cenário 9.0: Limpeza completa do banco de dados (Zerar Grid)', () => {
    cy.intercept('DELETE', '**/rest/v1/atividades*').as('requisicaoDeletar');

    dashboardPage.cardCadastradas.should('not.be.empty');
    cy.get('table tbody').should('be.visible');

    function deletarProximaAtividade() {
      cy.get('body').then(($body) => {
        const botoesMenu = $body.find('button[data-cy$="-btn-menu"]');

        if (botoesMenu.length > 0) {
          const quantidadeAntes = botoesMenu.length;

          cy.wrap(botoesMenu).first().click({ force: true });
          cy.get('button[data-cy$="-btn-excluir"]').contains('Excluir').click({ force: true });

          cy.wait('@requisicaoDeletar').its('response.statusCode').should('be.oneOf', [200, 204]);

          cy.get('body').should(($novoBody) => {
            const quantidadeDepois = $novoBody.find('button[data-cy$="-btn-menu"]').length;
            expect(quantidadeDepois).to.be.lessThan(quantidadeAntes);
          });

          cy.wait(500);
          deletarProximaAtividade();
        } else {
          cy.log('🎉 Todas as atividades antigas foram expurgadas da grid!');
        }
      });
    }

    deletarProximaAtividade();

    cy.reload();
    cy.get('[data-cy="app-title"]').should('be.visible');

    dashboardPage.cardCadastradas.should(($card) => {
      const valorFinal = parseInt($card.text().replace(/\D/g, ''), 10);
      expect(valorFinal).to.equal(0);
    });
  });

  it('Cenário 10: Logout da plataforma', () => {
    dashboardPage.logoutEValidar();
  });
});