// Fixed illustration colors remain paired with dark ink, irrespective of the
// surrounding theme. They are not general-purpose surface or text tokens.
const illustrationColors = {
  bentoMenta: "#84DCAE", bentoPeach: "#FFC6A5", bentoLilac: "#D4C1FF",
  bentoSun: "#FDE047", bentoSky: "#93C5FD",
  navyDeep: "#101A24", navySurface: "#182430", white: "#FFFFFF",
} as const;

export type ThemeName = "light" | "dark";

export function resolveThemeName(scheme: "light" | "dark" | "unspecified" | null | undefined): ThemeName {
  return scheme === "dark" ? "dark" : "light";
}

export const themes = {
  light: {
    ...illustrationColors,
    background: "#FAF7F6", surface: "#FFFFFF", surfaceMuted: "#F3ECEB",
    text: "#40282A", textMuted: "#695354", border: "#E4D6D4",
    borderStrong: "#BCA6A3", borderWarm: "#BCA6A3", controlBorder: "#806D6C",
    primary: "#A44945", onPrimary: "#FFFFFF", primaryDark: "#6F3435",
    primaryMuted: "#764541", primarySoft: "#FFE1DC", primaryBorder: "#DCB0AA",
    primaryGlow: "rgba(164,73,69,0.25)",
    accent: "#FFE1DC", accentSoft: "#FFF0ED", accentBorder: "#DCB0AA", accentSelectionBorder: "#A44945",
    info: "#285A78", infoSoft: "#E1ECF5", infoBorder: "#83AEC8",
    success: "#26644E", successSoft: "#DDF3E6", successBorder: "#81B9A0",
    warning: "#805100", warningSoft: "#FFF0CE", danger: "#8C2540", dangerSoft: "#FFE2E9", dangerBorder: "#C68A9B",
  },
  dark: {
    ...illustrationColors,
    background: "#291C1C", surface: "#3A2928", surfaceMuted: "#503938",
    text: "#F1ECEB", textMuted: "#D8C5C2", border: "#694946",
    borderStrong: "#A98580", borderWarm: "#A98580", controlBorder: "#BDA09D",
    primary: "#FFB4AA", onPrimary: "#291C1C", primaryDark: "#FFDAD4",
    primaryMuted: "#E2B5AE", primarySoft: "#633C39", primaryBorder: "#AA7870",
    primaryGlow: "rgba(255,180,170,0.25)",
    accent: "#FFDAD4", accentSoft: "#633C39", accentBorder: "#AA7870", accentSelectionBorder: "#FFB4AA",
    info: "#B8DBF1", infoSoft: "#20475D", infoBorder: "#7CA9C2",
    success: "#B6E8CE", successSoft: "#174A39", successBorder: "#76B497",
    warning: "#FFE0A0", warningSoft: "#563800", danger: "#FFD9E1", dangerSoft: "#70233A", dangerBorder: "#C88498",
  },
} as const;

export type ThemeColors = { [K in keyof typeof themes.light]: string };
