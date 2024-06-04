import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log("Authorizing a user");

  try {
    const token = event.authorizationToken.split(" ")[1]; // Extract JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      iat: number;
      exp: number;
    };

    console.log("User was authorized", decoded);

    // Generate the IAM policy for the user
    const policy = generatePolicy(decoded.userId, "Allow", event.methodArn);
    return policy;
  } catch (error) {
    console.error("User unauthorized", error);
    throw "Unauthorized"; // Return a 401 Unauthorized error
  }
};

const generatePolicy = (
  principalId: string,
  effect: string,
  resource: string
): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
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
