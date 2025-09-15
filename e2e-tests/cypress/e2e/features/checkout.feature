@needsLogin @checkout @smoke
Feature: Tarefa 2 - Fluxo de checkout completo
  Como usuário logado
  Quero comprar um item
  Para finalizar um pedido com sucesso

  Scenario: Comprar um item com sucesso
    When eu adiciono o produto "Sauce Labs Backpack" ao carrinho
    And eu vou para o carrinho e inicio o checkout
    And eu preencho meus dados e avanço para o resumo
    And eu finalizo a compra
    Then devo ver a confirmação de pedido concluído
