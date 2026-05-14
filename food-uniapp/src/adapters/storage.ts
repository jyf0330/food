export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key);
    return value === "" || value === undefined || value === null ? fallback : (value as T);
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    uni.setStorageSync(key, value);
  } catch {
    // Storage failure should not block the cooking flow.
  }
}
