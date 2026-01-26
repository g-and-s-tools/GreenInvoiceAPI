import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { TokenManager } from '../auth/TokenManager';
import { RateLimiter } from './RateLimiter';
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  APIError,
  NetworkError,
} from './errors';

export interface HttpClientConfig {
  baseUrl: string;
  tokenManager: TokenManager;
  rateLimiter: RateLimiter;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private tokenManager: TokenManager;
  private rateLimiter: RateLimiter;
  private maxRetries: number;
  private debug: boolean;

  constructor(config: HttpClientConfig) {
    this.tokenManager = config.tokenManager;
    this.rateLimiter = config.rateLimiter;
    this.maxRetries = config.maxRetries || 3;
    this.debug = config.debug || false;

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  async get<T>(path: string, params?: any): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('POST', path, data);
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PUT', path, data);
  }

  async patch<T>(path: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', path, data);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: path,
      data,
      params,
    };

    return this.executeRequest<T>(config);
  }

  private async executeRequest<T>(
    config: AxiosRequestConfig,
    retryCount: number = 0
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error: any) {
      if (this.shouldRetry(error, retryCount)) {
        const delay = this.calculateBackoff(retryCount);
        if (this.debug) {
          console.log(
            `Retrying request (attempt ${retryCount + 1}/${this.maxRetries}) after ${delay}ms`
          );
        }
        await this.sleep(delay);
        return this.executeRequest<T>(config, retryCount + 1);
      }

      throw this.transformError(error);
    }
  }

  private setupInterceptors(): void {
    // Request interceptor: Add token and rate limiting
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Wait for rate limiter
        await this.rateLimiter.waitForToken();

        // Get and inject token
        const token = await this.tokenManager.getToken();
        config.headers.Authorization = `Bearer ${token}`;

        if (this.debug) {
          console.log(`${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle token expiry
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Force token refresh
            await this.tokenManager.refreshToken();

            // Retry original request
            return this.axiosInstance.request(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: any, retryCount: number): boolean {
    if (retryCount >= this.maxRetries) {
      return false;
    }

    if (!axios.isAxiosError(error)) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    const status = error.response.status;

    // Retry on 429 (rate limit) and 5xx errors
    return status === 429 || (status >= 500 && status < 600);
  }

  private calculateBackoff(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s (max 10s)
    return Math.min(1000 * Math.pow(2, retryCount), 10000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private transformError(error: any): Error {
    if (!axios.isAxiosError(error)) {
      return error;
    }

    if (!error.response) {
      return new NetworkError(
        error.message || 'Network error occurred',
        error
      );
    }

    const response = error.response;
    const statusCode = response.status;
    const requestId = response.headers['x-request-id'];

    // Try to extract error message from various possible formats
    let errorMessage = 'API error occurred';
    let errorDetails = '';

    if (response.data) {
      if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else if (response.data.message) {
        errorMessage = response.data.message;
      } else if (response.data.error) {
        errorMessage = response.data.error;
      } else if (response.data.errorMessage) {
        errorMessage = response.data.errorMessage;
      } else {
        errorMessage = response.statusText || 'API error occurred';
      }

      // Include additional error details if available
      if (response.data.errors) {
        errorDetails = ` - Details: ${JSON.stringify(response.data.errors)}`;
      } else if (response.data.details) {
        errorDetails = ` - Details: ${JSON.stringify(response.data.details)}`;
      }
    } else {
      errorMessage = response.statusText || 'API error occurred';
    }

    const fullMessage = errorMessage + errorDetails;

    if (this.debug) {
      console.error('API Error Response:', {
        status: statusCode,
        data: response.data,
        headers: response.headers,
      });
    }

    if (statusCode === 401 || statusCode === 403) {
      return new AuthenticationError(fullMessage, response.data?.code, requestId);
    }

    if (statusCode === 400) {
      return new ValidationError(fullMessage, response.data?.code, requestId);
    }

    if (statusCode === 429) {
      const retryAfter = response.headers['retry-after']
        ? parseInt(response.headers['retry-after'], 10)
        : undefined;
      return new RateLimitError(fullMessage, retryAfter, requestId);
    }

    return new APIError(fullMessage, statusCode, response.data?.code, requestId);
  }
}
