/**
 * Phase 1 keeps phone handling simple: strip everything that is not a digit
 * or a leading plus. Full country-code rules arrive in Phase 3.
 */
export function cleanPhone(raw: string): string {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return hasPlus ? `+${digits}` : digits;
}
