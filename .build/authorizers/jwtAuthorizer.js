"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const handler = async (event) => {
    console.log("Authorizing a user");
    try {
        const token = event.authorizationToken.split(" ")[1]; // Extract JWT token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log("User was authorized", decoded);
        // Generate the IAM policy for the user
        const policy = generatePolicy(decoded.userId, "Allow", event.methodArn);
        return policy;
    }
    catch (error) {
        console.error("User unauthorized", error);
        throw "Unauthorized"; // Return a 401 Unauthorized error
    }
};
exports.handler = handler;
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
        context: {
            userId: principalId,
        },
    };
    return authResponse;
};
