import { APIGatewayProxyHandler } from "aws-lambda";
import {
  closeDatabaseConnection,
  connectToDatabase,
} from "./config/configDatabase";
import Hobby from "./models/hobbyModels";

export const getAllHobbies: APIGatewayProxyHandler = async (event) => {
  await connectToDatabase();

  try {
    const hobbies = await Hobby.find();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message:
          hobbies.length > 0
            ? "Get All Hobbies Successfully!"
            : "No hobbies found.",
        data: hobbies,
      }),
    };
  } catch (error: any) {
    console.error("Error fetching hobbies:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to fetch hobbies.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const createHobby: APIGatewayProxyHandler = async (event) => {
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

  await connectToDatabase();

  try {
    const newHobby = new Hobby({ name, active });
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
  } catch (error: any) {
    console.error("Error creating hobby:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to create hobby.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const updateHobby: APIGatewayProxyHandler = async (event) => {
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

  await connectToDatabase();

  try {
    const hobbyToUpdate = await Hobby.findById(id);

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
  } catch (error: any) {
    console.error("Error updating hobby:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to update hobby.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};

export const removeHobby: APIGatewayProxyHandler = async (event) => {
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
    const hobbyId = event.pathParameters?.id;
    // Find hobby by ID and remove
    const hobby = await Hobby.findOneAndDelete({ _id: hobbyId });

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
  } catch (error: any) {
    console.error("Error deleting hobby:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Failed to delete hobby.",
        error: error.message,
      }),
    };
  } finally {
    await closeDatabaseConnection();
  }
};
