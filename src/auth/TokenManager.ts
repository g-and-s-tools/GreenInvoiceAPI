import axios, { AxiosInstance } from 'axios';
import { AuthenticationError, NetworkError } from '../core/errors';
import {
  TOKEN_EXPIRY_SECONDS,
  TOKEN_REFRESH_BUFFER_SECONDS,
} from '../config/constants';

export interface TokenResponse {
  token: string;
}

export interface AuthConfig {
  apiKeyId: string;
  apiKeySecret: string;
  baseUrl: string;
  timeout?: number;
}

export class TokenManager {
  private apiKeyId: string;
  private apiKeySecret: string;
  private baseUrl: string;
  private currentToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private refreshPromise: Promise<string> | null = null;
  private axiosInstance: AxiosInstance;

  constructor(config: AuthConfig) {
    this.apiKeyId = config.apiKeyId;
    this.apiKeySecret = config.apiKeySecret;
    this.baseUrl = config.baseUrl;
    this.axiosInstance = axios.create({
      timeout: config.timeout || 30000,
    });
  }

  async getToken(): Promise<string> {
    // If token exists and not expired, return it
    if (this.currentToken && !this.isTokenExpired()) {
      return this.currentToken;
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Start new token fetch
    this.refreshPromise = this.fetchNewToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  async refreshToken(): Promise<string> {
    this.currentToken = null;
    this.tokenExpiry = null;
    return this.getToken();
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiry) {
      return true;
    }

    const now = new Date();
    const expiryWithBuffer = new Date(
      this.tokenExpiry.getTime() - TOKEN_REFRESH_BUFFER_SECONDS * 1000
    );

    return now >= expiryWithBuffer;
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await this.axiosInstance.post<TokenResponse>(
        `${this.baseUrl}/account/token`,
        {
          id: this.apiKeyId,
          secret: this.apiKeySecret,
        }
      );

      if (!response.data || !response.data.token) {
        throw new AuthenticationError(
          'Token response missing token field',
          'INVALID_RESPONSE'
        );
      }

      this.currentToken = response.data.token;
      this.tokenExpiry = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000);

      return this.currentToken;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const statusCode = error.response.status;
          const message =
            error.response.data?.message ||
            error.response.data?.error ||
            'Authentication failed';

          if (statusCode === 401 || statusCode === 403) {
            throw new AuthenticationError(
              message,
              'INVALID_CREDENTIALS',
              error.response.headers['x-request-id']
            );
          }

          throw new AuthenticationError(
            `Failed to fetch token: ${message}`,
            'TOKEN_FETCH_FAILED',
            error.response.headers['x-request-id']
          );
        }

        throw new NetworkError('Network error during authentication', error);
      }

      throw new AuthenticationError(
        'Unexpected error during authentication',
        'UNKNOWN_ERROR'
      );
    }
  }

  clearToken(): void {
    this.currentToken = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;
  }
}
