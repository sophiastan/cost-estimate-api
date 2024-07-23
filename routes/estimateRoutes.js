const express = require('express');
const router = express.Router();
const { Estimate } = require('../models/Estimate'); 
const calculateCostAndPrice = require('../utils/calculateCostAndPrice'); // Utility to calculate cost and price for orders

// HELPER FUNCTIONS

/**
 * Validates the structure and content of the orders array.
 * @param {Array} orders - Array of orders to be validated.
 * @throws Will throw an error if the orders array is not valid.
 */
const validateOrders = (orders) => {
  if (!Array.isArray(orders)) {
    throw new Error('Orders should be an array');
  }
  if (orders.length === 0) {
    throw new Error('Orders cannot be empty');
  }
  orders.forEach(order => {
    if (!order.type || !order.item || !order.units || !order.rate || order.margin === undefined) {
      throw new Error('Each order must include type, item, units, rate, and margin');
    }
  });
};

/**
 * Processes the orders to calculate costs and prices, and aggregates totals.
 * @param {Array} orders - Array of orders to be processed.
 * @returns {Object} Processed orders and total cost, margin, and price.
 */
const processOrders = (orders) => {
  const processedOrders = orders.map(orderData => {
    const { cost, price } = calculateCostAndPrice(orderData); // Calculate cost and price for each order
    return {
      order: [orderData],
      cost,
      price
    };
  });

  // Calculate total cost, total price, and average margin
  const totalCost = processedOrders.reduce((sum, item) => sum + item.cost, 0);
  const totalPrice = processedOrders.reduce((sum, item) => sum + item.price, 0);
  const margin = orders.reduce((sum, order) => sum + (order.margin || 0), 0) / orders.length;

  return {
    processedOrders,
    total: {
      cost: totalCost,
      margin,
      price: totalPrice
    }
  };
};

// CRUD OPERATIONS for managing estimates

/**
 * GET request to retrieve all estimates from the database.
 * @route GET /estimates
 * @returns {Object} List of all estimates
 * @throws {500} Internal Server Error
 */
router.get('/estimates', async (req, res) => {
  try {
    const estimates = await Estimate.find();
    res.status(200).json(estimates);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving estimates', error: error.message });
  }
});

/**
 * GET request to retrieve a single estimate by its ID.
 * @route GET /estimates/:id
 * @param {string} id - Estimate ID
 * @returns {Object} The estimate with the specified ID
 * @throws {404} Not Found
 * @throws {500} Internal Server Error
 */
router.get('/estimates/:id', async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }
    res.status(200).json(estimate);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving estimate', error: error.message });
  }
});

/**
 * POST request to create a new estimate.
 * @route POST /estimates
 * @param {Object} req.body - Request body containing orders to create an estimate.
 * @returns {Object} The newly created estimate
 * @throws {400} Bad Request
 */
router.post('/estimates', async (req, res) => {
  try {
    const { orders } = req.body;
    validateOrders(orders); // Validate orders data

    const { processedOrders, total } = processOrders(orders);

    const estimate = new Estimate({
      items: processedOrders,
      total
    });

    await estimate.save();
    res.status(201).json(estimate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating estimate', error: error.message });
  }
});

/**
 * PUT request to update an estimate by its ID.
 * @route PUT /estimates/:id
 * @param {string} id - Estimate ID
 * @param {Object} req.body - Request body containing updated data for the estimate.
 * @returns {Object} The updated estimate
 * @throws {400} Bad Request
 * @throws {404} Not Found
 */
router.put('/estimates/:id', async (req, res) => {
  try {
    const updatedData = req.body;

    if (updatedData.items) {
      // Ensure correct data structure when processing orders from PUT request
      validateOrders(updatedData.items.flatMap(item => item.order));

      const { processedOrders, total } = processOrders(updatedData.items.flatMap(item => item.order));

      updatedData.items = processedOrders;
      updatedData.total = total;
    }

    // Update the estimate with new data
    const updatedEstimate = await Estimate.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updatedEstimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }
    res.status(200).json(updatedEstimate);
  } catch (error) {
    res.status(400).json({ message: 'Error updating estimate', error: error.message });
  }
});

/**
 * DELETE request to delete an estimate by its ID.
 * @route DELETE /estimates/:id
 * @param {string} id - Estimate ID
 * @returns {Object} The deleted estimate
 * @throws {404} Not Found
 * @throws {500} Internal Server Error
 */
router.delete('/estimates/:id', async (req, res) => {
  try {
    const deletedEstimate = await Estimate.findByIdAndDelete(req.params.id);
    if (!deletedEstimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }
    res.status(200).json(deletedEstimate);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting estimate', error: error.message });
  }
});

module.exports = router;
