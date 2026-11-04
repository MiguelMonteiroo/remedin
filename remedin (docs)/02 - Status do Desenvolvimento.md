# 02 - Status do Desenvolvimento e Roadmap

> Atualização de 28/10/2026: a identidade coral e os temas claro/escuro estão em implementação, não concluídos. O provider de tema já existe, mas as telas ainda usam principalmente as cores antigas. Acompanhe as pendências em [[../docs/superpowers/plans/2026-10-28-identidade-coral-temas|plano de identidade coral e temas]]. O teste de linha única do horário pendente e o erro de tipo do resumo diário foram corrigidos; a validação visual em Android permanece pendente.

As variantes do botão compartilhado, os indicadores de status e a barra de navegação já recebem as cores do tema ativo. Os demais componentes e telas ainda precisam ser migrados em conjuntos de texto e fundo. A prévia ilustrativa está em `design/identidade/paleta/coral/interface/componentes.html`. Um teste de integração com tela de alarme simulada confirma que o provider de tema envolve a abertura a frio sem carregar o provider do banco; não substitui teste do alarme em dispositivo.

O cartão de próxima dose da tela Hoje acompanha os dois temas.

Atualização de implementação: os componentes principais da tela Hoje, a tela React Native de alarme, a lista de medicamentos, o histórico, o perfil, os detalhes e os formulários receberam cores de tema. O onboarding principal também recebeu a paleta, e recursos vetoriais do ícone coral foram adicionados ao Android. O trabalho permanece parcial: componentes legados ainda precisam de revisão, e a compilação Android e a aparência do ícone e das telas não foram verificadas em dispositivo.

## 📊 Status Atual do Projeto

O app passou por uma grande fase de estabilização e rebranding para **Remedin**, unificando o sistema de alarmes nativos e tratamento de tela cheia/bloqueio.

---

## ✅ Etapas Concluídas
- [x] **Rebranding para Remedin**: Atualização de identidade visual, tipografia e nomenclatura.
- [x] **Onboarding de Primeiro Uso (First-run Onboarding)**: Apresentação do app, solicitação progressiva de permissões do sistema e cadastro de perfil local.
- [x] **Arquitetura de Dose Alarms Nativos**:
  - Alarme nativo unificado (`ForegroundService` + `AlarmManager.setExactAndAllowWhileIdle`).
  - Toque sonoro com stream de alarme configurado.
  - Suporte à exibição em tela de bloqueio e restauração do alarme ativo após desbloqueio.
  - Agrupamento inteligente em **Dose Windows** (quando mais de um remédio é no mesmo horário).
- [x] **Pre-alerts**: Notificações suaves 5 minutos antes da dose programada.
- [x] **Histórico e Adesão Diária**:
  - Registro de doses tomadas, puladas e adiadas (*snooze*).
  - Cálculo de adesão diária baseado exclusivamente no dia local.
  - Cascade delete na exclusão de medicamento.
- [x] **Tema e i18n**: Design system refinado com suporte a Dark/Light mode e i18n em PT-BR.

- [x] **Nova Tela de Onboarding Playful & Native App UX (`preview/onboarding-welcome.html`)**:
  - Mascote Canônica integrada em modo cinematográfico *edge-to-edge* com efeito Ken Burns dinâmico por etapa (`transform-origin: top center`), com enquadramento proporcional e respiro seguro em relação à barra de navegação.
  - Substituição de caixas translúcidas genéricas por **Bottom Sheet estrutural sólida** em tom Creme Quente (`--cream-warm`), inspirada em apps como Airbnb e Uber.
  - Navegação nativa com botão "Voltar" no topo esquerdo e barra de progresso em pílula elástica interativa.
  - Botão de ação principal tátil e com espessura 3D (*press-down* físico no estilo Duolingo).
  - Transições horizontais suaves para troca de textos e atualização dinâmica de badges.
  - 100% integrado com a família de ícones Iconoir e livre de emojis.
- [x] **Portar Redesign para React Native**: Implementar os componentes consolidados de `onboarding-welcome.html` na tela oficial `src/screens/onboarding/WelcomeScreen.tsx`.
- [x] **Clean Edition (Design System v2) — Protótipo Aprovado**: Redesign completo da Home com estética arejada, tab bar flutuante, cards limpos e paleta Bento. Protótipo em `preview/home.html` aprovado em 23/08/2026 (ADR 0013).
- [x] **Aba Perfil — Personalização de Foto de Perfil & Seletor de Avatares**:
  - Geração de 4 avatares exclusivos no estilo canônico minimalista flat 2D (Cachorro, Coruja, Gato e Urso) com fundos na paleta Bento do Remedin.
  - Abertura de Bottom Sheet Modal ao tocar no card do perfil (`profile-card`).
  - Suporte à inicial do nome com paleta de 6 cores em grade 3x2 (Menta, Azul Céu, Lilás, Pêssego, Amarelo Solar e Azul Marinho) com atualização em tempo real.
- [x] **Aba Perfil — Configuração Completa de Lembretes**:
  - Estruturação fiel dos 6 controles nativos de lembretes na ordem de dependência:
    1. *Receber notificações* (Toggle interativo)
    2. *Tocar no silencioso* (Toggle interativo)
    3. *Avisar no horário exato* (Ação direta: Revisar)
    4. *Alarme em tela cheia* (Toggle interativo)
    5. *Detalhes na tela bloqueada* (Toggle interativo: Visíveis / Ocultos)
    6. *Funcionamento em segundo plano* (Ação direta: Abrir configurações)
  - Card dedicado "Testar alarme" em tom Pêssego com botão de ação e contagem regressiva de 5 segundos simulando o disparo do alarme.
  - Seção "Sobre" com versão 1.0.0 e reforço do princípio local-first.
- [/] **Clean Edition — Implementação React Native**: Refatoração de `HomeScreen.tsx`, `SettingsScreen.tsx`, `AppNavigator.tsx` (tab bar flutuante) e `colors.ts` para a nova estética.
- [ ] **Refatoração UI/UX Avançada (Home & Empty States)**: Aplicar as diretrizes do design system e a Cápsula Companheira nos Empty States da Home e Banners de Adesão 100%.
- [ ] **Documentação de Design**: Atualizar o Tema (`src/theme/colors.ts`) com os tokens consolidados.

---
## 🛠️ Histórico Recente de Evolução (Commits Chave)
- `f5028d7` / `209b85e`: Estabilização de lembretes e histórico de doses.
- `4be9807`: Resiliência em lembretes de dose.
- `e80b382`: Restauração de alarme ativo após desbloqueio do dispositivo.
- `f1beedd`: Abertura completa do app para alarmes de medicação.
- `6e9a201`: Unificação do fluxo nativo de alarme.
- `b536897`: Rebranding oficial do app para Remedin.
