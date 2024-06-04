"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabaseConnection = exports.connectToDatabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error("MONGODB_URI is not defined in .env file");
}
const connectToDatabase = async () => {
    try {
        await mongoose_1.default.connect(uri);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
};
exports.connectToDatabase = connectToDatabase;
const closeDatabaseConnection = async () => {
    try {
        await mongoose_1.default.connection.close();
        console.log("Closed MongoDB connection");
    }
    catch (error) {
        console.error("Failed to close MongoDB connection", error);
        throw error;
    }
};
exports.closeDatabaseConnection = closeDatabaseConnection;
