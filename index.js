const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const { swaggerUi, swaggerDocs } = require('./swagger');

dotenv.config();
connectDB();

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// app.get('/', (req, res) => {
//     res.send('API is running...');
// });

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use auth routes
app.use('/api/auth/', authRoutes);


const PORT = process.env.PORT || 8092;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
