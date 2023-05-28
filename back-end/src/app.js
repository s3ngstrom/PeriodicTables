// Import the path module
// Load environment variables from .env file 
// Import the express module 
// Import the cors module 
// Import custom error handler middleware 
// Import custom not found middleware 
// Import reservations router 
// Import tables router 

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const errorHandler = require("./errors/errorHandler");
const notFound = require("./errors/notFound");
const reservationsRouter = require("./reservations/reservations.router");
const tablesRouter = require("./tables/tables.router");

// Create express app 
const app = express();
// Enable CORS 
app.use(cors());
// Parse JSON data from incoming requests 
app.use(express.json());
// Route incoming requests to the reservations router 
app.use("/reservations", reservationsRouter);
// Route incoming requests to the tables router 
app.use("/tables", tablesRouter)
// Handle requests for non-existing routes 
app.use(notFound);
// Handle errors from previous middlewares 
app.use(errorHandler);
// Export the express app 
module.exports = app;
