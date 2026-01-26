const { GreenInvoiceAPI } = require('@gs/greeninvoice-api');


 GREEN_INVOICE_API_KEY='8e684aed-6907-4f6e-9888-16655e95161e'
 GREEN_INVOICE_SECRET='NzoNQVhYFUk6J6zNh_H7SA'
 GREENINVOICE_ENV='sandbox'


// Initialize the client
const client = new GreenInvoiceAPI({
  apiKey: GREEN_INVOICE_API_KEY,
  secret: GREEN_INVOICE_SECRET,
  environment:GREENINVOICE_ENV, // or 'sandbox'
  debug: true, // Enable debug logging
});

async function main() {
  try {
    // Test connection
    const connected = await client.testConnection();
    console.log('Connected:', connected);

    // Create a client
    // const newClient = await client.clients.create({
    //   name: 'John Doe',
    //   email: 'john@example.com',
    //   phone: '+972-50-1234567',
    // });
    // console.log('Created client:', newClient);

    // Create an invoice (using TAX_INVOICE_RECEIPT type = 320)
    const invoice = await client.documents.create({
      type: 320, // TAX_INVOICE_RECEIPT
      client: {
        name: 'John Doe',
        emails: ['john@example.com'],
        add: true, // Add client if doesn't exist
      },
      income: [
        {
          description: 'Consulting services',
          quantity: 10,
          price: 150,
          currency: 'ILS',
          vatType: 1, // 1 = VAT included
        },
      ],
      payment: [
        {
          type: 1, // Payment type: 1 = cash
          price: 1500, // Total amount (10 * 150)
          currency: 'ILS',
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        },
      ],
      currency: 'ILS',
      lang: 'en',
      signed: false,
    });
    console.log('\n✅ Invoice created successfully!');
    console.log('Invoice ID:', invoice.id);
    console.log('Invoice Number:', invoice.number);
    console.log('Document URL:', invoice.url.en);

    // Note: List endpoint requires further investigation (405 Method Not Allowed)
    // The Green Invoice API might use POST for search/list operations
    // For now, we've successfully demonstrated document creation!
  } catch (error) {
    console.error('Error:', error.message,error);
  }
}

main();
