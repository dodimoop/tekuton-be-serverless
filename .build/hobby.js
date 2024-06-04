"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeHobby = exports.updateHobby = exports.createHobby = exports.getAllHobbies = void 0;
const configDatabase_1 = require("./config/configDatabase");
const hobbyModels_1 = __importDefault(require("./models/hobbyModels"));
const getAllHobbies = async (event) => {
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const hobbies = await hobbyModels_1.default.find();
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: hobbies.length > 0
                    ? "Get All Hobbies Successfully!"
                    : "No hobbies found.",
                data: hobbies,
            }),
        };
    }
    catch (error) {
        console.error("Error fetching hobbies:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to fetch hobbies.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.getAllHobbies = getAllHobbies;
const createHobby = async (event) => {
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
    const { name, active } = requestBody;
    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Name is required for creating a hobby.",
            }),
        };
    }
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const newHobby = new hobbyModels_1.default({ name, active });
        await newHobby.save();
        const payload = {
            success: true,
            message: "Hobby created successfully!",
            data: newHobby,
        };
        return {
            statusCode: 201,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error creating hobby:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to create hobby.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.createHobby = createHobby;
const updateHobby = async (event) => {
    if (!event.pathParameters || !event.pathParameters.id || !event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Invalid request. ID parameter and body are required.",
            }),
        };
    }
    const { id } = event.pathParameters;
    const requestBody = JSON.parse(event.body);
    const { name, active } = requestBody;
    if (!name) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                success: false,
                message: "Name is required for updating a hobby.",
            }),
        };
    }
    await (0, configDatabase_1.connectToDatabase)();
    try {
        const hobbyToUpdate = await hobbyModels_1.default.findById(id);
        if (!hobbyToUpdate) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "Hobby not found.",
                }),
            };
        }
        hobbyToUpdate.name = name;
        hobbyToUpdate.active = active;
        await hobbyToUpdate.save();
        const payload = {
            success: true,
            message: "Hobby updated successfully!",
            data: hobbyToUpdate,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error updating hobby:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to update hobby.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.updateHobby = updateHobby;
const removeHobby = async (event) => {
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
        const hobbyId = (_a = event.pathParameters) === null || _a === void 0 ? void 0 : _a.id;
        // Find hobby by ID and remove
        const hobby = await hobbyModels_1.default.findOneAndDelete({ _id: hobbyId });
        if (!hobby) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    message: "Hobby not found.",
                }),
            };
        }
        const payload = {
            success: true,
            message: "Hobby deleted successfully!",
            data: hobby,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(payload),
        };
    }
    catch (error) {
        console.error("Error deleting hobby:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Failed to delete hobby.",
                error: error.message,
            }),
        };
    }
    finally {
        await (0, configDatabase_1.closeDatabaseConnection)();
    }
};
exports.removeHobby = removeHobby;
