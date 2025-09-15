@login @smoke
Feature: Tarefa 1 - Login e navegação até um formulário
  Como usuário do SauceDemo
  Quero realizar login
  Para acessar a lista de produtos e seguir para checkout

  Scenario: Login válido e navegação até o formulário de checkout
    Given que abro o aplicativo
    When eu faço login com credenciais válidas
    Then devo ver a lista de produtos
