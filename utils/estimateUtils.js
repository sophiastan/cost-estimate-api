const calculateCostAndPrice = require('./calculateCostAndPrice'); // Import the calculation function

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
  const margin = Math.round(orders.reduce((sum, order) => sum + (order.margin || 0), 0) / orders.length);

  return {
    processedOrders,
    total: {
      cost: totalCost,
      margin,
      price: totalPrice
    }
  };
};

module.exports = {
  validateOrders,
  processOrders
};
