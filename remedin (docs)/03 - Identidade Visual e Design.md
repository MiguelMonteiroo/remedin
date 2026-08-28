# 03 - Identidade Visual e Design System

## Visão Geral Visual

O **Remedin** possui uma identidade visual focada em clareza, alta legibilidade, acolhimento e engajamento carismático (estilo Duolingo / hábitos saudáveis).

**Creative North Star:** *"O Companheiro Carismático da Saúde"*

**Versão Atual: Clean Edition (v2)** — Estética arejada, limpa e moderna. Superfícies brancas, bordas quase invisíveis, sombras mínimas, espaçamento generoso. A identidade de marca (Verde Botânico, pastéis Bento, mascote) permanece intacta.

---

## Paleta de Cores Oficial (Clean Edition v2)

### Cores de Destaque e Identidade
- **Verde Botânico (`#0F6B3A`)**: Ação principal, confirmação de doses tomadas, checkboxes marcados, dia ativo no calendário.
- **Navy Blue Profundo (`#101A24`)**: Fundo oficial da mascote, cartões de destaque e âncora do modo escuro.
- **Azul Clínico (`#4F7EA8`)**: Pré-alertas (5 min antes) e notas informativas.
- **Pêssego Acolhedor (`#E99A75`)**: Botão de adiar (Snooze), avisos de atenção suave e detalhes da mascote.

### Bento Pastéis (Ícones de Medicamentos)
- **Menta (`#84DCAE`)**: Fundo de ícone de medicamento (variante 1).
- **Pêssego (`#FFC6A5`)**: Fundo de ícone de medicamento (variante 2).
- **Lilás (`#D4C1FF`)**: Fundo de ícone de medicamento (variante 3).

### Superfícies e Neutros (Clean Edition v2)
- **Fundo Geral (`#FAFAFA`)**: Neutro claro — substitui o creme quente anterior.
- **Superfície dos Cards (`#FFFFFF`)**: Branco puro com bordas sutis (`#F0F2F5`).
- **Texto Principal (`#1D1F24`)**: Alto contraste e legibilidade.
- **Texto Muted (`#8A96A3`)**: Instruções secundárias e horários.

---

## Tipografia e Textos
- **Família Oficial**: `Atkinson Hyperlegible Next` (especialmente desenvolvida para máxima distinção de caracteres).
- **Tom de Voz**: Acolhedor, motivador, objetivo e direto (Português do Brasil - PT-BR).
- **Regra de Acessibilidade**: Dosagens e horários nunca ficam abaixo de 16px.

---

## Mascote Oficial: "Cápsula Companheira" (IP-as-Logo - Regra Imutável)
- **Asset Canônico Oficial**: `assets/mascot-canonical.jpg` (`capsule_solid_bg_2_1787386895140.jpg`).
- **Anatomia Fixa**:
  - Cápsula espessa e arredondada em inclinação sutil (~30°).
  - Sem membros humanos (sem pernas/braços extras).
  - Olhos redondos em Azul Índigo (`#2A5B84`) com sorriso discreto.
  - Divisão bicolor exata: Topo Verde Menta (`#6ECB98`) e Base Azul Céu Claro (`#60A5FA`).
  - Fundo sólido canônico: Navy Blue Profundo (`#101A24`).
- **Regra de Consistência**: O estilo gráfico, o formato e as cores da mascote **não podem ser alterados**. Variações futuras são estritamente para micro-expressões faciais (olhos piscando, sorriso maior) e enquadramentos, preservando a identidade visual 100% fiel ao asset canônico.
- **Locais de Aplicação**: Onboarding, Empty States (quando não há doses pendentes), Banners de Adesão 100% e ícone de branding.
- **Regra Clean Edition**: O mascote chunky NÃO é usado como ícone em listas de medicamentos. Listas usam ícone de pílula Lucide em fundos Bento pastéis.

---

## Iconografia e Representação Visual (Regra Estrita: Zero Emojis)
- **Biblioteca Exclusiva**: **`iconoir-react-native`** (para ícones de interface).
- **Ícones de Medicamento em Listas**: SVG de pílula (Lucide `Pill`) em containers 44×44px com fundos Bento pastéis (Menta/Pêssego/Lilás).
- **Regra de Ouro**: **NUNCA** utilizar emojis de sistema (ex: 💊, ✨, 💚, 🔒, etc.) para representação visual, badges, estados ou feedback na interface.
- **Padrão**: Todo e qualquer símbolo gráfico deve ser um componente vetorial do Iconoir ou Lucide, garantindo consistência de traço (`strokeWidth`), alinhamento óptico e adaptação fiel à paleta de cores (`colors.ts`).

---

## Navegação (Clean Edition v2)
- **Tab Bar Flutuante**: Barra de navegação em formato pill, flutuando 24px acima da borda inferior da tela.
- **Sombra**: `0 10px 40px rgba(0,0,0,0.08)`.
- **Ordem das Abas**: Hoje → Medicamentos → Histórico → Perfil.
- **Item Ativo**: Fundo `#F0F2F5` arredondado.

---

## Avatares do Usuário & Personalização do Perfil
- **Galeria Oficial de Avatares**: 4 personagens companheiros 2D minimalistas (`preview/assets/avatars/`):
  - **Cachorro**: Fundo Verde Menta (`#84DCAE`) + Azul Marinho (`#101A24`).
  - **Coruja**: Fundo Azul Céu (`#93C5FD`) + Pêssego (`#FFC6A5`).
  - **Gato**: Fundo Lilás (`#D4C1FF`) + Azul Marinho (`#101A24`).
  - **Urso**: Fundo Amarelo Solar (`#FDE047`) + Azul Marinho (`#101A24`).
- **Avatar com Inicial do Nome**: Opção da letra inicial do usuário sobre fundo colorido, com seletor em grade 3x2 oferecendo 6 cores da identidade (Menta, Azul Céu, Lilás, Pêssego, Amarelo Solar, Azul Marinho).
- **Interação**: Modal Bottom Sheet dedicado ("Personalizar Foto") com seleção e feedback em tempo real.

---

## Tela de Perfil & Configuração de Lembretes
- **Card de Identificação**: Exibe avatar do usuário, nome e link de ação para edição rápida.
- **Grupo de Configuração de Lembretes**: 6 controles organizados em ordem de dependência funcional:
  1. *Receber notificações* (Toggle)
  2. *Tocar no silencioso* (Toggle)
  3. *Avisar no horário exato* (Ação: Revisar)
  4. *Alarme em tela cheia* (Toggle)
  5. *Detalhes na tela bloqueada* (Toggle: Visíveis / Ocultos)
  6. *Funcionamento em segundo plano* (Ação: Abrir configurações)
- **Card Testar Alarme**: Container Bento em tom Pêssego com botão de ação rápida simulando a contagem de disparo do alarme sonoro em 5 segundos.
- **Seção Sobre**: Identificação da versão do app e garantia do modelo de privacidade local-first.

---

## Regras de Geração Visual por IA (Mundo "Bento Tátil")
- **Imutabilidade do Mascote (Sagrado):** A IA **não está autorizada** a gerar versões do mascote ("Cápsula Companheira") que alterem sua anatomia base (divisão de cores Menta/Azul, inclinação, formato de pílula grossa, olhos redondos e sorriso sutil). O mascote é uma âncora fixa. Variações de IA só podem alterar o ambiente, acessórios contextuais ou expressões (ex: dormindo), mantendo o core idêntico.
- **Formas Companheiras (World-Building):** Para ilustrar telas, states e onboarding, a IA deve gerar assets geométricos (ex: calendários de humor, gráficos de stress, pílulas secundárias, checkmarks grandes) no estilo **"Bento Tátil"**. 
  - **Características do estilo:** Blocos de cor pastel sólidos e vibrantes, formas bold super-arredondadas (squircles), sem texturas realistas ou gradientes complexos (estilo Duolingo/Tinder flat-tactile).

---

## Arquivos de Governança
- **`PRODUCT.md`**: Princípios e verdades duráveis do produto.
- **`DESIGN.md`**: Tokens normativos, regras nomeadas e especificações de componentes (Clean Edition v2).
- **`.agents/rules/design-system.md`**: Especificação técnica da Clean Edition para agentes IA.
- **`.agents/rules/icon-style.md`**: Guia de estilo para ícones e ilustrações.
- **`docs/adr/0013-clean-edition-design-migration.md`**: ADR registrando a decisão de migração.
