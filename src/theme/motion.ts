import { Easing } from "react-native";

export const motionDurations = {
  fast: 150,
  normal: 250,
  slow: 350,
  splash: 450,
} as const;

export const motionEasings = {
  enter: Easing.out(Easing.cubic),
  exit: Easing.in(Easing.cubic),
  standard: Easing.inOut(Easing.cubic),
} as const;
