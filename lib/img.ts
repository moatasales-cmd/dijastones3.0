/** First gallery image for a stone, or null if it has none. */
export function stoneImg(stone: { g?: unknown }, i = 0): string | null {
  const g = stone.g as string[] | null | undefined;
  if (Array.isArray(g) && typeof g[i] === "string" && g[i]) return g[i];
  return null;
}
