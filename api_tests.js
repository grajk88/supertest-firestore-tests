const request = require('supertest');
const app = require('./your-express-app'); // Replace with your Express app

// Replace the following values with your Firestore configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Initialize the Firestore instance
const admin = require('firebase-admin');
admin.initializeApp(firebaseConfig);
const db = admin.firestore();

// Define a test suite
describe('Firestore Integration Tests', () => {
  let testDocumentId;

  // Create a test document before each test case
  beforeEach(async () => {
    const docRef = await db.collection('test-collection').add({
      name: 'Test Document',
      description: 'This is a test document',
    });
    testDocumentId = docRef.id;
  });

  // Delete the test document after each test case
  afterEach(async () => {
    await db.collection('test-collection').doc(testDocumentId).delete();
  });

  // Test GET /documents route
  it('should return all documents from Firestore', async () => {
    const response = await request(app).get('/documents');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1); // Assuming only one test document exists
    expect(response.body[0].name).toBe('Test Document');
  });

  // Test POST /documents route
  it('should create a new document in Firestore', async () => {
    const newDocument = {
      name: 'New Document',
      description: 'This is a new document',
    };
    const response = await request(app).post('/documents').send(newDocument);
    expect(response.status).toBe(201);

    // Check if the new document exists in Firestore
    const docSnapshot = await db.collection('test-collection').doc(response.body.id).get();
    expect(docSnapshot.exists).toBe(true);
    expect(docSnapshot.data().name).toBe('New Document');
  });

  // Test DELETE /documents/:id route
  it('should delete a document from Firestore', async () => {
    const response = await request(app).delete(`/documents/${testDocumentId}`);
    expect(response.status).toBe(204);

    // Check if the test document is deleted from Firestore
    const docSnapshot = await db.collection('test-collection').doc(testDocumentId).get();
    expect(docSnapshot.exists).toBe(false);
  });
});
