# Document URL Reference

## Understanding Document URLs

When you create a document (invoice, receipt, etc.), the Green Invoice API returns a `url` object with links to view/download the PDF.

## URL Structure

The API response includes:

```javascript
{
  "id": "...",
  "number": 12345,
  "type": 400,
  "url": {
    "origin": "https://...",  // Always present
    "he": "https://...",       // Hebrew URL
    "en": "https://..."        // English URL (only for English docs)
  }
}
```

## Language-Based URL Availability

### Hebrew Documents (`lang: 'he'`)

When you create a Hebrew document:

```javascript
const receipt = await client.documents.create({
  lang: 'he',  // Hebrew document
  // ... other fields
});
```

**Response includes:**
- ✅ `url.origin` - Original/default URL
- ✅ `url.he` - Hebrew document URL
- ❌ `url.en` - NOT included (document is Hebrew only)

### English Documents (`lang: 'en'`)

When you create an English document:

```javascript
const receipt = await client.documents.create({
  lang: 'en',  // English document
  // ... other fields
});
```

**Response includes:**
- ✅ `url.origin` - Original/default URL
- ✅ `url.he` - Hebrew document URL
- ✅ `url.en` - English document URL

## Best Practice: Accessing URLs

Always use the appropriate URL based on the document language:

```javascript
// Get the correct URL based on document language
const documentUrl = receipt.lang === 'he'
  ? receipt.url.he
  : receipt.url.en;

// Or use origin as fallback
const documentUrl = receipt.url?.he || receipt.url?.en || receipt.url?.origin;

console.log('View/Download:', documentUrl);
```

## Example: Proper URL Handling

```javascript
async function createAndDisplayReceipt() {
  const receipt = await client.documents.create({
    type: DocumentType.RECEIPT,
    lang: 'he',  // Hebrew document
    // ... other fields
  });

  console.log('Receipt created:', receipt.id);

  // Display URL based on language
  if (receipt.url) {
    const url = receipt.lang === 'he' ? receipt.url.he : receipt.url.en;
    console.log('Document URL:', url || receipt.url.origin);
  }
}
```

## Common Mistake

**Don't do this** (will be undefined for Hebrew documents):

```javascript
console.log('URL:', receipt.url.en);  // ❌ Undefined for Hebrew docs
```

**Do this instead:**

```javascript
// Option 1: Check language
const url = receipt.lang === 'he' ? receipt.url.he : receipt.url.en;

// Option 2: Use optional chaining with fallback
const url = receipt.url?.en || receipt.url?.he || receipt.url?.origin;

console.log('URL:', url);  // ✅ Works for all languages
```

## URL Expiration

The document URLs contain authentication tokens that may expire. For long-term storage:

1. **Store the document ID** instead of the URL
2. Fetch a fresh URL when needed using the document ID
3. URLs are valid for viewing/downloading immediately after creation

## Related Examples

- [create-receipt-with-check.js](examples/create-receipt-with-check.js) - Single check receipt (English)
- [create-receipt-multiple-checks.js](examples/create-receipt-multiple-checks.js) - Multiple checks (Hebrew)

## Summary

| Document Language | `url.origin` | `url.he` | `url.en` |
|-------------------|--------------|----------|----------|
| Hebrew (`lang: 'he'`) | ✅ | ✅ | ❌ |
| English (`lang: 'en'`) | ✅ | ✅ | ✅ |

**Key Takeaway**: When using Hebrew documents, access `url.he` instead of `url.en`.
