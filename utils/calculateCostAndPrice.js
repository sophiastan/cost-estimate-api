/**
 * Calculates the cost and price of an estimate based on provided parameters.
 * This function computes the cost based on units, time, and rate. The price is then calculated
 * by applying the margin to the cost.
 */
const calculateCostAndPrice = (estimate) => {
  const { units, time, rate, margin } = estimate;

  let cost;
  // Calculate cost based on whether time is provided
  if (time) {
    // Cost calculation when time is involved
    cost = units * time * rate;
  } else {
    // Cost calculation when only units and rate are involved
    cost = units * rate;
  }

  // Calculate price by applying margin to cost
  const price = Math.round(cost / (1 - margin / 100)); // Round to the nearest whole number

  // Return the computed cost and price
  return { cost, price };
};

module.exports = calculateCostAndPrice;
