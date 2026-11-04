# ADR 0014 - Fluxo de abertura Coral, autenticação local-first e unificação com o onboarding

## Status

Accepted

## Context

O Remedin iniciava com um indicador de carregamento genérico em `App.tsx` e seguia diretamente para o `FirstRunOnboarding`, onde coletava apenas um nome de perfil local (`Local profile`), sem tela de abertura da nova marca e sem opções de login.

Com a definição da nova identidade visual Coral (`#A44945`, tema claro `#FAF7F6` e tema escuro `#291C1C`, símbolo da cápsula diagonal com divisão curva e assinatura `remedin` em minúsculas com Atkinson Hyperlegible Next), o produto passa a contar com uma jornada completa de entrada:

1. **Tela 01 — Carregamento (Splash):** bloco em Coral queimado (`#A44945`) com a cápsula branca centralizada.
2. **Tela 02 — Boas-vindas e Opções de Login:** composição minimalista editorial com a cápsula no centro e três botões em formato pílula na base (*Continuar com o Google*, *Criar uma conta* e *Entrar com minha conta*).
3. **Telas 03A e 03B — Criar Conta e Entrar:** cabeçalho em Coral queimado (`#A44945`) combinado com folha inferior arredondada (`surface`), campos amplos de largura total e folha modal para seleção/confirmação de conta Google.

## Decision

1. Implementar a camada de autenticação (`User account`) de forma **local-first** no SQLite (`app_settings`), mantendo contrato isolado em repositório/serviço para futura conexão com provedor em nuvem (Firebase/Supabase) sem alterar as telas.
2. Apresentar a `BrandSplashScreen` durante o carregamento inicial e realizar transição suave (respeitando `AccessibilityInfo.isReduceMotionEnabled()`) para o fluxo de autenticação quando não houver sessão autenticada.
3. Remover as etapas redundantes de boas-vindas (`welcome`) e coleta de nome (`profile`) de `FirstRunOnboarding` quando o usuário já se autenticou, iniciando o onboarding pós-login diretamente no guia rápido (`guide`) seguido das permissões Android em ordem de dependência.
4. Exibir os dados da conta autenticada (nome, e-mail e método de acesso) e a ação de encerrar sessão (*Sair da conta*) na tela de Perfil (`SettingsScreen`), preservando os medicamentos e alarmes locais do aparelho.

## Consequences

- A abertura do aplicativo comunica imediatamente a nova identidade Coral aprovada.
- O nome do usuário na tela Hoje (`HomeScreen`) vem sempre da conta autenticada, sem nomes fictícios.
- O usuário não responde seu nome duas vezes no primeiro acesso.
- Os testes existentes de banco de dados (`settingsRepository`) e de alarme frio (`DoseAlarmScreen` antes de `DatabaseProvider`) permanecem preservados.
