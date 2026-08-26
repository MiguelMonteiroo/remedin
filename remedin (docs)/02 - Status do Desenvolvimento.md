# 02 - Status do Desenvolvimento e Roadmap

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
- [/] **Clean Edition — Implementação React Native**: Refatoração de `HomeScreen.tsx`, `AppNavigator.tsx` (tab bar flutuante) e `colors.ts` para a nova estética.
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
