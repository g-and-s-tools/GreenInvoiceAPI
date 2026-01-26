const { GreenInvoiceAPI, DocumentType } = require('@gs/greeninvoice-api');

const client = new GreenInvoiceAPI({
  apiKey: process.env.GREEN_INVOICE_API_KEY,
  secret: process.env.GREEN_INVOICE_SECRET,
  environment: 'production',
  debug: false,
});

async function createInvoice() {
  try {
    // Create a comprehensive invoice with receipt (type 320)
    const totalAmount = 5000 + 1200 + 100; // Sum of all items

    const invoice = await client.documents.create({
      type: DocumentType.TAX_INVOICE_RECEIPT, // 320
      client: {
        name: 'Acme Corporation',
        emails: ['billing@acme.com'], // Array of emails
        phone: '+972-50-9876543',
        taxId: '123456789',
        add: true, // Create client if doesn't exist
      },
      income: [ // 'income' not 'items'
        {
          description: 'Website Development',
          quantity: 1,
          price: 5000,
          currency: 'ILS',
          vatType: 1, // 1 = VAT included
        },
        {
          description: 'Hosting Services (Annual)',
          quantity: 1,
          price: 1200,
          currency: 'ILS',
          vatType: 1,
        },
        {
          description: 'Domain Registration',
          quantity: 2,
          price: 50,
          currency: 'ILS',
          vatType: 1,
        },
      ],
      currency: 'ILS',
      lang: 'en', // 'lang' not 'language'
      remarks: 'Thank you for your business!', // 'remarks' not 'notes'
      payment: [ // 'payment' not 'payments'
        {
          type: 4, // 4 = Bank transfer
          price: totalAmount, // 'price' not 'amount'
          currency: 'ILS',
          date: new Date().toISOString().split('T')[0], // Today's date
        },
      ],
      signed: false,
    });

    console.log('\n✅ Invoice created successfully!');
    console.log('Invoice ID:', invoice.id);
    console.log('Invoice Number:', invoice.number);
    console.log('Document Type:', invoice.type);
    console.log('Document URL (English):', invoice.url?.en);
    console.log('Document URL (Hebrew):', invoice.url?.he);

    // Note: Email sending requires further investigation of the API
    // The send endpoint might not be available or might work differently
    // await client.documents.send(invoice.id, {...});

  } catch (error) {
    console.error('\n❌ Failed to create invoice:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

createInvoice();
