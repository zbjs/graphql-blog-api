// /src/server.js 
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const connectDB = require('./utils/db');
const schema = require('./graphql/schema');
require('dotenv').config();
const cors = require('cors')

const app = express();
connectDB();


// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Add your Next.js app URLs
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(
  '/graphql',
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: req,
  }))
);

app.listen(4000, () => console.log('Server running on http://localhost:4000/graphql'));
