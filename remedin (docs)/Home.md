# 💊 Remedin - Central de Conhecimento (Obsidian Vault)

Bem-vindo à base de documentação unificada do **Remedin**. Este cofre centraliza a visão de produto, decisões de arquitetura (ADRs), fluxos de sistema, status de desenvolvimento e histórico de evolução do projeto.

---

## 📌 Navegação Rápida

- [[00 - Visão Geral do Produto]]: Objetivos do app, princípios, regras de negócio e termos oficiais.
- [[01 - Arquitetura e Estrutura do Código]]: Módulos do frontend React Native, serviços nativos Android, banco de dados SQLite.
- [[02 - Status do Desenvolvimento]]: Funcionalidades implementadas, o que falta (backlog), histórico recente e roadmap.
- [[03 - Identidade Visual e Design]]: Paleta de cores, tipografia, tom de voz, logotipo e design system.
- [[ADRs/Índice de ADRs|04 - Decisões Arquiteturais (ADRs)]]: Registro de todas as decisões técnicas tomadas (ADR 0001 a 0012).
- [[Fluxos e Sistema/Fluxo de Notificações e Alarmes|05 - Fluxo de Alarmes e Notificações]]: Funcionamento de Pre-alerts, Dose Alarms nativos e Lock Screen.
- [[Fluxos e Sistema/Matriz de Permissões Android|06 - Matriz de Permissões Android]]: Requisitos de permissões do Android 12 ao 14+ (Alarmes Exatos, Notificações, etc.).

---

## ⚙️ Informações do Projeto

| Item | Descrição |
| :--- | :--- |
| **App** | Remedin (Lembrete e histórico local de medicamentos) |
| **Stack** | React Native (TypeScript) + Módulos Nativos Android (Java/Kotlin) |
| **Banco Local** | SQLite local (sem autenticação em nuvem / privacidade total) |
| **Design** | Design System Customizado (Tema Claro/Escuro, acessibilidade, suporte i18n PT-BR first) |
