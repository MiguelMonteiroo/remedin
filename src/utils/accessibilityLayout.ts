export function isLargeText(fontScale: number): boolean {
  // Android's Float bridge can report 130% as 1.2999999523.
  return Math.round(fontScale * 100) >= 130;
}
