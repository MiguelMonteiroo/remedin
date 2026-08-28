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
  background: "#101A24" # Bento Mode Escuro por default ou Claro (FAFAFA)
  surface: "#FFFFFF"
  surface-muted: "#F0F2F5"
  text-primary: "#1D1F24"
  text-muted: "#8A96A3"
  border: "#F0F2F5"
  border-strong: "#E0E3E8"
  bento-menta: "#84DCAE"
  bento-peach: "#FFC6A5"
  bento-lilac: "#D4C1FF"
  bento-sun: "#FDE047"
  bento-sky: "#93C5FD"
typography:
  display:
    fontFamily: "AtkinsonHyperlegibleNext-Bold"
    fontSize: "36px"
    lineHeight: "44px"
  title:
    fontFamily: "AtkinsonHyperlegibleNext-Bold"
    fontSize: "28px"
    lineHeight: "36px"
  headline:
    fontFamily: "AtkinsonHyperlegibleNext-SemiBold"
    fontSize: "24px"
    lineHeight: "32px"
  body:
    fontFamily: "AtkinsonHyperlegibleNext-Regular"
    fontSize: "18px"
    lineHeight: "27px"
  label:
    fontFamily: "AtkinsonHyperlegibleNext-Bold"
    fontSize: "16px"
    lineHeight: "22px"
rounded:
  sm: "12px"
  md: "20px"
  lg: "24px"
  xl: "32px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
shadows:
  card-rest: "none"
  card-subtle: "none"
  circle-btn: "none"
  tab-bar: "0 10px 40px rgba(0,0,0,0.15)"
  primary-glow: "0 4px 16px rgba(15,107,58,0.3)"
components:
  bento-card:
    backgroundColor: "{colors.bento-menta}" # Variable
    rounded: "{rounded.xl}"
    padding: "20px"
    border: "none"
    shadow: "none"
  button-primary:
    backgroundColor: "{colors.navy-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  tab-bar:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "6px 8px"
    shadow: "{shadows.tab-bar}"
    position: "absolute"
    bottom: "24px"
---

# Remedin: Design System (Clean Accessible Edition - v4)

O design atual do Remedin busca o equilíbrio perfeito (meio-termo) entre uma estética moderna/limpa e os requisitos rigorosos de acessibilidade para o público idoso.

## 1. Princípios de Design (O Meio-Termo)

- **Fundo Limpo (Superfícies):** Evitamos poluição visual. Os cards e a tela usam fundos brancos (`surface`) ou levemente acinzentados (`bg`) para descansar os olhos, abandonando os fundos sólidos extravagantes da v3 (Bento).
- **Acessibilidade Focada (Cor com Propósito):** As cores vibrantes da paleta Bento são usadas de forma pontual (ex: apenas no box do ícone do remédio) para criar uma associação de memória sem pintar a tela inteira.
- **Leitura Máxima:** Tipografia `Outfit` ou similar em tamanhos grandes (20px-24px para nomes de remédio, 32px-48px para horas), garantindo contraste absoluto.
- **Áreas de Toque Largas:** Botões e checkboxes sempre com no mínimo 48x48px para facilitar o toque de quem possui tremores ou dificuldade motora fina.

## 2. Paleta de Cores

```typescript
export const colors = {
  bg: "#0A0F14",
  surface: "#FFFFFF",
  
  text: "#1D1F24",
  textMuted: "#8A96A3",
  border: "#E2E8F0", // Bordas sutis, não sólidas

  primary: "#0F6B3A",
  primarySoft: "#E2EEE7", // Usado para destaques leves (ex: Card Próxima Dose)
  
  // Cores Auxiliares de Memória (apenas ícones)
  bentoMenta: "#84DCAE",
  bentoPeach: "#FFC6A5",
  bentoLilac: "#D4C1FF",
  bentoSun: "#FDE047",
  bentoSky: "#93C5FD",
};
```

## 3. Tipografia & Layout
- Títulos de Cartões: Extra grandes (`heading` ou estilo `20px+`) para os remédios.
- Layout: Lista vertical clássica com espaçamento moderado (`spacing.md` ou `lg`). Sem Grid assimétrico complexo para evitar confusão em listas grandes.
- Raios de borda: Arredondados (`radii.lg` = 24px) para ser amigável, mas não círculos completos.

## 4. Estrutura do Card de Medicamento (Clean Accessible)
Um card típico de `CareDoseActionCard` deve seguir esta anatomia:
1. **Container:** Fundo `surface` (branco), borda `border` fina, sombra ultra sutil.
2. **Ícone (Box Colorido):** Um quadrado de ~48x48px na lateral esquerda. A cor de fundo é definida pelo `getBentoColor()` baseado no nome do remédio.
3. **Texto (Centro):** Nome do remédio (Gigante) e Hora/Dose (Menor e Muted).
4. **Ação (Direita):** Um Checkbox largo ou Botão `Tomar` com alto contraste.

---

## Typography

**Display & Body Font:** Atkinson Hyperlegible Next.

Tudo precisa ser ultra-legível.
- **Textos de Ação (Label)**: Bold, 16px.
- **Nomes de Remédios e Horários (Headline/Display)**: Bold, gigantes (24px a 36px) para visualização instantânea.

---

## Layout & Shapes

- **Bento Grid**: A tela Inicial (Home) é composta por esses blocos. Em vez de uma lista vertical chata, combinamos um card gigante no topo (Próxima Dose), dois blocos meio a meio, e blocos horizontais espessos.
- **Corner Radius**: 32px para Bento Cards, 24px para cards menores. O visual é extremamente arredondado e "puffy", eliminando a rigidez clínica.
- **Sem Sombras**: A interface é flat. Os blocos se diferenciam por suas cores primárias e espaçamento de 12px a 16px entre eles.

---

## Do's and Don'ts

### Do:
- **Do** usar blocos Bento totalmente coloridos para representar estados ou tipos de remédios.
- **Do** usar botões escuros/sólidos dentro de fundos coloridos claros para máximo contraste de ação.
- **Do** colocar textos grandes (36px+) para o horário das doses.

### Don't:
- **Don't** usar cartões brancos com sombras sutis (estilo v2) nas telas principais.
- **Don't** fazer textos pequenos ou cinzas em cima das cores bento fortes. Mantenha alto contraste (preto ou branco puro).brecarregar a tela com opções complexas; mantenha o foco nas ações essenciais.
- **Don't** usar o estilo neo-brutalista (bordas grossas, sombras pesadas, formas quadradas) em componentes de lista.
