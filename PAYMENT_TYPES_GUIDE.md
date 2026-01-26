# Payment Types & Document Types Guide

Quick reference for creating documents with different payment methods in Green Invoice API.

## Document Types

| Code | Name | Requires Payment? | Use Case |
|------|------|------------------|----------|
| 10 | PRICE_QUOTE | No | Price quotation |
| 305 | TAX_INVOICE | No | Invoice without immediate payment |
| 320 | TAX_INVOICE_RECEIPT | **Yes** | Invoice + Receipt (payment received) |
| 400 | RECEIPT | **Yes** | Standalone receipt |
| 405 | RECEIPT_FOR_DONATION | **Yes** | Donation receipt |

## Payment Type Codes

| Code | Type | Hebrew | Common Use |
|------|------|--------|-----------|
| 1 | Cash | מזומן | Cash payments |
| 2 | Check | צ'ק | Check/Cheque payments |
| 3 | Credit Card | כרטיס אשראי | Credit card payments |
| 4 | Bank Transfer | העברה בנקאית | Wire transfers |
| 5 | Other | אחר | Other payment methods |

## Examples by Payment Type

### 1. Receipt with Cash Payment

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Services',
      quantity: 1,
      price: 1000,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 1, // Cash
      price: 1000,
      currency: 'ILS',
      date: '2026-01-26',
    }
  ],
  currency: 'ILS',
  lang: 'en',
});
```

### 2. Receipt with Check Payment

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Consulting',
      quantity: 10,
      price: 200,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 2, // Check
      price: 2000,
      currency: 'ILS',
      date: '2026-01-26',
      // Optional check details:
      // checkNum: '123456',
      // bankName: 'Bank Leumi',
      // branch: '123',
      // accountId: '456789',
    }
  ],
  currency: 'ILS',
  lang: 'en',
});
```

### 3. Receipt with Multiple Checks (Payment Plan)

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Project Payment',
      quantity: 1,
      price: 9000,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 2, // Check 1
      price: 3000,
      currency: 'ILS',
      date: '2026-01-26', // Today
    },
    {
      type: 2, // Check 2
      price: 3000,
      currency: 'ILS',
      date: '2026-02-26', // 30 days
    },
    {
      type: 2, // Check 3
      price: 3000,
      currency: 'ILS',
      date: '2026-03-26', // 60 days
    }
  ],
  currency: 'ILS',
  lang: 'en',
  remarks: 'Payment via 3 post-dated checks',
});
```

### 4. Tax Invoice Receipt with Credit Card

```javascript
const invoiceReceipt = await client.documents.create({
  type: 320, // TAX_INVOICE_RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Software License',
      quantity: 1,
      price: 5000,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 3, // Credit Card
      price: 5000,
      currency: 'ILS',
      date: '2026-01-26',
      cardType: 1, // Card type code (1=Visa, 2=MasterCard, etc.)
      cardNum: '1234', // Last 4 digits
      dealType: 1, // Deal type (1=Regular, 2=Installments, etc.)
    }
  ],
  currency: 'ILS',
  lang: 'en',
});
```

### 5. Receipt with Bank Transfer

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Annual Service',
      quantity: 1,
      price: 12000,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 4, // Bank Transfer
      price: 12000,
      currency: 'ILS',
      date: '2026-01-26',
    }
  ],
  currency: 'ILS',
  lang: 'en',
  remarks: 'Payment received via bank transfer',
});
```

### 6. Mixed Payment Methods

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT
  client: { id: 'client-uuid' },
  income: [
    {
      description: 'Equipment Purchase',
      quantity: 1,
      price: 10000,
      currency: 'ILS',
      vatType: 1,
    }
  ],
  payment: [
    {
      type: 1, // Cash
      price: 2000,
      currency: 'ILS',
      date: '2026-01-26',
    },
    {
      type: 2, // Check
      price: 5000,
      currency: 'ILS',
      date: '2026-01-26',
    },
    {
      type: 4, // Bank Transfer
      price: 3000,
      currency: 'ILS',
      date: '2026-01-26',
    }
  ],
  currency: 'ILS',
  lang: 'en',
  remarks: 'Partial payment: 2000 cash, 5000 check, 3000 transfer',
});
```

## Using Existing Client vs Inline Creation

### Option A: Use Existing Client by ID

```javascript
// Find client first
const client = await api.clients.findByTaxId('123456789');

// Create document with client ID
const receipt = await api.documents.create({
  type: 400,
  client: {
    id: client.id, // Use existing client
    name: client.name,
  },
  // ... rest of document
});
```

### Option B: Create Client Inline

```javascript
const receipt = await api.documents.create({
  type: 400,
  client: {
    name: 'New Client Name',
    emails: ['client@example.com'],
    phone: '+972-50-1234567',
    taxId: '123456789',
    add: true, // Auto-create client if doesn't exist
  },
  // ... rest of document
});
```

## Complete Working Example

See [examples/create-receipt-with-check.js](examples/create-receipt-with-check.js) for a full working example.

## Common Patterns

### Pattern 1: Find or Create Client

```javascript
async function getOrCreateClient(taxId, clientData) {
  // Try to find existing client
  let client = await api.clients.findByTaxId(taxId);

  // If not found, create inline with document
  if (!client) {
    return {
      name: clientData.name,
      emails: [clientData.email],
      phone: clientData.phone,
      taxId: taxId,
      add: true,
    };
  }

  // Use existing client
  return {
    id: client.id,
    name: client.name,
  };
}

// Use it
const clientData = await getOrCreateClient('123456789', {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+972-50-1234567',
});

const receipt = await api.documents.create({
  type: 400,
  client: clientData,
  // ... rest
});
```

### Pattern 2: Calculate Total from Items

```javascript
const items = [
  { description: 'Item 1', quantity: 2, price: 100 },
  { description: 'Item 2', quantity: 1, price: 500 },
];

const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
// total = 700

const receipt = await api.documents.create({
  type: 400,
  client: { id: 'client-uuid' },
  income: items.map(item => ({
    ...item,
    currency: 'ILS',
    vatType: 1,
  })),
  payment: [
    {
      type: 2, // Check
      price: total,
      currency: 'ILS',
      date: new Date().toISOString().split('T')[0],
    }
  ],
  currency: 'ILS',
  lang: 'en',
});
```

## Important Notes

1. **Payment dates cannot be in the future** for some document types
2. **Total payment amount should match income total** (API may validate this)
3. **VAT is calculated automatically** based on vatType
4. **Multiple payments** can be added for split payments or installments
5. **Client ID vs inline creation**: Use ID for existing clients, use `add: true` for new clients

## Error Handling

```javascript
try {
  const receipt = await api.documents.create({...});
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid data:', error.message);
    // Check payment dates, amounts, required fields
  } else if (error instanceof APIError) {
    console.error('API error:', error.statusCode, error.message);
  }
}
```

## Testing Tips

1. Always test in **sandbox environment** first
2. Enable **debug mode** to see API requests/responses
3. Check that **payment dates are valid** (YYYY-MM-DD format)
4. Verify **total amounts match** between income and payment
5. Test with **small amounts** first

## Resources

- [API Reference](API_REFERENCE.md)
- [Official Documentation](https://greeninvoice.docs.apiary.io/)
- [Working Examples](examples/)
