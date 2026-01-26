import { TokenManager } from './auth/TokenManager';
import { HttpClient } from './core/HttpClient';
import { RateLimiter } from './core/RateLimiter';
import { Documents } from './resources/Documents';
import { Clients } from './resources/Clients';
import { GreenInvoiceConfig } from './config/types';
import {
  API_BASE_URLS,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RATE_LIMIT_PER_SECOND,
  DEFAULT_RATE_LIMIT_BURST,
} from './config/constants';

export class GreenInvoiceAPI {
  private tokenManager: TokenManager;
  private httpClient: HttpClient;
  private rateLimiter: RateLimiter;
  private config: GreenInvoiceConfig;

  public readonly documents: Documents;
  public readonly clients: Clients;

  /**
   * Create a new Green Invoice API client
   *
   * @param config - Configuration options
   *
   * @example
   * ```typescript
   * const client = new GreenInvoiceAPI({
   *   apiKey: 'your-api-key',
   *   secret: 'your-secret',
   *   environment: 'production'
   * });
   * ```
   */
  constructor(config: GreenInvoiceConfig) {
    // Validate required fields
    if (!config.apiKey) {
      throw new Error('apiKey is required');
    }
    if (!config.secret) {
      throw new Error('secret is required');
    }

    this.config = {
      environment: 'production',
      timeout: DEFAULT_TIMEOUT,
      maxRetries: DEFAULT_MAX_RETRIES,
      rateLimit: {
        requestsPerSecond: DEFAULT_RATE_LIMIT_PER_SECOND,
        burstCapacity: DEFAULT_RATE_LIMIT_BURST,
      },
      debug: false,
      ...config,
    };

    // Get base URL based on environment
    const baseUrl =
      API_BASE_URLS[this.config.environment || 'production'];

    // Initialize TokenManager
    this.tokenManager = new TokenManager({
      apiKeyId: this.config.apiKey,
      apiKeySecret: this.config.secret,
      baseUrl,
      timeout: this.config.timeout,
    });

    // Initialize RateLimiter
    this.rateLimiter = new RateLimiter(
      this.config.rateLimit?.requestsPerSecond || DEFAULT_RATE_LIMIT_PER_SECOND,
      this.config.rateLimit?.burstCapacity || DEFAULT_RATE_LIMIT_BURST
    );

    // Initialize HttpClient
    this.httpClient = new HttpClient({
      baseUrl,
      tokenManager: this.tokenManager,
      rateLimiter: this.rateLimiter,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
      debug: this.config.debug,
    });

    // Initialize resources
    this.documents = new Documents(this.httpClient);
    this.clients = new Clients(this.httpClient);
  }

  /**
   * Test the connection to the Green Invoice API
   *
   * @returns Promise resolving to true if connection is successful
   *
   * @example
   * ```typescript
   * const isConnected = await client.testConnection();
   * console.log('Connected:', isConnected);
   * ```
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.tokenManager.getToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Manually refresh the authentication token
   *
   * @returns Promise resolving when token is refreshed
   *
   * @example
   * ```typescript
   * await client.refreshToken();
   * ```
   */
  async refreshToken(): Promise<void> {
    await this.tokenManager.refreshToken();
  }

  /**
   * Clear the cached authentication token
   *
   * @example
   * ```typescript
   * client.clearToken();
   * ```
   */
  clearToken(): void {
    this.tokenManager.clearToken();
  }

  /**
   * Reset the rate limiter
   *
   * @example
   * ```typescript
   * client.resetRateLimiter();
   * ```
   */
  resetRateLimiter(): void {
    this.rateLimiter.reset();
  }
}
