import { BaseResource } from '../core/BaseResource';
import { HttpClient } from '../core/HttpClient';
import { PaginatedResponse } from '../types/common';
import {
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  ListClientsParams,
} from '../types/clients';

export class Clients extends BaseResource {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/clients');
  }

  /**
   * Create a new client
   *
   * @param client - The client data to create
   * @returns Promise resolving to the created client
   *
   * @example
   * ```typescript
   * const client = await api.clients.create({
   *   name: 'Acme Corp',
   *   email: 'contact@acme.com',
   *   phone: '+972-50-1234567',
   *   taxId: '123456789'
   * });
   * ```
   */
  async create(client: CreateClientRequest): Promise<Client> {
    return this.request<Client>('POST', '', client);
  }

  /**
   * Get a client by ID
   *
   * @param clientId - The client ID
   * @returns Promise resolving to the client
   */
  async get(clientId: string): Promise<Client> {
    return this.request<Client>('GET', clientId);
  }

  /**
   * Update an existing client
   *
   * @param clientId - The client ID
   * @param updates - The fields to update
   * @returns Promise resolving to the updated client
   */
  async update(clientId: string, updates: UpdateClientRequest): Promise<Client> {
    return this.request<Client>('PUT', clientId, updates);
  }

  /**
   * Delete a client
   *
   * @param clientId - The client ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(clientId: string): Promise<void> {
    return this.request<void>('DELETE', clientId);
  }

  /**
   * List clients with optional filtering and pagination
   *
   * @param params - List parameters (pagination, filters, sorting)
   * @returns Promise resolving to paginated clients
   *
   * @example
   * ```typescript
   * const result = await api.clients.list({
   *   page: 1,
   *   pageSize: 50,
   *   search: 'Acme',
   *   active: true
   * });
   * ```
   */
  async list(params?: ListClientsParams): Promise<PaginatedResponse<Client>> {
    return this.request<PaginatedResponse<Client>>('GET', '', undefined, params);
  }

  /**
   * Search clients by name or other criteria
   *
   * @param query - Search query string or search parameters
   * @returns Promise resolving to matching clients
   *
   * @example
   * ```typescript
   * // Search by name
   * const clients = await api.clients.search('Acme');
   *
   * // Search by tax ID
   * const client = await api.clients.findByTaxId('123456789');
   * ```
   */
  async search(query: string | object): Promise<Client[]> {
    // Use POST to /clients/search endpoint
    const searchParams = typeof query === 'string' ? { name: query } : query;
    const response = await this.request<any>('POST', 'search', searchParams);

    // Response could be array or object with items
    return Array.isArray(response) ? response : (response.items || []);
  }

  /**
   * Find a client by tax ID
   *
   * @param taxId - The client's tax ID
   * @returns Promise resolving to the client or null if not found
   *
   * @example
   * ```typescript
   * const client = await api.clients.findByTaxId('123456789');
   * if (client) {
   *   console.log('Found client:', client.name);
   * }
   * ```
   */
  async findByTaxId(taxId: string): Promise<Client | null> {
    const str = String(taxId);
    const stripped = str.replace(/^0+/, '') || '0';
    const variants = [...new Set([str, stripped, stripped.padStart(9, '0')])];

    for (const variant of variants) {
      try {
        // Use POST to /clients/search endpoint with taxId in body
        const response = await this.request<any>('POST', 'search', { taxId: variant });

        // Response could be array or object with items
        const items: Client[] = Array.isArray(response) ? response : (response.items || []);
        const active = items.filter((c: any) => c.active !== false);
        if (active.length > 0) return active[0];
      } catch (error) {
        // If not found or endpoint doesn't support this, try next variant
        continue;
      }
    }

    return null;
  }
}
