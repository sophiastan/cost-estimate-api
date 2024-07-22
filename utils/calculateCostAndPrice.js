const calculateCostAndPrice = (estimate) => {
  const { units, time, rate, margin } = estimate;
  let cost;
  if (time) {
    cost = units * time * rate;
  } else {
    cost = units * rate;
  }
  const price = Math.round(cost / (1 - margin / 100)); // Round to the nearest whole number
  return { cost, price };
};

module.exports = calculateCostAndPrice;
