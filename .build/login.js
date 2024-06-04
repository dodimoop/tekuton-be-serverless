"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configDatabase_1 = require("./config/configDatabase");
const usersModels_1 = __importDefault(require("./models/usersModels"));
const passwordUtils_1 = require("./utils/passwordUtils");
dotenv_1.default.config();
const JWT_SECRET = process.env.SECRET_KEY;
const loginUser = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. Body is required.",
            }),
        };
    }
    const { email, password } = JSON.parse(event.body);
    console.log("email, password", email, password);
    if (!email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Email and password are required.",
            }),
        };
    }
    await (0, configDatabase_1.connectToDatabase)();
    try {
        // Find user by email
        const user = await usersModels_1.default.findOne({ email });
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "User not found.",
                }),
            };
        }
        // Compare passwords
        const isPasswordValid = await (0, passwordUtils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    success: false,
                    message: "Invalid password.",
                }),
            };
        }
        // Password is valid, generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            email: user.email,
        }, JWT_SECRET, { expiresIn: "10h" });
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Login successful.",
                token: token,
            }),
        };
    }
    catch (error) {
        console.error("Error logging in user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to login user.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.loginUser = loginUser;
