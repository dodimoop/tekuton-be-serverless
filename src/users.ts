import { APIGatewayProxyHandler } from "aws-lambda";
import dotenv from "dotenv";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./config/configDatabase";
import User from "./models/usersModels";
import { hashPassword } from "./utils/passwordUtils";

dotenv.config();

export const getAllUsers: APIGatewayProxyHandler = async (event) => {
  console.log("Connecting to database...");
  await connectToDatabase();

  try {
    console.log("Fetching users from database...");
    // Get All Users Except Yourself
    const userId = event.requestContext.authorizer?.userId;
    const users = await User.find({
      _id: { $ne: userId },
      hobby_ids: { $exists: true },
    }).populate("hobby_ids");

    console.log("Users fetched: ", users);

    const response = {
      success: true,
      message:
        users.length > 0 ? "Get All Users Successfully!" : "No users found.",
      data: users,
    };

    console.log("Response: ", response);

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to fetch users.",
      }),
    };
  } finally {
    console.log("Closing database connection...");
    await closeDatabaseConnection();
  }
};

export const createUser: APIGatewayProxyHandler = async (event) => {
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
  await connectToDatabase();
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Email is already in use. Please choose a different email.",
        }),
      };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      firstName,
      lastName,
      age,
      email,
      password: hashedPassword,
      hobby_ids: hobby_ids ?? null,
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
  } catch (error: any) {
    console.error("Error creating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to create user.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const updateUser: APIGatewayProxyHandler = async (event) => {
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

  await connectToDatabase();

  try {
    const userId = event.pathParameters?.id; // Get id from parameter

    // Find user by Id
    const user = await User.findById(userId);

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
      ? await hashPassword(requestBody.password)
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
  } catch (error: any) {
    console.error("Error updating user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to update user.",
        error: error.message, // Menyertakan pesan error untuk debugging
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const removeUser: APIGatewayProxyHandler = async (event) => {
  if (!event.pathParameters || !event.pathParameters.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        message: "Invalid request. ID parameter is required.",
      }),
    };
  }

  await connectToDatabase();

  try {
    const userId = event.pathParameters?.id;
    // Find user by ID and remove
    const user = await User.findOneAndDelete({ _id: userId });

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
  } catch (error: any) {
    console.error("Error removing user:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to remove user.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const meProfile: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.userId; // Get userId from authorizer User Login

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
    await connectToDatabase();

    // Find the user by ID
    const user = await User.findById(userId).populate("hobby_ids");

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
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to fetch user details.",
        error: error.message,
      }),
    };
  } finally {
    // Close the database connection
    await closeDatabaseConnection();
  }
};
