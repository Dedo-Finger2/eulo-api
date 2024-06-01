import { Router } from "express";
import { ValidationError, object, string } from "yup";
import { env } from "../utils/env.js";
import { queryDatabase } from "../utils/query.js";
import jwt from "jsonwebtoken";

const { TokenExpiredError } = jwt;
const verifyUser = Router();

verifyUser.get("/api/v1/users/verify", async (request, response) => {
  const requestQuerySchema = object({
    token: string().required(),
  });

  try {
    const { token } = await requestQuerySchema.validate(request.query);

    const decodedToken = jwt.verify(token, env.JWT_TOKEN);

    const user = await queryDatabase(
      "SELECT * FROM users WHERE public_id = $1",
      [decodedToken.userId],
    );

    if (user.length === 0 || !user)
      return response.status(404).send({ message: "User not found." });

    const cookieExpireAt = 1000 * 60 * 60 * 24 * 7; // 7 days

    response.cookie("userId", user[0].public_id, { maxAge: cookieExpireAt });

    return response
      .status(302)
      .send({ message: `http://localhost:${env.SERVER_PORT}/api/v1/` });
  } catch (error) {
    console.error(error);

    if (error instanceof ValidationError && !error.message.includes("token"))
      return response.status(400).send({ message: error.message });

    if (error.message.includes("token") || error instanceof TokenExpiredError)
      return response.status(401).send({ message: "Not authorized." });

    return response.status(500).send({ message: "Internal Server Error." });
  }
});

export { verifyUser };
