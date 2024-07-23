# Estimate API Service

This project provides an API service for estimating project costs and prices using CRUD operations to manage estimates in a database. It models a streamlined workflow for paving contractors who need to provide accurate pricing to customers based on factors such as labor, materials, equipment, and time.

## Prerequisites

- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/)
- **npm**: Comes with Node.js, but you can also check the installation instructions [here](https://www.npmjs.com/get-npm)
- **MongoDB**: Download and install from [mongodb.com](https://www.mongodb.com/try/download/community)

## Getting Started

### 1. Clone the Repository

Clone the repository to your local machine using Git:
```sh
git clone https://github.com/sophiastan/cost-estimate-api.git
cd your-repository
```
### 2. Install Dependencies

Install the required dependencies using npm:
```sh 
npm install
```
### 3. Set up Environment Variables

Create a .env file in the root directory of your project and add the following environment variables:
```sh
PORT=8000
MONGODB_URI=mongodb://localhost:27017/your-database-name
```
Replace your-database-name with the name you want to give to your local MongoDB database.

### 4. Run MongoDB
Start your MongoDB server. If you have MongoDB installed as a service, it might already be running. Otherwise, you can start it from the terminal:
```sh 
mongod
```

### 5. Start the Server

Install the required dependencies using npm:
```sh
npm start
```
You should see output indicating that the server is running:
```vbnet
Server is running on port 8000
Connected to MongoDB
```
### 6. Run the Server with Nodemon

To automatically restart the server when file changes are detected, you can use nodemon. First, install nodemon globally if you haven't already:
```sh
npm install -g nodemon
```
Then, add a dev script to your package.json:
```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```
Now, you can run the server in development mode with:
```sh
npm run dev
```
### 7. Running Tests

To run the tests for your application, use the following command:
```sh
npm test
```
## API Endpoints
Here are the available API endpoints you can test using tools like Postman or curl:
### Create a New Estimate
* POST /estimates
* Request Body Example:
```json
{
    "orders": [
        {
            "type": "labor",
            "item": "digging",
            "units": 5,
            "time": 2,
            "rate": 20,
            "margin": 30
        },
        {
            "type": "material",
            "item": "cement",
            "units": 10,
            "rate": 15,
            "margin": 20
        }
    ]
}
```
* Response Example
```json
{
    "_id": "5f50c31b9a0b5a3f8c8a576f",
    "items": [
        {
            "order": [
                {
                    "type": "labor",
                    "item": "digging",
                    "units": 5,
                    "time": 2,
                    "rate": 20,
                    "margin": 30
                }
            ],
            "cost": 200,
            "price": 260
        },
        {
            "order": [
                {
                    "type": "material",
                    "item": "cement",
                    "units": 10,
                    "rate": 15,
                    "margin": 20
                }
            ],
            "cost": 150,
            "price": 180
        }
    ],
    "total": {
        "cost": 350,
        "margin": 25,
        "price": 440
    }
}
```
### Retrieve All Estimates
* GET /estimates
* Response Example:
```json
[
    {
        "_id": "5f50c31b9a0b5a3f8c8a576f",
        "items": [
            {
                "order": [
                    {
                        "type": "labor",
                        "item": "digging",
                        "units": 5,
                        "time": 2,
                        "rate": 20,
                        "margin": 30
                    }
                ],
                "cost": 200,
                "price": 260
            },
            {
                "order": [
                    {
                        "type": "material",
                        "item": "cement",
                        "units": 10,
                        "rate": 15,
                        "margin": 20
                    }
                ],
                "cost": 150,
                "price": 180
            }
        ],
        "total": {
            "cost": 350,
            "margin": 25,
            "price": 440
        }
    }
]
```
### Retrieve a Single Estimate by ID
* GET /estimates/
* Response Example:
```json
{
    "_id": "5f50c31b9a0b5a3f8c8a576f",
    "items": [
        {
            "order": [
                {
                    "type": "labor",
                    "item": "digging",
                    "units": 5,
                    "time": 2,
                    "rate": 20,
                    "margin": 30
                }
            ],
            "cost": 200,
            "price": 260
        },
        {
            "order": [
                {
                    "type": "material",
                    "item": "cement",
                    "units": 10,
                    "rate": 15,
                    "margin": 20
                }
            ],
            "cost": 150,
            "price": 180
        }
    ],
    "total": {
        "cost": 350,
        "margin": 25,
        "price": 440
    }
}
```
### Update an Estimate by ID
* PUT /estimates/
* Request Body Example:
```json
{
    "items": [
        {
            "order": [
                {
                    "type": "labor",
                    "item": "digging",
                    "units": 6,
                    "time": 3,
                    "rate": 25,
                    "margin": 25
                },
                {
                    "type": "material",
                    "item": "cement",
                    "units": 12,
                    "rate": 18,
                    "margin": 15
                }
            ],
            "cost": 0,
            "price": 0
        }
    ]
}
```
* Response Example:
```json
{
    "_id": "5f50c31b9a0b5a3f8c8a576f",
    "items": [
        {
            "order": [
                {
                    "type": "labor",
                    "item": "digging",
                    "units": 6,
                    "time": 3,
                    "rate": 25,
                    "margin": 25
                }
            ],
            "cost": 450,
            "price": 562.5
        },
        {
            "order": [
                {
                    "type": "material",
                    "item": "cement",
                    "units": 12,
                    "rate": 18,
                    "margin": 15
                }
            ],
            "cost": 216,
            "price": 248.4
        }
    ],
    "total": {
        "cost": 666,
        "margin": 20,
        "price": 810.9
    }
}
```
### Delete an Estimate by ID
* DELETE /estimates/
* Response Example:
```json
{
    "success": true
}
```
## Troubleshooting
* Cannot connect to MongoDB: Ensure MongoDB is running and the connection string in .env is correct.
* Scripts not working as expected: Make sure your package.json scripts look like this:
```json
"scripts": {
  "test": "jest",
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```
