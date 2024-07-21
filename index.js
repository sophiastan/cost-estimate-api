require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error:', error);
});

app.use(bodyParser.json());


// Define Order schema 
const orderSchema = new mongoose.Schema({
  type: String,
  item: String,
  units: Number,
  time: Number,
  rate: Number,
  margin: Number,
});

// Define models
const workSchema = new mongoose.Schema({
  orders: [orderSchema],
})

// Define Output schema
const outputSchema = new mongoose.Schema({
  estimatedItems: [{
  workOrderInput: [orderSchema],
  cost: Number,
  price: Number,
  }],
  total: {
    cost: Number,
    margin: Number,
    price: Number
  }
});

const Order = mongoose.model('Order', orderSchema);
const Work = mongoose.model('Work', workSchema);
const Output = mongoose.model('Output', outputSchema);

// Function to calculate cost and price
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

// CRUD Operations

// Simple GET request to the root URL
app.get('/', (req, res) => {
  res.json({ hi: "there" });
});

// GET request to retrieve all cost estimates
app.get('/cost-estimates', async (req, res) => {
  try {
    const costEstimates = await Output.find();
    res.status(200).json(costEstimates);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cost estimates', error });
  }
});

// need to change the end point name
// construct the Work object, using the OrderEstimate as a template
// app.post('/cost-estimates', async (req, res) => {
//   try {
//     // console.log(req.body);
//     const work = {...req.body};

//     const newWork = new Work({
//       orders: work.orders.map(order => {
//         return new Order({
//           type: order.type,
//           item: order.item,
//           units: order.units,
//           time: order.time,
//           rate: order.rate,
//           margin: order.margin,
//         });
//       })  
//     })

//     console.log(newWork);
//     await newWork.validate();

//     const { cost, price } = calculateCostAndPrice(newWork);
//     console.log(cost, price);
//     const outputEstimate = new Output({newWork});

//     await outputEstimate.save();
//     res.status(201).json(outputEstimate);
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating cost estimate', error });
//   }
// });

// POST request to create a new cost estimate
app.post('/cost-estimates', async (req, res) => {
  try {
    const { orders } = req.body;

    // Process orders to include cost and price
    const processedOrders = orders.map(orderData => {
      const { cost, price } = calculateCostAndPrice(orderData);
      return {
        workOrderInput: [orderData],
        cost,
        price
      };
    });

    // Calculate totals
    const totalCost = processedOrders.reduce((sum, item) => sum + item.cost, 0);
    const totalPrice = processedOrders.reduce((sum, item) => sum + item.price, 0);
    const totalMargin = orders.reduce((sum, order) => sum + (order.margin || 0), 0);

    // Create and save the output estimate
    const outputEstimate = new Output({
      estimatedItems: processedOrders,
      total: {
        cost: totalCost,
        margin: totalMargin,
        price: totalPrice
      }
    });

    await outputEstimate.save();
    res.status(201).json(outputEstimate);
  } catch (error) {
    res.status(500).json({ message: 'Error creating cost estimate', error });
  }
});

// GET request to retrieve a single cost estimate by ID
app.get('/cost-estimates/:id', async (req, res) => {
  try {
    const estimate = await Output.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ message: 'Cost estimate not found' });
    }
    res.status(200).json(estimate);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cost estimate', error });
  }
});

// PATCH request to update a cost estimate by ID
app.patch('/cost-estimates/:id', async (req, res) => {
  try {
    const updatedData = req.body;

    // Extract and calculate for the `estimatedItems` field if it exists
    if (updatedData.estimatedItems) {
      updatedData.estimatedItems = updatedData.estimatedItems.map(item => {
        const { cost, price } = calculateCostAndPrice(item.workOrderInput[0]); // Assuming single order per `workOrderInput`
        return {
          ...item,
          cost,
          price
        };
      });
      
      // Calculate new totals
      const totalCost = updatedData.estimatedItems.reduce((sum, item) => sum + item.cost, 0);
      const totalPrice = updatedData.estimatedItems.reduce((sum, item) => sum + item.price, 0);
      const totalMargin = updatedData.estimatedItems.reduce((sum, item) => sum + (item.workOrderInput[0].margin || 0), 0);

      updatedData.total = {
        cost: totalCost,
        margin: totalMargin,
        price: totalPrice
      };
    }

    const updatedEstimate = await Output.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    if (!updatedEstimate) {
      return res.status(404).json({ message: 'Cost estimate not found' });
    }
    res.status(200).json(updatedEstimate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cost estimate', error });
  }
});


// DELETE request to delete a cost estimate by ID
app.delete('/cost-estimates/:id', async (req, res) => {
  try {
    const deletedEstimate = await Output.findByIdAndDelete(req.params.id);
    if (!deletedEstimate) {
      return res.status(404).json({ message: 'Cost estimate not found' });
    }
    res.status(200).json(deletedEstimate);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting cost estimate', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});