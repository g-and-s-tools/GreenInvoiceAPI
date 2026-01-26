export class RateLimiter {
  private tokensPerSecond: number;
  private bucketSize: number;
  private tokens: number;
  private lastRefill: number;

  constructor(tokensPerSecond: number = 3, bucketSize: number = 5) {
    this.tokensPerSecond = tokensPerSecond;
    this.bucketSize = bucketSize;
    this.tokens = bucketSize; // Start with full bucket
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate delay needed
    const delay = this.calculateDelay();
    await this.sleep(delay);

    // After delay, refill and consume token
    this.refillTokens();
    this.tokens -= 1;
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.tokensPerSecond;

    this.tokens = Math.min(this.bucketSize, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  private calculateDelay(): number {
    // Calculate milliseconds until next token is available
    const tokensNeeded = 1 - this.tokens;
    const delay = (tokensNeeded / this.tokensPerSecond) * 1000;
    return Math.ceil(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(): void {
    this.tokens = this.bucketSize;
    this.lastRefill = Date.now();
  }
}
