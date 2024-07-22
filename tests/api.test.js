const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Ensure this path is correct
const { Estimate } = require('../models/Estimate'); 

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Clean up database after tests
  await mongoose.connection.close();
});

describe('API Tests', () => {
  let estimateId;

  it('should create a new estimate', async () => {
    const response = await request(app)
      .post('/estimates')
      .send({
        orders: [
          { type: 'labor', item: 'digging', units: 5, time: 2, rate: 20, margin: 30 },
          { type: 'material', item: 'cement', units: 10, rate: 15, margin: 20 }
        ]
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    estimateId = response.body._id; // Save ID for other tests
  });

  it('should retrieve all estimates', async () => {
    const response = await request(app).get('/estimates');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should retrieve a single estimate by ID', async () => {
    const response = await request(app).get(`/estimates/${estimateId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', estimateId);
  });

  it('should update an estimate by ID', async () => {
    const response = await request(app)
      .put(`/estimates/${estimateId}`)
      .send({
        items: [
          {
            order: [
              { type: 'labor', item: 'digging', units: 6, time: 3, rate: 25, margin: 25 },
              { type: 'material', item: 'cement', units: 12, rate: 18, margin: 15 }
            ],
            cost: 0,  // Placeholder
            price: 0   // Placeholder
          }
        ]
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.total).toHaveProperty('cost');
    expect(response.body.total).toHaveProperty('price');
    expect(response.body.total.cost).toBeGreaterThan(0);  // Ensure cost is updated
    expect(response.body.total.price).toBeGreaterThan(0); // Ensure price is updated
  });

  it('should delete an estimate by ID', async () => {
    const response = await request(app).delete(`/estimates/${estimateId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', estimateId);

    const findResponse = await request(app).get(`/estimates/${estimateId}`);
    expect(findResponse.statusCode).toBe(404);
  });
});
