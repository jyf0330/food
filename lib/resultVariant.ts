const VARIANT_RANDOM_RANGE = 1_000_000;

export function nextResultVariant(
  now = Date.now(),
  random = Math.random()
): number {
  const jitter = Math.floor(random * VARIANT_RANDOM_RANGE);
  return Math.max(1, Math.floor(now) + jitter);
}
