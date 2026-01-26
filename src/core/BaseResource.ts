import { HttpClient } from './HttpClient';

export abstract class BaseResource {
  protected httpClient: HttpClient;
  protected basePath: string;

  constructor(httpClient: HttpClient, basePath: string) {
    this.httpClient = httpClient;
    this.basePath = basePath;
  }

  protected buildPath(endpoint: string = ''): string {
    if (!endpoint) {
      return this.basePath;
    }
    return `${this.basePath}/${endpoint}`;
  }

  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string = '',
    data?: any,
    params?: any
  ): Promise<T> {
    const path = this.buildPath(endpoint);

    switch (method) {
      case 'GET':
        return this.httpClient.get<T>(path, params);
      case 'POST':
        return this.httpClient.post<T>(path, data);
      case 'PUT':
        return this.httpClient.put<T>(path, data);
      case 'PATCH':
        return this.httpClient.patch<T>(path, data);
      case 'DELETE':
        return this.httpClient.delete<T>(path);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }
}
