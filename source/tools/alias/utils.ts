export function useFileFlag(options: Record<string, unknown>): boolean {
  return Boolean(options?.useFile ?? false);
}
