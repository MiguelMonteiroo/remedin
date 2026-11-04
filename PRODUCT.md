# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users
- Pessoas com rotinas regulares ou tratamentos contínuos de medicamentos que precisam de lembretes pontuais e confiáveis.
- Familiares ou cuidadores que configuram o aplicativo no dispositivo do paciente.
- Usuários que valorizam privacidade total e independência de serviços em nuvem ou logins.

## Product Purpose
O Remedin é um aplicativo móvel local para gerenciamento e lembretes de doses de medicamentos. Existe para garantir que o usuário nunca perca uma dose essencial, mantendo um histórico preciso de suas ações de forma 100% offline e privada.

## Positioning
Diferente de aplicativos convencionais com contas em nuvem, assinaturas ou notificações que falham em segundo plano, o Remedin é **100% Local-First** e prioriza **Confiabilidade Extrema de Alarmes** através de serviços nativos do Android (Foreground Services, AlarmManager exato e som contínuo), mesmo em tela bloqueada ou modo Não Perturbe.

## Operating Context
- Dispositivos Android (suporte robusto do Android 12 ao 14+).
- Uso em momentos críticos do dia a dia (acordar, horários de trabalho, repouso noturno).
- Interação rápida na tela de alarme ou no painel diário (Home) para registrar tomada, adiar ou checar histórico.

## Capabilities and Constraints
- **Local-First & Offline**: Banco de dados SQLite local isolado (`wal` mode), sem backend, sem telemetria, sem coleta de dados de saúde.
- **Alarmes Nativos de Alta Prioridade**: `ForegroundService` com `MediaPlayer` de alarme nativo de até 60s, sobreposição à tela de bloqueio (`full-screen intent`), pré-avisos de 5 minutos e reconciliação automática contra reinicializações e alterações de fuso.
- **Terminologia Específica**:
  - *Dose occurrence* (ocorrência agendada),
  - *Interval schedule* (intervalo contínuo entre doses),
  - *Pre-alert* (aviso suave 5 min antes),
  - *Dose window* (agrupamento no mesmo minuto),
  - *Snooze* (adiar 5 min),
  - *Taken dose* (dose confirmada),
  - *Unrecorded dose* (dose sem registro ao fim do dia).

## Brand Commitments

> **Revisão de marca em andamento (27/10/2026):** a nova direção acordada preserva o nome Remedin e explora uma pílula como símbolo, sem mascote, com cores e tipografia abertas à revisão. A definição de mascote abaixo descreve a identidade anterior e não é uma restrição para o redesign. Os recursos existentes continuam em uso até a aprovação e implementação da nova identidade. Consulte `design/identidade/briefing.md`.
- **Nome Oficial**: Remedin.
- **Identidade da Mascote Canônica (Imutável)**: "Cápsula Companheira" baseada estritamente no asset `assets/mascot-canonical.jpg` (`capsule_solid_bg_2_1787386895140.jpg`).
  - Metade superior em Verde Menta / Sage Suave (`#6ECB98`).
  - Metade inferior em Azul Céu Claro (`#60A5FA`).
  - Olhos redondos em Azul Índigo (`#2A5B84`) e sorriso minimalista.
  - Fundo sólido canônico Navy Blue Profundo (`#101A24`).
  - Formato limpo sem membros humanos (braços/pernas). Variações futuras permitidas são apenas expressões faciais e enquadramento.
- **Tom de Voz**: Acolhedor, claro, seguro, sem alarmismo desnecessário, em Português do Brasil (PT-BR).

## Evidence on Hand
- Código existente em React Native + TypeScript com ponte nativa Android.
- Documentação centralizada na pasta `remedin (docs)/`.
- Propostas aprovadas da mascote em `remedin_mascot_proposals.md` (Versão A1 com fundo Navy Blue).

## Product Principles
1. **Confiabilidade Incondicional**: Um alarme agendado deve tocar no segundo exato, com som e tela cheia onde o Android permitir.
2. **Privacidade Absoluta**: Seus dados de saúde nunca saem do seu bolso.
3. **Clareza e Sem Fricção**: Ações rápidas e sem distrações (1 toque para marcar como tomado ou adiar).
4. **Respeito ao Usuário**: Notificações informativas, sem spam e sem retenção artificial de atenção.

## Accessibility & Inclusion
- Contraste alto e legibilidade imediata (modo claro e escuro).
- Botões e alvos de toque grandes e acessíveis para facilitar ações na tela de alarme com o aparelho bloqueado.
- Textos concisos e diretos com suporte a leitores de tela e dimensionamento de fonte do sistema.
