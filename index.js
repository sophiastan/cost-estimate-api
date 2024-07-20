const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
// const port = process.env.PORT || 3000;

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/costEstimateDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// app.use(bodyParser.json());

// // Define CostEstimate schema and model
// const costEstimateSchema = new mongoose.Schema({
//   description: String,
//   amount: Number,
//   date: Date,
// });

// const CostEstimate = mongoose.model('CostEstimate', costEstimateSchema);


app.get('/', (req, res) => {
  res.send({ hi: 'there this has changed' });
});

// CRUD Operations

// Create a new cost estimate
// app.post('/cost-estimates', async (req, res) => {
//   try {
//     const costEstimate = new CostEstimate(req.body);
//     await costEstimate.save();
//     res.status(201).send(costEstimate);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// // Read all cost estimates
// app.get('/cost-estimates', async (req, res) => {
//   try {
//     const costEstimates = await CostEstimate.find();
//     res.status(200).send(costEstimates);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// // Read a single cost estimate by ID
// app.get('/cost-estimates/:id', async (req, res) => {
//   try {
//     const costEstimate = await CostEstimate.findById(req.params.id);
//     if (!costEstimate) {
//       return res.status(404).send();
//     }
//     res.status(200).send(costEstimate);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// // Update a cost estimate by ID
// app.patch('/cost-estimates/:id', async (req, res) => {
//   try {
//     const costEstimate = await CostEstimate.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!costEstimate) {
//       return res.status(404).send();
//     }
//     res.status(200).send(costEstimate);
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// // Delete a cost estimate by ID
// app.delete('/cost-estimates/:id', async (req, res) => {
//   try {
//     const costEstimate = await CostEstimate.findByIdAndDelete(req.params.id);
//     if (!costEstimate) {
//       return res.status(404).send();
//     }
//     res.status(200).send(costEstimate);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

app.listen(5000);
//http://localhost:5000/