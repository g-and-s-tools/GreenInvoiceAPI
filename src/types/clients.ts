import { Address } from './common';

export type ClientType = 'business' | 'individual';

export interface Client {
  id: string;
  name: string;
  type?: ClientType;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  taxId?: string;
  address?: Address;
  active: boolean;
  balance?: number;
  currency?: string;
  paymentTerms?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  type?: ClientType;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  taxId?: string;
  address?: Address;
  paymentTerms?: number;
  currency?: string;
  active?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  type?: ClientType;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  taxId?: string;
  address?: Address;
  paymentTerms?: number;
  currency?: string;
  active?: boolean;
}

export interface ListClientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  active?: boolean;
  sort?: 'name' | 'createdAt' | 'balance';
  sortOrder?: 'asc' | 'desc';
}
