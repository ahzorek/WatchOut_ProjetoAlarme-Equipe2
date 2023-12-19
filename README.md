# A-clock-thingy

## Configuração Inicial
Servidor NodeJS criado e operacional.

Endpoint: /test

## Endpoints do Backend
- Implementados endpoints para:
   - Clima: `/weather?city={city}`
   - Horário Atual: `/current-time`
   - Data Atual: `/current-date`
   - Mensagem de Boas-Vindas: `/welcome-message`
   - Configuração do Usuário: `/user-config`
   - Configuração Atual do Usuário: `/current-config`

## Telas do Frontend
- Desenvolvidas telas:
   - Tela 1: Principal - `/dashboard`
   - Tela 2: Config - `/config`
   - Tela 3: Alarm - `/alarms`
   - Tela 4: New Alarm - `/new-alarm`


## Integração e Funcionalidades

   - Integração de Endpoints com Frontend.
   - Atualização automática da Tela 1 a cada 15 minutos.
   - Sincronização do relógio a cada hora cheia.
   - Atualização automática do campo de data na Tela 1 diariamente às 12:00:00.
   -  Exibição de mensagem personalizada na Tela 1 com base na hora do dia.


## Estilização e Responsividade

  - Refinamento da estilização das telas de acordo com o protótipo.
  - Garantia de responsividade em diferentes tamanhos de tela.


## Alarmes e Notificações

  - Programação de alarmes na Tela 4.
  - Desabilitação individual de alarmes na Tela 3.
  - Reprodução de ringtone ao disparar um alarme na Tela 1.
  - Botão multi-funcional na Tela 1 para desligar alarmes ou chamar a Tela 3.


## Configurações do Usuário

  - Salvar configurações do usuário na Tela 2.
  - Carregar configurações do usuário ao abrir a Tela 2.


## Integração com APIs Externas (HG_API_KEY)
  - Obtido hora do nascer do sol para mensagem personalizada.
  - Integração com serviços de obtenção de ringtones para alarmes.

## Documentação e Testes

  - Documentação completa de funções, endpoints e estilos.
  - Realização de testes unitários para garantir robustez.


### Projeto em andamento...