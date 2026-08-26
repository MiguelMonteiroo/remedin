---
name: Remedin
description: Aplicativo móvel local-first de gerenciamento e lembretes de medicamentos com mascote companheira e alta confiabilidade de alarmes.
colors:
  primary: "#0F6B3A"
  primary-soft: "#E2EEE7"
  primary-muted: "#6D927D"
  primary-glow: "rgba(15,107,58,0.25)"
  navy-deep: "#101A24"
  navy-surface: "#182430"
  accent: "#E99A75"
  accent-soft: "#FBE7DB"
  info: "#4F7EA8"
  info-soft: "#E1ECF5"
  success: "#3F8F5F"
  warning: "#A96F18"
  danger: "#B84A43"
  background: "#FAFAFA"
  surface: "#FFFFFF"
  surface-muted: "#F0F2F5"
  text-primary: "#1D1F24"
  text-muted: "#8A96A3"
  border: "#F0F2F5"
  border-strong: "#E0E3E8"
  bento-menta: "#84DCAE"
  bento-peach: "#FFC6A5"
  bento-lilac: "#D4C1FF"
typography:
  display:
    fontFamily: "AtkinsonHyperlegibleNext-Bold"
    fontSize: "32px"
    lineHeight: "40px"
  title:
    fontFamily: "AtkinsonHyperlegibleNext-Bold"
    fontSize: "28px"
    lineHeight: "36px"
  headline:
    fontFamily: "AtkinsonHyperlegibleNext-SemiBold"
    fontSize: "22px"
    lineHeight: "29px"
  body:
    fontFamily: "AtkinsonHyperlegibleNext-Regular"
    fontSize: "18px"
    lineHeight: "27px"
  label:
    fontFamily: "AtkinsonHyperlegibleNext-Medium"
    fontSize: "15px"
    lineHeight: "20px"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
shadows:
  card-rest: "0 4px 20px rgba(0,0,0,0.02)"
  card-subtle: "0 2px 8px rgba(0,0,0,0.01)"
  circle-btn: "0 2px 10px rgba(0,0,0,0.02)"
  tab-bar: "0 10px 40px rgba(0,0,0,0.08)"
  primary-glow: "0 4px 16px rgba(15,107,58,0.25)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.xl}"
    padding: "14px 20px"
  card-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "12px"
    border: "1px solid {colors.border}"
    shadow: "{shadows.card-rest}"
  clean-card-item:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    border: "1px solid {colors.border}"
    shadow: "{shadows.card-subtle}"
  tab-bar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "6px 8px"
    shadow: "{shadows.tab-bar}"
    position: "absolute"
    bottom: "24px"
---

# Design System: Remedin — Clean Edition (v2)

## Overview

**Creative North Star: "O Companheiro Carismático da Saúde" (The Charismatic Health Companion)**

O Remedin combina a utilidade clínica incondicional de um alarme médico com o carisma, o engajamento e a expressividade visual dos melhores aplicativos orientados a hábitos (estilo Duolingo). A experiência é ancorada pela mascote "Cápsula Companheira", trazendo acolhimento, leveza e incentivo diário sem perder a seriedade e a pontualidade que a medicação exige.

**Clean Edition (v2):** A linguagem visual foi evoluída para uma estética **arejada, limpa e moderna**. O fundo creme quente (#F8F4EB) deu lugar a um fundo neutro claro (#FAFAFA) com superfícies brancas (#FFFFFF). Bordas são quase imperceptíveis (#F0F2F5). Sombras são mínimas. A identidade de marca (Verde Botânico, pastéis Bento, mascote) permanece intacta — aplicada com mais elegância e parcimônia.

**Key Characteristics:**
- **Carismático & Humano**: A mascote guia momentos-chave (onboarding, empty states, celebrações de doses do dia e reforços de lembretes).
- **Feedback Tátil & Recompensador**: Estados visuais comemorativos ao registrar doses tomadas, transmitindo sensação de missão cumprida.
- **Hierarquia Funcional Rápida**: Leitura em 1 segundo para saber qual remédio tomar, dose e horário.
- **Arejado & Leve**: Espaçamento generoso, superfícies brancas, sombras mínimas, zero poluição visual.

---

## Colors

A paleta equilibra a serenidade da saúde com energia vibrante e contraste acessível. Na Clean Edition, as superfícies foram clareadas e simplificadas.

### Primary
- **Verde Botânico Primário** (`#0F6B3A`): Cor de ação principal, botões de confirmação "Tomar Dose", checkboxes marcados, dia ativo no calendário e status positivos.
- **Verde Suave** (`#E2EEE7`): Fundos de cards ativos, tags de frequência, badges de doses concluídas, e fundo do dia ativo no calendário semanal.

### Secondary
- **Navy Blue Profundo** (`#101A24`): Tom oficial de identidade e fundo da mascote. Utilizado em cards de destaque, badges solenes e base do modo escuro.
- **Azul Clínico** (`#4F7EA8`): Indicadores informativos, pré-avisos (Pre-alerts) e notas médicas.

### Tertiary
- **Pêssego Acolhedor** (`#E99A75`): Acento caloroso para ações de "Adiar" (Snooze), avisos de atenção suave e detalhes da mascote.
- **Pêssego Suave** (`#FBE7DB`): Fundo de chips de adiamento e alertas suaves.

### Bento Pastéis (Ícones de Medicamentos)
- **Menta** (`#84DCAE`): Fundo de ícone de medicamento (variante 1).
- **Pêssego** (`#FFC6A5`): Fundo de ícone de medicamento (variante 2).
- **Lilás** (`#D4C1FF`): Fundo de ícone de medicamento (variante 3).

### Neutral (Clean Edition v2)
- **Fundo Claro** (`#FAFAFA`): Fundo principal do app — neutro, leve, sem a tonalidade creme anterior.
- **Superfície Branca** (`#FFFFFF`): Fundo dos cards, modais e bottom sheets.
- **Texto Principal** (`#1D1F24`): Alto contraste e legibilidade.
- **Texto Muted** (`#8A96A3`): Legendas, horários secundários e instruções de apoio.
- **Bordas Sutis** (`#F0F2F5`): Quase invisíveis, apenas para dar estrutura sem peso visual.

### Named Rules
**The Vital Accent Rule.** O Verde Primário é reservado para ações de sucesso/tomada e o Pêssego para adiamento. Cores críticas nunca são usadas puramente como enfeite sem significado funcional.
**The Navy Anchor Rule.** O Navy Blue (#101A24) ancora visualmente a presença da mascote e os momentos de maior foco da interface.
**The Bento Pastel Rule.** As cores Menta, Pêssego e Lilás são usadas **exclusivamente** como fundo de ícones de medicamento em listas, nunca como fundo de cards inteiros ou áreas extensas.

---

## Typography

**Display & Body Font:** Atkinson Hyperlegible Next (com fallbacks para fontes do sistema acessíveis).

A tipografia foi projetada especificamente para máxima legibilidade e clareza de caracteres, ideal para leitura rápida sob diferentes condições de iluminação ou com o aparelho bloqueado.

### Hierarchy
- **Display** (Bold, 32px, line-height 40px): Títulos de boas-vindas, tela de alarme ativo e tela de onboarding.
- **Title** (Bold, 28px, line-height 36px): Cabeçalhos principais de seção (ex: "Hoje", "Medicamentos").
- **Headline** (SemiBold, 22px, line-height 29px): Nomes de medicamentos em destaque e títulos de modais.
- **Body** (Regular, 18px, line-height 27px): Texto principal, dosagens, instruções de uso e notas.
- **Label** (Medium, 15px, line-height 20px): Horários de dose, chips de status, badges e botões secundários.

### Named Rules
**The Legibility First Rule.** Dosagens e horários devem sempre utilizar tamanhos iguais ou superiores a 16px para evitar qualquer ambiguidade de leitura.

---

## Layout

- **Modelo Espacial**: Base grid de 4px / 8px.
- **Margens de Tela**: 24px de respiro lateral nas telas principais (aumentado de 16px na v1).
- **Densidade**: Leve e confortável — espaçamento generoso entre seções (24px gap).
- **Alvos de Toque (Touch Targets)**: Mínimo estrito de 48×48 dp em todos os botões e elementos interativos.

---

## Elevation & Depth (Clean Edition v2)

O sistema utiliza **camadas tonais limpas** com elevação **mínima** para sensação de cartões flutuando suavemente.

### Shadow Vocabulary
- **Card Rest** (`0 4px 20px rgba(0,0,0,0.02)`): Elevação padrão para cards na tela Hoje.
- **Card Subtle** (`0 2px 8px rgba(0,0,0,0.01)`): Itens dentro de listas de medicamentos.
- **Circle Button** (`0 2px 10px rgba(0,0,0,0.02)`): Botões circulares do header.
- **Tab Bar** (`0 10px 40px rgba(0,0,0,0.08)`): Barra flutuante de navegação.
- **Primary Glow** (`0 4px 16px rgba(15,107,58,0.25)`): Dia ativo no calendário e checkboxes marcados.

### Named Rules
**The Tonal Layering Rule.** A separação visual entre planos é feita primeiramente pela cor da superfície (`#FAFAFA` → `#FFFFFF`) e bordas sutis (`#F0F2F5`), nunca por sombras pesadas ou artificiais.

---

## Shapes (Clean Edition v2)

- **Raio de Borda Cards**: 24px para containers de lista, 16px para items individuais (mais arredondado que v1).
- **Raio Pílula (Pill - 999px)**: Chips de horário, badges de contagem, tab bar e botões de ação.
- **Raio Calendário**: 40px para as células do calendário semanal (formato cápsula).
- **Raio Botões Circulares**: 50% (perfeitamente redondos).
- **Forma da Mascote**: Bordas curvas suaves com pesos expressivos (estilo IP-as-Logo).

---

## Components (Clean Edition v2)

### Buttons
- **Primary (Tomar Dose)**: Fundo Verde Botânico (`#0F6B3A`), texto branco, raio 24px, altura mínima 48dp.
- **Secondary / Snooze (Adiar)**: Fundo Pêssego Suave (`#FBE7DB`) com borda ou texto em Pêssego/Grafite.
- **Ghost / Outlined**: Borda suave (`#F0F2F5`), texto grafite, sem fundo.

### Cards de Dose (CleanCard)
- **Container Externo**: Fundo `#FFFFFF`, borda `#F0F2F5`, raio 24px, padding 12px.
- **Item Individual**: Fundo `#FFFFFF`, borda `#F0F2F5`, raio 16px, padding 12px 16px.
- **Layout Interno**: Ícone de pílula em quadrado Bento à esquerda, nome e dosagem no centro, checkbox circular à direita.
- **Estado Concluído**: Checkbox preenchido com `#0F6B3A` e glow verde.

### Tab Bar Flutuante
- **Container**: Fundo branco, raio pill (40px), sombra `0 10px 40px rgba(0,0,0,0.08)`, posição absolute bottom 24px.
- **Ordem**: Hoje → Medicamentos → Histórico → Perfil.
- **Item Ativo**: Fundo `#F0F2F5` com raio 30px.

### Empty States (Com a Mascote)
- Ilustração expressiva da Mascote A1 ("Cápsula Companheira") no estilo chunky com rosto fofo.
- Mensagem acolhedora e encorajadora (ex: "Tudo certo por aqui! Nenhuma dose pendente hoje.").
- Botão de ação claro para adicionar novo medicamento.

---

## Do's and Don'ts (Clean Edition v2)

### Do:
- **Do** usar a mascote para criar momentos de deleite e reforço positivo ao completar tratamentos ou metas de adesão diária.
- **Do** garantir que qualquer texto de instrução médica ou dosagem seja nítido, de alto contraste e sem cortes.
- **Do** manter as ações "Tomar" e "Adiar" com diferenciação imediata de cor e peso visual.
- **Do** manter espaçamento generoso entre elementos (24px entre seções, 12px entre cards).
- **Do** usar sombras mínimas — a interface deve respirar com tom, não com sombra.

### Don't:
- **Don't** usar bordas grossas ou pesadas em cards ou containers.
- **Don't** usar sombras com opacidade superior a 0.1 em elementos comuns.
- **Don't** usar cores saturadas como fundo de áreas extensas.
- **Don't** esconder dosagens ou nomes de remédios atrás de ícones abstratos.
- **Don't** sobrecarregar a tela com opções complexas; mantenha o foco nas ações essenciais.
- **Don't** usar o estilo neo-brutalista (bordas grossas, sombras pesadas, formas quadradas) em componentes de lista.
