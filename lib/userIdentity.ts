export const USER_ID_PREFIX = "jtcsm_";

export function getUserIdDisplay(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  const withoutPrefix = trimmed.startsWith(USER_ID_PREFIX)
    ? trimmed.slice(USER_ID_PREFIX.length)
    : trimmed;

  return withoutPrefix
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}_-]/gu, "")
    .slice(0, 32);
}

export function buildPrefixedUserId(value: unknown): string | undefined {
  const display = getUserIdDisplay(value);
  return display ? `${USER_ID_PREFIX}${display}` : undefined;
}
