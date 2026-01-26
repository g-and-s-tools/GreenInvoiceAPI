# Changelog

All notable changes to the Green Invoice API SDK will be documented in this file.

## [1.0.0] - 2026-01-26

### Added
- Initial release of @gs/greeninvoice-api Node.js SDK
- Full TypeScript support with comprehensive type definitions
- Automatic JWT authentication with token caching and refresh
- Built-in rate limiting (3 requests/second with burst capacity)
- Automatic retry logic with exponential backoff
- Custom error classes (AuthenticationError, ValidationError, RateLimitError, APIError, NetworkError)
- Documents resource with CRUD operations
- Clients resource with CRUD operations
- Dual format output (CommonJS + ES Modules)
- Complete API reference documentation
- Working examples for document creation
- Unit tests for core components (TokenManager, RateLimiter)

### API Format Discoveries
- Document types must use numeric codes (e.g., 320 for TAX_INVOICE_RECEIPT)
- API uses `income` instead of `items` for line items
- API uses `lang` instead of `language` for language setting
- API uses `payment` instead of `payments` for payment array
- API uses `remarks` instead of `notes` for document notes
- Client emails must be an array (`emails: []`)
- Payment objects use `price` instead of `amount`
- Payment objects require `date` field in YYYY-MM-DD format
- VAT types are numeric codes (1 = included, 2 = excluded)
- Payment types are numeric codes (1 = cash, 3 = credit card, etc.)
- TAX_INVOICE_RECEIPT (320) requires payment information

### Features
- Debug mode for development (set `debug: true`)
- Configurable rate limiting
- Configurable retry attempts
- Support for both production and sandbox environments
- Automatic handling of token expiry (401 errors)
- Automatic handling of rate limits (429 errors)

### Documentation
- Comprehensive README with usage examples
- API_REFERENCE.md with complete field mappings and error codes
- Working code examples in examples/ directory
- JSDoc comments on all public methods
- TypeScript definitions for IDE autocomplete

## Known Limitations

### Implemented
- ✅ Document creation (POST /documents)
- ✅ Authentication (JWT token management)
- ✅ Error handling with detailed messages
- ✅ Rate limiting

### Needs Investigation
- ⚠️ Document listing (GET /documents returns 405 - may need POST)
- ⚠️ Document update endpoint
- ⚠️ Document delete endpoint
- ⚠️ Document send via email endpoint
- ⚠️ Client CRUD operations (endpoints need verification)
- ⚠️ Search endpoints

### Future Enhancements
- [ ] Add support for all document types
- [ ] Implement webhook signature verification
- [ ] Add pagination helpers for large result sets
- [ ] Implement search functionality
- [ ] Add batch operations
- [ ] Create React hooks package
- [ ] Add CLI tool
- [ ] Implement document download (PDF)
- [ ] Add more integration tests

## References
- [Official API Documentation](https://greeninvoice.docs.apiary.io/)
- [Python SDK (Reference Implementation)](https://github.com/yanivps/green-invoice)
- [Green Invoice Website](https://www.greeninvoice.co.il)
