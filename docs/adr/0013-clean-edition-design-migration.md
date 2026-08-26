# ADR 0013 - Clean Edition: Migração para estética arejada e leve

## Status
Accepted

## Decision
Migrar a linguagem visual do app de um estilo "neo-brutalista" (bordas grossas, sombras pesadas, fundos creme quentes) para a estética **Clean Edition**: superfícies brancas, bordas quase invisíveis, sombras mínimas, espaçamento generoso e tab bar flutuante em formato pill.

## Context
O estilo anterior, com retângulos grosseiros e alto contraste, resultava em uma interface que parecia "poluída" — especialmente em telas com muitos medicamentos listados. O usuário (product owner) solicitou explicitamente uma interface mais próxima de apps de saúde modernos: limpa, arejada e que respeite a identidade de cores do Remedin (Verde Botânico, pastéis Bento) sem parecer pesada.

Um protótipo HTML foi criado e iterado em `preview/home.html` com 3 estados (vazio, com doses, dia completo), aprovado pelo product owner em 23/08/2026.

## Consequences
- `src/theme/colors.ts` precisa ser atualizado com os novos tokens (background: #FAFAFA, surface: #FFFFFF, border: #F0F2F5, Bento pastéis).
- `DESIGN.md` foi completamente reescrito para refletir a Clean Edition v2.
- `.agents/rules/design-system.md` foi criado como fonte de verdade para agentes futuros.
- `.agents/rules/icon-style.md` foi atualizado para incluir o ícone de pílula (Lucide) nas listas de medicamento.
- `src/navigation/AppNavigator.tsx` deve ser refatorado para uma tab bar flutuante.
- `src/screens/HomeScreen.tsx` deve ser reconstruída para espelhar o protótipo aprovado.
- O mascote chunky com rosto fofo permanece inalterado para empty states, onboarding e celebrações.
