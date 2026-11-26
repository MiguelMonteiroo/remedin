---
name: Remedin
description: Aplicativo Android de rotina de medicamentos e lembretes locais.
---

# Identidade visual do Remedin

A cápsula é o símbolo do Remedin. O código da marca fica em [RemedinBrand.tsx](src/components/brand/RemedinBrand.tsx) e os ícones de lançamento ficam nos recursos [Android](android/app/src/main/res). A animação de abertura apresenta a cápsula e o nome sobre o fundo coral.

## Cores

[src/theme/theme.ts](src/theme/theme.ts) define os tokens e as cores semânticas. O app acompanha a preferência de aparência do Android.

| Token | Claro | Escuro |
| --- | --- | --- |
| Fundo | `#FAF7F6` | `#291C1C` |
| Superfície | `#FFFFFF` | `#3A2928` |
| Texto | `#40282A` | `#F1ECEB` |
| Texto secundário | `#695354` | `#D8C5C2` |
| Cor primária | `#A44945` | `#FFB4AA` |
| Borda | `#E4D6D4` | `#694946` |

Use as cores semânticas de sucesso, atenção e erro para o estado correspondente. Os pastéis Bento aparecem em ilustrações e elementos pontuais com contraste adequado.

## Tipografia e componentes

- A família do app é Atkinson Hyperlegible Next. As escalas ficam em [typography.ts](src/theme/typography.ts).
- Use [os componentes de interface](src/components/ui) e os tokens de espaçamento e raios ao criar telas. Ícones da interface vêm de Lucide.
- Use ação e rótulo claros, estados que possam ser lidos por tecnologia assistiva e alvos confortáveis de toque.
- A barra inferior fixa ocupa a largura da tela. A aba ativa usa um traço coral e texto em negrito. A ordem é Hoje, Medicamentos, Histórico e Perfil.

## Perfil

A [galeria](assets/avatars) contém dez ilustrações 2D que funcionam no recorte circular. O seletor aparece na configuração inicial e na edição do perfil. O nome e o identificador do avatar são armazenados localmente.
