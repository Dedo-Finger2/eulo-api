import { Router } from "express";
import { ValidationError, object, string } from "yup";
import { env } from "../../utils/env.js";
import { queryDatabase } from "../../utils/query.js";
import jwt from "jsonwebtoken";

const { TokenExpiredError } = jwt;
const verifyUser = Router();

/**
 * @swagger
 * /api/v1/users/verify:
 *   get:
 *     summary: Verify user token
 *     description: Endpoint to verify user token and set a cookie with user ID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: token
 *         in: query
 *         description: Token to verify user
 *         required: true
 *         type: string
 *     responses:
 *       302:
 *         description: Redirect to home page
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Message with the home page URL
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *       401:
 *         description: Unauthorized
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *       404:
 *         description: Not Found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Error message
 */

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
