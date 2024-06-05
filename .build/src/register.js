"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserRegister = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const configDatabase_1 = require("./config/configDatabase");
const usersModels_1 = __importDefault(require("./models/usersModels"));
const passwordUtils_1 = require("./utils/passwordUtils");
dotenv_1.default.config();
const createUserRegister = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. Body is required.",
            }),
        };
    }
    const requestBody = JSON.parse(event.body);
    const { firstName, lastName, age, email, password } = requestBody;
    if (!firstName || !lastName || !age || !email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. Missing required fields.",
            }),
        };
    }
    const hashedPassword = await (0, passwordUtils_1.hashPassword)(password);
    const newUser = new usersModels_1.default({
        firstName,
        lastName,
        age,
        email,
        password: hashedPassword,
        hobby_ids: null,
    });
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const result = await newUser.save();
        const payload = {
            success: true,
            message: "User register successfully!",
            data: result,
        };
        return {
            statusCode: 201,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error creating user register:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to create user register.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.createUserRegister = createUserRegister;
