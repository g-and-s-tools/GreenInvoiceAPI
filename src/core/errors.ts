export class GreenInvoiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public requestId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GreenInvoiceError';
    Object.setPrototypeOf(this, GreenInvoiceError.prototype);
  }
}

export class AuthenticationError extends GreenInvoiceError {
  constructor(message: string, code?: string, requestId?: string) {
    super(message, code, 401, requestId);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class ValidationError extends GreenInvoiceError {
  constructor(message: string, code?: string, requestId?: string) {
    super(message, code, 400, requestId);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class RateLimitError extends GreenInvoiceError {
  constructor(
    message: string,
    public retryAfter?: number,
    requestId?: string
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, requestId);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export class APIError extends GreenInvoiceError {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    requestId?: string
  ) {
    super(message, code, statusCode, requestId);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class NetworkError extends GreenInvoiceError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', undefined, undefined, originalError);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
