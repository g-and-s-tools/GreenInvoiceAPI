export interface GreenInvoiceConfig {
  apiKey: string;
  secret: string;
  environment?: 'production' | 'sandbox';
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requestsPerSecond?: number;
    burstCapacity?: number;
  };
  debug?: boolean;
}

export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}
