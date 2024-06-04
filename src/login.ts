import { APIGatewayProxyHandler } from "aws-lambda";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./config/configDatabase";
import User from "./models/usersModels";
import { comparePassword } from "./utils/passwordUtils";

dotenv.config();

const JWT_SECRET = process.env.SECRET_KEY!;

export const loginUser: APIGatewayProxyHandler = async (event) => {
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

  await connectToDatabase();

  try {
    // Find user by email
    const user = await User.findOne({ email });

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
    const isPasswordValid = await comparePassword(password, user.password);

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
    const token = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "10h" }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Login successful.",
        token: token,
      }),
    };
  } catch (error: any) {
    console.error("Error logging in user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to login user.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};
