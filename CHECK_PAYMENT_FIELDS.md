# Check Payment Fields Reference

Complete guide for working with check (cheque) payments in Green Invoice API.

## Check Payment Fields

When creating a receipt or invoice with check payment (type = 2), you should include these fields:

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | number | Payment type (must be 2 for check) | `2` |
| `price` | number | Check amount in currency units | `2500` |
| `currency` | string | Currency code | `'ILS'` |
| `date` | string | Check date (YYYY-MM-DD format) | `'2026-01-26'` |

### Check-Specific Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `chequeNum` | string | Check number | `'123456'` |
| `bankName` | string | Bank name (Hebrew or English) | `'בנק לאומי'` or `'Bank Leumi'` |
| `bankBranch` | string | Bank branch number (סניף) | `'902'` |
| `bankAccount` | string | Bank account number (חשבון) | `'123456789'` |

**Important Notes:**
- The API uses British spelling: `chequeNum` (not `checkNum`)
- Bank name can be in Hebrew or English
- All fields are strings except `type` and `price`

## Common Israeli Banks

Reference for `bankName` field:

| Bank Code | Hebrew Name | English Name |
|-----------|-------------|--------------|
| 10 | בנק לאומי לישראל | Bank Leumi |
| 11 | בנק דיסקונט | Discount Bank |
| 12 | בנק הפועלים | Bank Hapoalim |
| 13 | בנק איגוד | Union Bank |
| 14 | בנק אוצר החייל | Otsar Hahayal Bank |
| 17 | בנק מרכנתיל דיסקונט | Mercantile Discount Bank |
| 20 | בנק מזרחי טפחות | Mizrahi Tefahot Bank |
| 31 | בנק הבינלאומי הראשון | First International Bank |
| 46 | בנק מסד | Massad Bank |
| 52 | בנק פועלי אגודת ישראל | Poalei Agudat Israel Bank |
| 54 | בנק ירושלים | Bank of Jerusalem |

## Complete Example - Single Check

```javascript
const receipt = await client.documents.create({
  type: 400, // RECEIPT

  client: {
    id: 'client-uuid-here',
    name: 'Client Name',
  },

  income: [
    {
      description: 'Consulting Services',
      quantity: 10,
      price: 250,
      currency: 'ILS',
      vatType: 1,
    }
  ],

  payment: [
    {
      type: 2, // Check payment
      price: 2500, // Total amount (10 * 250)
      currency: 'ILS',
      date: '2026-01-26', // Check date

      // Check details
      chequeNum: '123456', // Check number
      bankName: 'בנק לאומי', // Bank Leumi
      bankBranch: '902', // Branch number
      bankAccount: '123456789', // Account number
    }
  ],

  currency: 'ILS',
  lang: 'en',
  remarks: 'Payment received via check',
});
```

## Multiple Checks (Payment Plan)

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

  // Split into 3 post-dated checks
  payment: [
    {
      type: 2,
      price: 3000,
      currency: 'ILS',
      date: '2026-01-26', // Today
      chequeNum: '100001',
      bankName: 'בנק לאומי',
      bankBranch: '902',
      bankAccount: '123456789',
    },
    {
      type: 2,
      price: 3000,
      currency: 'ILS',
      date: '2026-02-26', // 30 days later
      chequeNum: '100002',
      bankName: 'בנק לאומי',
      bankBranch: '902',
      bankAccount: '123456789',
    },
    {
      type: 2,
      price: 3000,
      currency: 'ILS',
      date: '2026-03-26', // 60 days later
      chequeNum: '100003',
      bankName: 'בנק לאומי',
      bankBranch: '902',
      bankAccount: '123456789',
    }
  ],

  currency: 'ILS',
  lang: 'en',
  remarks: 'Payment via 3 post-dated checks',
});
```

## Using TypeScript

With full type safety:

```typescript
import { GreenInvoiceAPI, DocumentType, Payment } from '@gs/greeninvoice-api';

const payment: Payment = {
  type: 2,
  price: 2500,
  currency: 'ILS',
  date: new Date().toISOString().split('T')[0],

  // TypeScript will provide autocomplete for these fields
  chequeNum: '123456',
  bankName: 'בנק לאומי',
  bankBranch: '902',
  bankAccount: '123456789',
};

const receipt = await client.documents.create({
  type: DocumentType.RECEIPT,
  client: { id: clientId },
  income: [...],
  payment: [payment],
  currency: 'ILS',
  lang: 'en',
});
```

## Field Name Mapping

If you're coming from other APIs or documentation:

| Common Name | Green Invoice API Field |
|-------------|------------------------|
| Check Number | `chequeNum` (British spelling) |
| Bank Name | `bankName` |
| Bank Branch | `bankBranch` |
| Bank Account | `bankAccount` |
| Check Amount | `price` (not `amount`) |
| Check Date | `date` |

## Validation Rules

1. **Date Format**: Must be `YYYY-MM-DD` (ISO 8601 date format)
2. **Date Range**: Check date should not be too far in the future (check API limits)
3. **Amount**: Total payment amounts should match invoice/receipt total
4. **Check Number**: String format, can contain letters and numbers
5. **Bank Fields**: All optional, but recommended for complete record keeping

## Common Patterns

### Helper Function for Check Payment

```javascript
function createCheckPayment(options) {
  return {
    type: 2,
    price: options.amount,
    currency: options.currency || 'ILS',
    date: options.date || new Date().toISOString().split('T')[0],
    chequeNum: options.checkNumber,
    bankName: options.bankName,
    bankBranch: options.branch,
    bankAccount: options.account,
  };
}

// Usage
const payment = createCheckPayment({
  amount: 2500,
  checkNumber: '123456',
  bankName: 'בנק לאומי',
  branch: '902',
  account: '123456789',
});
```

### Date Helper for Post-Dated Checks

```javascript
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

// Create checks with 30-day intervals
const checks = [0, 30, 60].map((days, index) => ({
  type: 2,
  price: 1000,
  currency: 'ILS',
  date: addDays(new Date(), days),
  chequeNum: `10000${index + 1}`,
  bankName: 'בנק לאומי',
  bankBranch: '902',
  bankAccount: '123456789',
}));
```

## Testing Tips

1. **Test with minimal data first**: Start without check details, then add them
2. **Verify date format**: Always use `YYYY-MM-DD` format
3. **Check Hebrew encoding**: Ensure your system supports Hebrew characters for bank names
4. **Use sandbox environment**: Test with `environment: 'sandbox'`
5. **Enable debug mode**: Set `debug: true` to see API request/response

## Working Examples

See these complete working examples:
- [create-receipt-with-check.js](examples/create-receipt-with-check.js)
- [create-receipt-multiple-checks.js](examples/create-receipt-multiple-checks.js)

## Related Documentation

- [Payment Types Guide](PAYMENT_TYPES_GUIDE.md) - All payment types
- [API Reference](API_REFERENCE.md) - Complete API documentation
- [Examples Directory](examples/) - Working code examples

## Questions & Answers

**Q: What if I don't have all the check details?**
A: The check-specific fields (`chequeNum`, `bankName`, `bankBranch`, `bankAccount`) are optional. You can create a receipt with just type, price, currency, and date.

**Q: Can I use English bank names?**
A: Yes, you can use either Hebrew or English bank names in the `bankName` field.

**Q: What's the difference between `chequeNum` and `checkNum`?**
A: The Green Invoice API uses British spelling: `chequeNum` (with 'que'). Using `checkNum` will not work.

**Q: Can I mix different banks in multiple checks?**
A: Yes, each payment in the `payment` array can have different bank details.

**Q: Are there any limits on post-dated checks?**
A: Check with Green Invoice API documentation for specific date range limits. Generally, checks dated too far in the future may be rejected.
