const {
  GreenInvoiceAPI,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  APIError,
} = require('@gs/greeninvoice-api');

const client = new GreenInvoiceAPI({
  apiKey: process.env.GREEN_INVOICE_API_KEY,
  secret: process.env.GREEN_INVOICE_SECRET,
  environment: 'sandbox',
});

async function handleErrors() {
  try {
    // Attempt to create an invoice
    const invoice = await client.documents.create({
      type: 'invoice',
      client: { name: 'Test Client' },
      items: [{ description: 'Service', quantity: 1, price: 100 }],
    });

    console.log('Invoice created:', invoice.id);
  } catch (error) {
    // Handle different error types
    if (error instanceof AuthenticationError) {
      console.error('Authentication failed:');
      console.error('- Message:', error.message);
      console.error('- Check your API credentials');
      console.error('- Status:', error.statusCode);
    } else if (error instanceof ValidationError) {
      console.error('Validation error:');
      console.error('- Message:', error.message);
      console.error('- Code:', error.code);
      console.error('- Fix the request data and try again');
    } else if (error instanceof RateLimitError) {
      console.error('Rate limit exceeded:');
      console.error('- Message:', error.message);
      console.error('- Retry after:', error.retryAfter, 'seconds');
      console.error('- The SDK will automatically retry');
    } else if (error instanceof APIError) {
      console.error('API error:');
      console.error('- Message:', error.message);
      console.error('- Status:', error.statusCode);
      console.error('- Code:', error.code);
      console.error('- Request ID:', error.requestId);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example: Handling multiple operations with error recovery
async function bulkOperations() {
  const results = {
    success: [],
    failed: [],
  };

  const invoicesToCreate = [
    { client: 'Client A', amount: 1000 },
    { client: 'Client B', amount: 2000 },
    { client: 'Client C', amount: 1500 },
  ];

  for (const invoiceData of invoicesToCreate) {
    try {
      const invoice = await client.documents.create({
        type: 'invoice',
        client: { name: invoiceData.client },
        items: [
          { description: 'Service', quantity: 1, price: invoiceData.amount },
        ],
      });

      results.success.push({
        client: invoiceData.client,
        invoiceId: invoice.id,
      });
    } catch (error) {
      results.failed.push({
        client: invoiceData.client,
        error: error.message,
      });

      // Continue with other invoices even if one fails
      console.warn(`Failed to create invoice for ${invoiceData.client}`);
    }
  }

  console.log(`\nResults:`);
  console.log(`- Successful: ${results.success.length}`);
  console.log(`- Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed invoices:');
    results.failed.forEach((f) => console.log(`  - ${f.client}: ${f.error}`));
  }
}

handleErrors();
