import mongoose from "mongoose";
import 'dotenv/config';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://greatstack:nahida123@cluster0.7qixkof.mongodb.net/medical-equipment';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Stop server if DB connection fails
  }
};
