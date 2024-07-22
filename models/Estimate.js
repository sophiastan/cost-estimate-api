const mongoose = require('mongoose');

// Define OrderItem schema
const orderItemSchema = new mongoose.Schema({
  type: String,
  item: String,
  units: Number,
  time: Number,
  rate: Number,
  margin: Number,
});

// Define Estimate schema
const estimateSchema = new mongoose.Schema({
  items: [{
    order: [orderItemSchema],
    cost: Number,
    price: Number,
  }],
  total: {
    cost: Number,
    margin: Number,  // Rename avgMargin to margin
    price: Number
  }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
const Estimate = mongoose.model('Estimate', estimateSchema);

module.exports = { OrderItem, Estimate };
