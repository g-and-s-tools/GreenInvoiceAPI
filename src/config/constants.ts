export const API_BASE_URLS = {
  production: 'https://api.greeninvoice.co.il/api/v1',
  sandbox: 'https://sandbox.d.greeninvoice.co.il/api/v1',
} as const;

export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RATE_LIMIT_PER_SECOND = 3;
export const DEFAULT_RATE_LIMIT_BURST = 5;
export const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour
export const TOKEN_REFRESH_BUFFER_SECONDS = 120; // Refresh 2 minutes before expiry
