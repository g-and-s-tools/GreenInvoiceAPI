const { GreenInvoiceAPI, DocumentType } = require('@gs/greeninvoice-api');

const GREEN_INVOICE_API_KEY = '8e684aed-6907-4f6e-9888-16655e95161e';
const GREEN_INVOICE_SECRET = 'NzoNQVhYFUk6J6zNh_H7SA';
const GREENINVOICE_ENV = 'sandbox';

const client = new GreenInvoiceAPI({
  apiKey: GREEN_INVOICE_API_KEY,
  secret: GREEN_INVOICE_SECRET,
  environment: GREENINVOICE_ENV,
  debug: true,
});

async function createReceiptWithMultipleChecks() {
  try {
    console.log('Creating Receipt with Multiple Check Payments\n');

    // Find client by tax ID
    const taxId = '123456789';
    console.log(`Looking for client with tax ID: ${taxId}...`);

    const foundClient = await client.clients.findByTaxId(taxId);

    if (!foundClient) {
      console.log('❌ Client not found.');
      return;
    }

    console.log(`✅ Found client: ${foundClient.name}\n`);

    // Total amount: 5000 ILS split into 3 checks
    const totalAmount = 5000;

    const receipt = await client.documents.create({
      type: DocumentType.RECEIPT, // 400

      client: {
        id: foundClient.id,
        name: foundClient.name,
      },

      income: [
        {
          description: 'Web Development Project',
          quantity: 1,
          price: 5000,
          currency: 'ILS',
          vatType: 1,
        },
      ],

      // Multiple check payments (payment plan) with full check details
      payment: [
        {
          type: 2, // Check
          price: 2000, // First check: 2000 ILS
          currency: 'ILS',
          date: new Date().toISOString().split('T')[0], // Today
          // Check details (using correct API field names)
          chequeNum: '100001', // Check number
          bankName: '10', // Bank name (Bank Leumi)
          bankBranch: '902', // Branch number
          bankAccount: '123456789', // Account number
        },
        {
          type: 2, // Check
          price: 1500, // Second check: 1500 ILS
          currency: 'ILS',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 30 days from now
          // Check details
          chequeNum: '100002',
          bankName: 'בנק לאומי',
          bankBranch: '902',
          bankAccount: '123456789',
        },
        {
          type: 2, // Check
          price: 1500, // Third check: 1500 ILS
          currency: 'ILS',
          date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 60 days from now
          // Check details
          chequeNum: '100003',
          bankName: 'בנק לאומי',
          bankBranch: '902',
          bankAccount: '123456789',
        },
      ],

      currency: 'ILS',
      lang: 'he', // Change to 'he' for Hebrew document
      remarks: 'הופק על יד cheX', // Hebrew remarks
      signed: false,
    });

    console.log('\n✅ Receipt with multiple checks created!');
    console.log('=====================================');
    console.log('Receipt ID:', receipt.id);
    console.log('Receipt Number:', receipt.number);
    console.log('Document Type:', receipt.type, '(RECEIPT)');
    console.log('Language:', receipt.lang === 'he' ? 'Hebrew' : 'English');
    console.log('Total Amount:', totalAmount, 'ILS');
    console.log('Payment Method: 3 post-dated checks');
    console.log('  • Check 1: 2000 ILS (today)');
    console.log('  • Check 2: 1500 ILS (30 days)');
    console.log('  • Check 3: 1500 ILS (60 days)');
    console.log('=====================================');

    // Display the appropriate URL based on document language
    if (receipt.url) {
      const documentUrl = receipt.lang === 'he' ? receipt.url.he : receipt.url.en;
      console.log('\n📄 View/Download Receipt:');
      console.log(documentUrl || receipt.url.origin);
      console.log('\nYou can open this URL in a browser to view or download the receipt PDF.');
    } else {
      console.log('\n⚠️  No document URL available in response');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

createReceiptWithMultipleChecks();
