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

## Marca e perfil

- O Remedin usa uma cápsula como símbolo, paleta coral e a família Atkinson Hyperlegible Next. O guia em [DESIGN.md](DESIGN.md) acompanha a identidade em produção.
- O perfil contém nome e avatar escolhidos no aparelho. A configuração inicial explica como funcionam os lembretes e apresenta as permissões do Android.
- O tom é acolhedor, direto e em português do Brasil.

## Product Principles
1. **Confiabilidade Incondicional**: Um alarme agendado deve tocar no segundo exato, com som e tela cheia onde o Android permitir.
2. **Privacidade Absoluta**: Seus dados de saúde nunca saem do seu bolso.
3. **Clareza e Sem Fricção**: Ações rápidas e sem distrações (1 toque para marcar como tomado ou adiar).
4. **Respeito ao Usuário**: Notificações informativas, sem spam e sem retenção artificial de atenção.

## Accessibility & Inclusion
- Contraste alto e legibilidade imediata (modo claro e escuro).
- Botões e alvos de toque grandes e acessíveis para facilitar ações na tela de alarme com o aparelho bloqueado.
- Textos concisos e diretos com suporte a leitores de tela e dimensionamento de fonte do sistema.
