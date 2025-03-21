import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import { clerkWebhooks } from './controllers/webhooks.js';

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database inside an IIFE (Immediately Invoked Function Expression)
(async () => {
    try {
        await connectDB();
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Database Connection Error:", error);
        process.exit(1); // Stop the server if DB connection fails
    }
})();

// Routes
app.get('/', (req, res) => res.send("API working"));
app.post('/clerk', clerkWebhooks);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
