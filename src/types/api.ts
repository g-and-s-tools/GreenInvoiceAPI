export interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface APIErrorResponse {
  message: string;
  error?: string;
  code?: string;
  statusCode: number;
}
