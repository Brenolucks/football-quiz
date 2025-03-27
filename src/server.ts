import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });