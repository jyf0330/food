export function navigateTo(url: string): void {
  uni.navigateTo({ url });
}

export function redirectTo(url: string): void {
  uni.redirectTo({ url });
}

export function navigateBackToHome(): void {
  uni.redirectTo({ url: "/pages/index/index" });
}
