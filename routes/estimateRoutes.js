const express = require('express');
const router = express.Router();
const { Estimate } = require('../models/Estimate'); // Ensure correct path
const calculateCostAndPrice = require('../utils/calculateCostAndPrice'); // Ensure correct path

// Function to process orders and calculate totals
const processOrders = (orders) => {
  const processedOrders = orders.map(orderData => {
    const { cost, price } = calculateCostAndPrice(orderData);
    return {
      order: [orderData],
      cost,
      price
    };
  });

  const totalCost = processedOrders.reduce((sum, item) => sum + item.cost, 0);
  const totalPrice = processedOrders.reduce((sum, item) => sum + item.price, 0);
  const avgMargin = orders.reduce((sum, order) => sum + (order.margin || 0), 0) / orders.length;

  return {
    processedOrders,
    total: {
      cost: totalCost,
      avgMargin,
      price: totalPrice
    }
  };
};

// GET request to retrieve all estimates
router.get('/estimates', async (req, res) => {
  try {
    const estimates = await Estimate.find();
    res.status(200).json(estimates);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving estimates', error: error.message });
  }
});

// POST request to create a new estimate
router.post('/estimates', async (req, res) => {
  try {
    const { orders } = req.body;
    const { processedOrders, total } = processOrders(orders);

    const estimate = new Estimate({
      items: processedOrders,
      total
    });

    await estimate.save();
    res.status(201).json(estimate);
  } catch (error) {
    res.status(500).json({ message: 'Error creating estimate', error: error.message });
  }
});

// GET request to retrieve a single estimate by ID
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

// PUT request to update an estimate by ID
router.put('/estimates/:id', async (req, res) => {
  try {
    const updatedData = req.body;

    if (updatedData.items) {
      const { processedOrders, total } = processOrders(updatedData.items.map(item => item.order[0]));

      updatedData.items = processedOrders;
      updatedData.total = total;
    }

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
    res.status(500).json({ message: 'Error updating estimate', error: error.message });
  }
});

// DELETE request to delete an estimate by ID
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