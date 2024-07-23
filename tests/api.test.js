const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const { processOrders } = require('../utils/estimateUtils');

// Run before all tests to establish database connection
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// Run after all tests to clean up the database and close the connection
afterAll(async () => {
  await mongoose.connection.dropDatabase(); // Clean up database after tests
  await mongoose.connection.close(); // Close the database connection
});

// Grouping all API tests related to estimates
describe('API Tests', () => {
  let estimateId;
  const orders = [
    { type: 'labor', item: 'digout', units: 3, time: 3, rate: 30, margin: 30 },
    { type: 'labor', item: 'paving', units: 4, time: 4, rate: 30, margin: 30 },
    { type: 'materials', item: 'asphalt', units: 100, rate: 75, margin: 20 },
    { type: 'material', item: 'sealcoating', units: 10, rate: 35, margin: 20 },
    { type: 'equipment', item: 'bobcat', units: 3, time: 3, rate: 20, margin: 20 },
    { type: 'equipment', item: 'trucks', units: 4, time: 4, rate: 50, margin: 20 },
    { type: 'equipment', item: 'paver', units: 1, time: 1, rate: 700, margin: 20 }
  ];

  // Helper function to calculate expected totals using the new utility function
  const calculateExpectedTotals = (orders) => {
    const { processedOrders, total } = processOrders(orders);
    return {
      expectedItems: processedOrders,
      totalCost: total.cost,
      totalPrice: total.price,
      averageMargin: total.margin
    };
  };

  // Test case for creating a new estimate
  it('should create a new estimate', async () => {
    const response = await request(app)
      .post('/estimates')
      .send({ orders });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('items');
    expect(response.body).toHaveProperty('total');

    // Calculate expected items and totals dynamically
    const { items, total } = response.body;
    const { expectedItems, totalCost, totalPrice, averageMargin } = calculateExpectedTotals(orders);

    // Check items
    expect(items).toHaveLength(expectedItems.length);

    items.forEach((item, index) => {
      expect(item).toHaveProperty('order');
      expect(item).toHaveProperty('cost');
      expect(item).toHaveProperty('price');
      expect(item.cost).toBe(expectedItems[index].cost);
      expect(item.price).toBe(expectedItems[index].price);
    });

    // Check total
    expect(total).toHaveProperty('cost', totalCost);
    expect(total).toHaveProperty('price', totalPrice);
    expect(total).toHaveProperty('margin', averageMargin);

    estimateId = response.body._id; // Save ID for other tests
  });

  // Test case for retrieving all estimates
  it('should retrieve all estimates', async () => {
    const response = await request(app).get('/estimates');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test case for retrieving a single estimate by ID
  it('should retrieve a single estimate by ID', async () => {
    const response = await request(app).get(`/estimates/${estimateId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', estimateId);
  });

  // Test case for updating an estimate by ID
  it('should update an estimate by ID', async () => {
    const updatedOrders = [
      { type: 'labor', item: 'digout', units: 5, time: 5, rate: 30, margin: 30 },
      { type: 'labor', item: 'paving', units: 4, time: 4, rate: 30, margin: 30 },
      { type: 'materials', item: 'asphalt', units: 100, rate: 75, margin: 20 },
      { type: 'material', item: 'sealcoating', units: 10, rate: 35, margin: 20 },
      { type: 'equipment', item: 'bobcat', units: 4, time: 3, rate: 20, margin: 20 },
      { type: 'equipment', item: 'trucks', units: 4, time: 4, rate: 50, margin: 20 },
      { type: 'equipment', item: 'paver', units: 1, time: 1, rate: 700, margin: 20 }
    ];

    const { totalCost: updatedTotalCost, totalPrice: updatedTotalPrice, averageMargin: updatedAverageMargin } = calculateExpectedTotals(updatedOrders);

    const response = await request(app)
      .put(`/estimates/${estimateId}`)
      .send({
        items: [
          {
            order: updatedOrders,
            cost: 0,
            price: 0  
          }
        ]
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.total).toHaveProperty('cost', updatedTotalCost);
    expect(response.body.total).toHaveProperty('price', updatedTotalPrice);
    expect(response.body.total).toHaveProperty('margin', updatedAverageMargin);
  });

  // Test case for deleting an estimate by ID
  it('should delete an estimate by ID', async () => {
    const response = await request(app).delete(`/estimates/${estimateId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);

    const findResponse = await request(app).get(`/estimates/${estimateId}`);
    expect(findResponse.statusCode).toBe(404);
  });
});
