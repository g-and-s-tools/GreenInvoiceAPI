const { GreenInvoiceAPI } = require('@gs/greeninvoice-api');

const GREEN_INVOICE_API_KEY = '8e684aed-6907-4f6e-9888-16655e95161e';
const GREEN_INVOICE_SECRET = 'NzoNQVhYFUk6J6zNh_H7SA';
const GREENINVOICE_ENV = 'sandbox';

const client = new GreenInvoiceAPI({
  apiKey: GREEN_INVOICE_API_KEY,
  secret: GREEN_INVOICE_SECRET,
  environment: GREENINVOICE_ENV,
  debug: true,
});

async function testFindByTaxId() {
  try {
    console.log('Testing client search by tax ID...\n');

    // Test 1: Try to find a client by tax ID
    const taxId = '123456789';
    console.log(`Searching for client with tax ID: ${taxId}`);
    const foundClient = await client.clients.findByTaxId(taxId);
    console.log(`Searching for client with tax ID: ${taxId}`,foundClient);
    return;

    if (foundClient) {
      console.log('\n✅ Client found!');
      console.log('Client ID:', foundClient.id);
      console.log('Name:', foundClient.name);
      console.log('Tax ID:', foundClient.taxId);
      console.log('Email:', foundClient.email);
    } else {
      console.log('\n❌ No client found with that tax ID');
      console.log('Creating a new client with this tax ID...\n');

      // Create a client for testing
      const newClient = await client.clients.create({
        name: 'Test Company Ltd',
        taxId: taxId,
        emails: ['test@example.com'],
        phone: '+972-50-1234567',
        active: true,
      });

      console.log('✅ Created new client:');
      console.log('Client ID:', newClient.id);
      console.log('Name:', newClient.name);
      console.log('Tax ID:', newClient.taxId);

      // Try finding again
      console.log('\nSearching again...');
      const foundAgain = await client.clients.findByTaxId(taxId);
      if (foundAgain) {
        console.log('✅ Now found the client!');
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    console.error('\nFull error:', error);
  }
}

testFindByTaxId();
