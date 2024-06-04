import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env file");
}

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
};

export const closeDatabaseConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("Closed MongoDB connection");
  } catch (error) {
    console.error("Failed to close MongoDB connection", error);
    throw error;
  }
};
