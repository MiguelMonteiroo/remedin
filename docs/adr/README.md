# Decisões arquiteturais

Esta pasta contém o registro versionado de decisões do Remedin. As decisões são históricas: uma proposta aceita pode ter sido substituída por decisões posteriores. O cofre Obsidian e os protótipos antigos são materiais locais, não uma segunda fonte oficial.

Para o comportamento atual, consulte [CONTEXT.md](../../CONTEXT.md), [DESIGN.md](../../DESIGN.md), o [fluxo de notificações](../product/notification-flow.md), a [matriz de permissões](../product/android-permission-matrix.md) e as [notas de confiabilidade](../product/app-reliability-qa.md).

| ADR | Assunto | Situação |
| --- | --- | --- |
| [0001](0001-ui-navigation-tabs.md) | Abas e stack | Navegação principal mantida; aparência atual em DESIGN.md. |
| [0002](0002-design-system-theme.md) | Design system local | Tokens/componentes locais mantidos; paleta e raios evoluíram. |
| [0003](0003-portuguese-first-i18n-ready.md) | Português e copy centralizada | Mantida. |
| [0004](0004-optional-full-screen-dose-alarms.md) | Tela cheia opcional | Mantida; implementação refinada por 0011 e 0012. |
| [0005](0005-react-native-dose-alarm-screen.md) | Activity exclusiva de alarme | Substituída por 0012. |
| [0006](0006-cascade-delete-medication-history.md) | Exclusão em cascata | Mantida. |
| [0007](0007-first-run-onboarding.md) | Primeiro acesso | Fluxo evoluiu; consultar fluxo de notificações atual. |
| [0008](0008-daily-adherence-scope.md) | Adesão diária | Mantida; versionamento de horários nas notas de confiabilidade. |
| [0009](0009-opt-in-critical-dose-alarms.md) | Alertas críticos opcionais | Mantida; no onboarding, acesso DND aparece na conclusão opcional. |
| [0010](0010-native-dose-alarm-audio.md) | Áudio nativo em paralelo | Substituída por 0011. |
| [0011](0011-single-native-dose-alarm.md) | Alarme nativo único | Mantida. |
| [0012](0012-main-activity-alarm-mode.md) | Modo alarme na MainActivity | Mantida. |
| [0013](0013-clean-edition-design-migration.md) | Clean Edition e tab flutuante | Visual substituído pela identidade Coral atual. |
| [0014](0014-local-first-auth-and-splash-flow.md) | Splash e autenticação | Parcialmente substituída: splash mantido, autenticação removida. |
| [0015](0015-streamlined-onboarding-and-permission-flow.md) | Simplificação do onboarding | Parcialmente substituída: escolha de privacidade foi reinserida explicitamente. |
| [0016](0016-editorial-coral-main-tabs-and-cards.md) | Identidade Coral nas abas | Identidade mantida; barra agora é fixa, conforme DESIGN.md. |
| [0017](0017-medication-flows-and-full-screen-alarm-refinement.md) | Formulário e alarme | Referência de evolução visual; verificar telas e tokens atuais. |
