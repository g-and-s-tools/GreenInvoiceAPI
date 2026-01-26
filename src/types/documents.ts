import { Currency, Language } from './common';

/**
 * Document type numeric codes as expected by the Green Invoice API
 *
 * @see https://github.com/yanivps/green-invoice/blob/master/green_invoice/models.py
 */
export enum DocumentType {
  /** Price quote (הצעת מחיר) */
  PRICE_QUOTE = 10,
  /** Order (הזמנה) */
  ORDER = 100,
  /** Delivery note (תעודת משלוח) */
  DELIVERY_NOTE = 200,
  /** Return delivery note (תעודת משלוח החזרה) */
  RETURN_DELIVERY_NOTE = 210,
  /** Transaction account (חשבון עסקה) */
  TRANSACTION_ACCOUNT = 300,
  /** Tax invoice (חשבונית מס) */
  TAX_INVOICE = 305,
  /** Tax invoice receipt (חשבונית מס קבלה) */
  TAX_INVOICE_RECEIPT = 320,
  /** Refund (זיכוי) */
  REFUND = 330,
  /** Receipt (קבלה) */
  RECEIPT = 400,
  /** Receipt for donation (קבלה על תרומה) */
  RECEIPT_FOR_DONATION = 405,
  /** Purchase order (הזמנת רכש) */
  PURCHASE_ORDER = 500,
  /** Receipt of a deposit (קבלת פיקדון) */
  RECEIPT_OF_A_DEPOSIT = 600,
  /** Withdrawal of deposit (משיכת פיקדון) */
  WITHDRAWAL_OF_DEPOSIT = 610,
}

export type PaymentType =
  | 'cash'
  | 'creditCard'
  | 'check'
  | 'bankTransfer'
  | 'other';

export type VatType = 'included' | 'excluded' | 'exempt';

export interface IncomeItem {
  description: string;
  quantity: number;
  price: number;
  currency?: Currency;
  vatType?: number; // VAT type code (1 = included, 2 = excluded, etc.)
}

export interface DocumentClient {
  id?: string;
  name: string;
  emails?: string[]; // Note: API uses array of emails
  phone?: string;
  taxId?: string;
  add?: boolean; // Whether to add client if doesn't exist
}

export interface Payment {
  type: number; // Payment type code: 1=cash, 2=check, 3=credit card, etc.
  price: number; // Amount (API uses 'price' not 'amount')
  currency?: Currency;
  date?: string; // Format: YYYY-MM-DD
  currencyRate?: number; // Exchange rate for foreign currency

  // Credit card fields (for type=3)
  cardType?: number; // Card type code
  cardNum?: string; // Last 4 digits of card
  dealType?: number; // Deal type code (regular, installments, etc.)
  transactionId?: string; // Transaction reference ID

  // Check fields (for type=2)
  chequeNum?: string; // Check number (Israeli spelling: cheque)
  bankName?: string; // Bank name (e.g., "בנק לאומי", "Bank Leumi")
  bankBranch?: string; // Bank branch number (e.g., "902")
  bankAccount?: string; // Bank account number

  // General account reference
  accountId?: string; // Account identifier
}

export interface Document {
  id: string;
  documentNumber: string;
  type: DocumentType;
  date: string;
  dueDate?: string;
  client: DocumentClient;
  income: IncomeItem[]; // API uses 'income' not 'items'
  currency: Currency;
  lang: Language; // API uses 'lang' not 'language'
  subtotal: number;
  vat: number;
  total: number;
  payment?: Payment[]; // API uses 'payment' not 'payments'
  remarks?: string; // API uses 'remarks' not 'notes'
  footer?: string;
  signed?: boolean;
  url?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  type: DocumentType;
  client: DocumentClient;
  income: IncomeItem[]; // API expects 'income' array
  currency?: Currency;
  lang?: Language; // API expects 'lang' not 'language'
  date?: string;
  dueDate?: string;
  payment?: Payment[]; // API expects 'payment' not 'payments'
  remarks?: string; // API expects 'remarks' not 'notes'
  footer?: string;
  signed?: boolean;
  rounding?: boolean;
}

export interface UpdateDocumentRequest {
  client?: Partial<DocumentClient>;
  income?: IncomeItem[];
  date?: string;
  dueDate?: string;
  payment?: Payment[];
  remarks?: string;
  footer?: string;
  signed?: boolean;
}

export interface DocumentSearchQuery {
  clientId?: string;
  clientName?: string;
  type?: DocumentType;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  signed?: boolean;
}

export interface ListDocumentsParams {
  page?: number;
  pageSize?: number;
  type?: DocumentType;
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  sort?: 'date' | 'amount' | 'documentNumber';
  sortOrder?: 'asc' | 'desc';
}

export interface SendDocumentOptions {
  to: string | string[];
  cc?: string | string[];
  subject?: string;
  body?: string;
}
