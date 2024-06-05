"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meProfile = exports.removeUser = exports.updateUser = exports.createUser = exports.getAllUsers = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const configDatabase_1 = require("./config/configDatabase");
const usersModels_1 = __importDefault(require("./models/usersModels"));
const passwordUtils_1 = require("./utils/passwordUtils");
dotenv_1.default.config();
const getAllUsers = async (event) => {
    var _a;
    console.log("Connecting to database...");
    await (0, configDatabase_1.connectToDatabase)();
    try {
        console.log("Fetching users from database...");
        // Get All Users Except Yourself
        const userId = (_a = event.requestContext.authorizer) === null || _a === void 0 ? void 0 : _a.userId;
        const users = await usersModels_1.default.find({
            _id: { $ne: userId },
            hobby_ids: { $exists: true },
        }).populate("hobby_ids");
        console.log("Users fetched: ", users);
        const response = {
            success: true,
            message: users.length > 0 ? "Get All Users Successfully!" : "No users found.",
            data: users,
        };
        console.log("Response: ", response);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to fetch users.",
            }),
        };
    }
    finally {
        console.log("Closing database connection...");
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.getAllUsers = getAllUsers;
const createUser = async (event) => {
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
    const { firstName, lastName, age, email, password, hobby_ids } = requestBody;
    if (!firstName || !lastName || !age || !email || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. Missing required fields.",
            }),
        };
    }
    // Check if email already exists
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const existingUser = await usersModels_1.default.findOne({ email });
        if (existingUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: "Email is already in use. Please choose a different email.",
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
            hobby_ids: hobby_ids !== null && hobby_ids !== void 0 ? hobby_ids : null,
        });
        const result = await newUser.save();
        const payload = {
            success: true,
            message: "User created successfully!",
            data: result,
        };
        return {
            statusCode: 201,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error creating user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to create user.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.createUser = createUser;
const updateUser = async (event) => {
    var _a;
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
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const userId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id; // Get id from parameter
        // Find user by Id
        const user = await usersModels_1.default.findById(userId);
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "User not found.",
                }),
            };
        }
        // Update user's fields
        user.firstName = requestBody.firstName || user.firstName;
        user.lastName = requestBody.lastName || user.lastName;
        user.age = requestBody.age || user.age;
        user.email = requestBody.email || user.email;
        user.password = requestBody.password
            ? await (0, passwordUtils_1.hashPassword)(requestBody.password)
            : user.password;
        user.hobby_ids = requestBody.hobby_ids || user.hobby_ids;
        // Save changes
        await user.save();
        const payload = {
            success: true,
            message: "User updated successfully!",
            data: user,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error updating user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to update user.",
                error: error.message, // Menyertakan pesan error untuk debugging
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.updateUser = updateUser;
const removeUser = async (event) => {
    var _a;
    if (!event.pathParameters || !event.pathParameters.id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. ID parameter is required.",
            }),
        };
    }
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const userId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        // Find user by ID and remove
        const user = await usersModels_1.default.findOneAndDelete({ _id: userId });
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "User not found.",
                }),
            };
        }
        const payload = {
            success: true,
            message: "User removed successfully!",
            data: user,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error removing user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to remove user.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.removeUser = removeUser;
const meProfile = async (event) => {
    var _a;
    const userId = (_a = event.requestContext.authorizer) === null || _a === void 0 ? void 0 : _a.userId; // Get userId from authorizer User Login
    if (!userId) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                success: false,
                message: "Unauthorized. User ID is required.",
            }),
        };
    }
    try {
        // Connect to the database
        await (0, configDatabase_1.connectToDatabase)();
        // Find the user by ID
        const user = await usersModels_1.default.findById(userId).populate("hobby_ids");
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "User not found.",
                }),
            };
        }
        const payload = {
            success: true,
            message: "User details fetched successfully!",
            data: user,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to fetch user details.",
                error: error.message,
            }),
        };
    }
    finally {
        // Close the database connection
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.meProfile = meProfile;
