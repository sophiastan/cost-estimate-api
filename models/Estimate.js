const mongoose = require('mongoose');

/**
 * Schema for individual order items.
 * Represents a single entry in the estimate.
 */
const orderItemSchema = new mongoose.Schema({
  type: String,
  item: String,
  units: Number,
  time: Number,
  rate: Number,
  margin: Number,
});

/**
 * Schema for an estimate, which includes multiple order items.
 */
const estimateSchema = new mongoose.Schema({
  items: [{
    order: [orderItemSchema],
    cost: Number,
    price: Number,
  }],
  total: {
    cost: Number,
    margin: Number, 
    price: Number
  }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const Estimate = mongoose.model('Estimate', estimateSchema);

module.exports = { OrderItem, Estimate };
