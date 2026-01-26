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

async function createReceiptWithCheck() {
  try {
    console.log('Creating Receipt with Check Payment\n');

    // Step 1: Find or get the client
    // Option A: If you know the client ID
    const clientId = 'your-client-id-here'; // Replace with actual client ID

    // Option B: Find client by tax ID first
    const taxId = '036256147'; // Replace with actual tax ID
    console.log(`Looking for client with tax ID: ${taxId}...`);

    const foundClient = await client.clients.findByTaxId(taxId);

    if (!foundClient) {
      console.log('❌ Client not found. Please create the client first or use inline client creation.');
      return;
    }

    console.log(`✅ Found client: ${foundClient.name} (ID: ${foundClient.id})\n`);

    // Step 2: Create a Receipt (type 400) with check payment
    const totalAmount = 2500; // Total amount for the receipt

    const receipt = await client.documents.create({
      type: DocumentType.RECEIPT, // 400 - Receipt

      // Use existing client by ID
      client: {
        id: foundClient.id, // Use the client ID from search
        name: foundClient.name, // Include name for reference
      },

      // Income items (what the receipt is for)
      income: [
        {
          description: 'Consulting Services - January 2026',
          quantity: 20, // 20 hours
          price: 125, // 125 ILS per hour
          currency: 'ILS',
          vatType: 1, // 1 = VAT included
        },
      ],

      // Payment information - Check with full details
      payment: [
        {
          type: 2, // 2 = Check payment
          price: totalAmount, // Total amount (20 * 125 = 2500)
          currency: 'ILS',
          date: new Date().toISOString().split('T')[0], // Today's date

          // Check-specific fields (using correct API field names):
          chequeNum: '123456', // Check number (note: API uses British spelling "cheque")
          bankName: 'בנק לאומי', // Bank name (can be in Hebrew or English: "Bank Leumi")
          bankBranch: '902', // Bank branch number (סניף)
          bankAccount: '123456789', // Bank account number (חשבון)
        },
      ],

      currency: 'ILS',
      lang: 'en', // or 'he' for Hebrew
      remarks: 'Payment received via check. Thank you!',
      signed: false, // Set to true to sign the document
    });

    // Step 3: Display the result
    console.log('\n✅ Receipt created successfully!');
    console.log('=====================================');
    console.log('Receipt ID:', receipt.id);
    console.log('Receipt Number:', receipt.number);
    console.log('Document Type:', receipt.type, '(RECEIPT)');
    console.log('Client Name:', foundClient.name);
    console.log('Total Amount:', totalAmount, 'ILS');
    console.log('Payment Method: Check #123456');
    console.log('Bank: בנק לאומי, Branch: 902');
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
    console.error('\n❌ Failed to create receipt:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    console.error('\nFull error:', error);
  }
}

createReceiptWithCheck();
