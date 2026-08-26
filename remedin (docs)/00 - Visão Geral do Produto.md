# 00 - Visão Geral do Produto

## O que é o Remedin?
O **Remedin** é um aplicativo móvel local para gerenciamento e lembrete de doses de medicamentos, focado em alta confiabilidade de alarmes, simplicidade e privacidade total (sem necessidade de conta ou nuvem).

---

## 🎯 Princípios Chave
1. **Local First / Privacidade**: Todas as informações de perfis, remédios e histórico ficam salvas exclusivamente no dispositivo do usuário.
2. **Confiabilidade Máxima de Alarmes**: Uso de rotinas nativas do Android (AlarmManager, Foreground Services e Ringtone nativo) para garantir que a pessoa não perca a dose mesmo em modo não perturbe ou com o celular bloqueado.
3. **Experiência Limpa e Sem Fricção**: Interface fluida, suporte completo a modo escuro/claro e linguagem clara e acolhedora em Português (PT-BR).

---

## 📖 Glossário e Terminologia Oficial

| Termo Oficial | Significado | O que Evitar |
| :--- | :--- | :--- |
| **Dose occurrence** | A ocorrência de uma dose esperada em dia e horário específicos. | Lembrete genérico, alarme genérico |
| **Interval schedule** | Sequência contínua de doses separadas por um número fixo de horas (ex: de 8 em 8h). | Intervalo diário, repetição diária |
| **Pre-alert** | Notificação suave enviada 5 minutos antes da dose acontecer. | Alarme antecipado, primeiro alarme |
| **Local notification** | Alerta agendado e entregue exclusivamente pelo dispositivo. | Push notification, notificação de servidor |
| **Dose alarm** | Alarme urgente e com áudio disparado no momento exato da dose. | Push, notificação comum |
| **Dose window** | Janela de agrupamento para doses que ocorrem no mesmo minuto. | Grupo de doses, dose combinada |
| **Full-screen alarm** | Tela cheia imediata aberta sobre o bloqueio de tela quando o Android permite. | Tela forçada |
| **Snooze** | Ação de adiar o alarme em 5 minutos sem marcar como tomado ou ignorado. | Reagendar, atrasar remédio |
| **Taken dose** | Dose explicitamente confirmada e tomada pelo usuário. | Remédio concluído |
| **Unrecorded dose** | Dose passada que terminou o dia sem nenhuma ação (tomada, pulada ou adiada). | Dose perdida, dose esquecida |
| **Local profile** | Nome do perfil salvo localmente no dispositivo para personalizar o app. | Conta de usuário, login |
| **First-run onboarding** | Fluxo inicial exibido apenas na primeira instalação para coletar nome e permissões. | Cadastro, registro |
| **Daily adherence** | Percentual de doses agendadas do dia que foram tomadas. | Conclusão semanal |
