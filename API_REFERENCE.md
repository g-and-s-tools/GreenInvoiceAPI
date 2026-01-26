# Green Invoice API Reference

Complete reference for the Green Invoice API with correct field names and values.

## Document Type Codes

The Green Invoice API uses numeric codes for document types:

| Code | Name | Description (Hebrew) |
|------|------|---------------------|
| 10 | PRICE_QUOTE | הצעת מחיר |
| 100 | ORDER | הזמנה |
| 200 | DELIVERY_NOTE | תעודת משלוח |
| 210 | RETURN_DELIVERY_NOTE | תעודת משלוח החזרה |
| 300 | TRANSACTION_ACCOUNT | חשבון עסקה |
| 305 | TAX_INVOICE | חשבונית מס |
| 320 | TAX_INVOICE_RECEIPT | חשבונית מס קבלה |
| 330 | REFUND | זיכוי |
| 400 | RECEIPT | קבלה |
| 405 | RECEIPT_FOR_DONATION | קבלה על תרומה |
| 500 | PURCHASE_ORDER | הזמנת רכש |
| 600 | RECEIPT_OF_A_DEPOSIT | קבלת פיקדון |
| 610 | WITHDRAWAL_OF_DEPOSIT | משיכת פיקדון |

**Usage in SDK:**
```javascript
import { DocumentType } from '@gs/greeninvoice-api';

const invoice = await client.documents.create({
  type: DocumentType.TAX_INVOICE_RECEIPT, // 320
  // or simply use the number:
  type: 320,
  // ...
});
```

## Document Creation

### Required Fields

For creating a document, the API expects these field names (note differences from common naming):

```javascript
{
  type: 320,                      // Document type CODE (number, not string!)
  client: {
    name: "Client Name",
    emails: ["email@example.com"], // Array of emails (not single 'email')
    add: true                      // Auto-create client if doesn't exist
  },
  income: [                        // 'income' not 'items'
    {
      description: "Service name",
      quantity: 1,
      price: 100,
      currency: "ILS",
      vatType: 1                   // VAT type CODE (1 = included, 2 = excluded)
    }
  ],
  payment: [                       // 'payment' not 'payments'
    {
      type: 1,                     // Payment type CODE (1 = cash, 3 = credit card)
      price: 100,                  // 'price' not 'amount'
      currency: "ILS",
      date: "2024-01-26"          // Format: YYYY-MM-DD (required!)
    }
  ],
  currency: "ILS",
  lang: "en",                      // 'lang' not 'language'
  signed: false
}
```

### Document Type Requirements

Different document types have different requirements:

#### TAX_INVOICE_RECEIPT (320)
- **Requires** payment information
- Must include at least one payment line with valid date
- Payment date cannot be future date

#### TAX_INVOICE (305)
- Does not require payment
- Used for invoices without immediate payment

#### RECEIPT (400)
- Requires payment information
- Payment must match total amount

## Field Name Mappings

Common mistakes and corrections:

| ❌ Incorrect | ✅ Correct | Notes |
|-------------|-----------|-------|
| `items` | `income` | Line items array |
| `language` | `lang` | Language code |
| `payments` | `payment` | Payment array |
| `notes` | `remarks` | Document notes |
| `amount` | `price` | In payment objects |
| `email` | `emails` | In client object (must be array) |
| `type: "invoice"` | `type: 320` | Must be numeric code |

## VAT Type Codes

| Code | Description |
|------|-------------|
| 0 | Exempt from VAT |
| 1 | VAT included in price |
| 2 | VAT excluded from price |

## Payment Type Codes

| Code | Description |
|------|-------------|
| 1 | Cash (מזומן) |
| 2 | Check (צ'ק) |
| 3 | Credit Card (כרטיס אשראי) |
| 4 | Bank Transfer (העברה בנקאית) |
| 5 | Other (אחר) |

## Currency Codes

Supported currencies:
- `ILS` - Israeli Shekel (₪)
- `USD` - US Dollar ($)
- `EUR` - Euro (€)
- `GBP` - British Pound (£)

## Language Codes

- `he` - Hebrew (עברית)
- `en` - English

## Complete Working Example

```javascript
const { GreenInvoiceAPI, DocumentType } = require('@gs/greeninvoice-api');

const client = new GreenInvoiceAPI({
  apiKey: 'your-api-key',
  secret: 'your-secret',
  environment: 'sandbox',
  debug: true
});

async function createInvoice() {
  try {
    const invoice = await client.documents.create({
      type: DocumentType.TAX_INVOICE_RECEIPT, // or 320
      client: {
        name: 'John Doe',
        emails: ['john@example.com'],
        phone: '+972-50-1234567',
        add: true // Create client if doesn't exist
      },
      income: [
        {
          description: 'Consulting Services',
          quantity: 10,
          price: 150,
          currency: 'ILS',
          vatType: 1 // VAT included
        }
      ],
      payment: [
        {
          type: 1, // Cash
          price: 1500,
          currency: 'ILS',
          date: new Date().toISOString().split('T')[0]
        }
      ],
      currency: 'ILS',
      lang: 'en',
      signed: false,
      rounding: false
    });

    console.log('Invoice created!');
    console.log('ID:', invoice.id);
    console.log('Number:', invoice.number);
    console.log('URL:', invoice.url.en);

    return invoice;
  } catch (error) {
    console.error('Failed to create invoice:', error.message);
    throw error;
  }
}
```

## Common Error Codes

| Code | Hebrew Message | English Translation | Solution |
|------|---------------|-------------------|----------|
| 2403 | סוג מסמך לא נשלח או אינו נתמך | Document type not sent or not supported | Use numeric document type code (e.g., 320) |
| 2419 | נא למלא לפחות שורת תקבולים אחת | Please fill at least one payment line | Add payment array for receipt types |
| 2426 | תאריך תקבול ריק, עתידי או לא תקין | Payment date is empty, future, or invalid | Add valid date in YYYY-MM-DD format |

## Response Format

Successful document creation returns:

```javascript
{
  id: "uuid-string",
  client: { id: "client-uuid" },
  number: 60001,
  type: 320,
  signed: false,
  lang: "en",
  url: {
    origin: "https://...",
    he: "https://...", // Hebrew PDF
    en: "https://..."  // English PDF
  },
  vatRate: 0.18
}
```

## Best Practices

1. **Always use numeric document type codes** - Never use strings like "invoice"

2. **Include payment for receipt types** - Types 320, 400, 405 require payment information

3. **Use valid payment dates** - Must be in YYYY-MM-DD format and not in the future

4. **Enable debug mode during development** - Set `debug: true` to see full API responses

5. **Handle VAT correctly** - Use vatType 1 for prices including VAT, 2 for excluding VAT

6. **Test in sandbox first** - Always test with `environment: 'sandbox'` before production

## Resources

- [Official API Documentation](https://greeninvoice.docs.apiary.io/)
- [Python SDK Reference](https://github.com/yanivps/green-invoice)
- [Green Invoice Website](https://www.greeninvoice.co.il)
