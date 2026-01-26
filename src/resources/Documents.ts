import { BaseResource } from '../core/BaseResource';
import { HttpClient } from '../core/HttpClient';
import { PaginatedResponse } from '../types/common';
import {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentSearchQuery,
  ListDocumentsParams,
  SendDocumentOptions,
} from '../types/documents';

export class Documents extends BaseResource {
  constructor(httpClient: HttpClient) {
    super(httpClient, '/documents');
  }

  /**
   * Create a new document (invoice, receipt, quote, etc.)
   *
   * @param document - The document data to create
   * @returns Promise resolving to the created document
   *
   * @example
   * ```typescript
   * const invoice = await client.documents.create({
   *   type: 'invoice',
   *   client: { name: 'John Doe', email: 'john@example.com' },
   *   items: [{ description: 'Consulting', quantity: 1, price: 1000 }],
   *   currency: 'ILS',
   *   language: 'en'
   * });
   * ```
   */
  async create(document: CreateDocumentRequest): Promise<Document> {
    return this.request<Document>('POST', '', document);
  }

  /**
   * Get a document by ID
   *
   * @param documentId - The document ID
   * @returns Promise resolving to the document
   */
  async get(documentId: string): Promise<Document> {
    return this.request<Document>('GET', documentId);
  }

  /**
   * Update an existing document
   *
   * @param documentId - The document ID
   * @param updates - The fields to update
   * @returns Promise resolving to the updated document
   */
  async update(
    documentId: string,
    updates: UpdateDocumentRequest
  ): Promise<Document> {
    return this.request<Document>('PUT', documentId, updates);
  }

  /**
   * Delete a document
   *
   * @param documentId - The document ID
   * @returns Promise resolving when deletion is complete
   */
  async delete(documentId: string): Promise<void> {
    return this.request<void>('DELETE', documentId);
  }

  /**
   * List documents with optional filtering and pagination
   *
   * @param params - List parameters (pagination, filters, sorting)
   * @returns Promise resolving to paginated documents
   *
   * @example
   * ```typescript
   * const result = await client.documents.list({
   *   page: 1,
   *   pageSize: 20,
   *   type: 'invoice',
   *   fromDate: '2024-01-01'
   * });
   * ```
   */
  async list(
    params?: ListDocumentsParams
  ): Promise<PaginatedResponse<Document>> {
    return this.request<PaginatedResponse<Document>>('GET', '', undefined, params);
  }

  /**
   * Search documents with complex criteria
   *
   * @param query - Search criteria
   * @returns Promise resolving to matching documents
   */
  async search(query: DocumentSearchQuery): Promise<Document[]> {
    return this.request<Document[]>('POST', 'search', query);
  }

  /**
   * Download document PDF
   *
   * @param documentId - The document ID
   * @returns Promise resolving to PDF buffer
   */
  async downloadPdf(documentId: string): Promise<Buffer> {
    return this.request<Buffer>('GET', `${documentId}/pdf`);
  }

  /**
   * Send document via email
   *
   * @param documentId - The document ID
   * @param options - Email options (recipients, subject, body)
   * @returns Promise resolving when email is sent
   *
   * @example
   * ```typescript
   * await client.documents.send('doc123', {
   *   to: 'customer@example.com',
   *   subject: 'Your Invoice',
   *   body: 'Please find your invoice attached.'
   * });
   * ```
   */
  async send(documentId: string, options: SendDocumentOptions): Promise<void> {
    return this.request<void>('POST', `${documentId}/send`, options);
  }
}
