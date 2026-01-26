import { RateLimiter } from '../../../src/core/RateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it('should allow requests within rate limit', async () => {
    const rateLimiter = new RateLimiter(10, 10); // High limit for testing
    const start = Date.now();

    await rateLimiter.waitForToken();
    await rateLimiter.waitForToken();
    await rateLimiter.waitForToken();

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100); // Should be immediate
  });

  it('should delay when rate limit exceeded', async () => {
    const rateLimiter = new RateLimiter(2, 2); // 2 requests per second, bucket size 2
    const start = Date.now();

    // First 2 requests should be immediate
    await rateLimiter.waitForToken();
    await rateLimiter.waitForToken();

    // Third request should wait
    await rateLimiter.waitForToken();

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(400); // Should wait ~500ms
  });

  it('should reset tokens correctly', async () => {
    const rateLimiter = new RateLimiter(2, 2);

    await rateLimiter.waitForToken();
    await rateLimiter.waitForToken();

    rateLimiter.reset();

    const start = Date.now();
    await rateLimiter.waitForToken();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(100); // Should be immediate after reset
  });

  it('should handle burst capacity', async () => {
    const rateLimiter = new RateLimiter(1, 5); // 1 per second, but burst of 5

    const start = Date.now();

    // Should allow 5 requests immediately
    for (let i = 0; i < 5; i++) {
      await rateLimiter.waitForToken();
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200); // All should be immediate
  });
});
