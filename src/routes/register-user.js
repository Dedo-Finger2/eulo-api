import { Router } from "express";
import { ValidationError, object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { env } from "../utils/env.js";
import { MailtrapMailService } from "../services/mailtrap-mail.js";
import jwt from "jsonwebtoken";

const registerUser = Router();

/**
 * @swagger
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - name
 *        - email
 *      properties:
 *        public_id:
 *          type: string
 *          description: The Id used in public networks (uuid).
 *        id:
 *          type: number
 *          description: The Id used for pagination and sorting.
 *        name:
 *          type: string
 *          description: The name of the user.
 *        email:
 *          type: string
 *          description: The user's email.
 *        created_at:
 *          type: string
 *          format: date-time
 *          description: The date the user was created.
 *        updated_at:
 *          type: string
 *          format: date-time
 *          description: The date the user's data was updated.
 *      example:
 *        public_id: b6accf0c-f8d4-41e5-a684-0479a9d8d2a9
 *        id: 1
 *        name: Greg
 *        email: greg@gmail.com
 *        created_at: 2024-06-05T20:18:23.119Z
 *        updated_at: "null"
 */

/**
 * @swagger
 * /api/v1/users/register:
 *  post:
 *    summary: Register a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                minLength: 3
 *              email:
 *                type: string
 *                format: email
 *    responses:
 *      200:
 *        description: A message informing the user to check their email inbox.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 */

registerUser.post("/api/v1/users/register", async (request, response) => {
  const requestBodySchema = object({
    name: string().required().min(3),
    email: string().email().required(),
  });

  try {
    const { name, email } = await requestBodySchema.validate(request.body);

    let user = await queryDatabase(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    user = user[0];

    if (!user) {
      const uuid = randomUUID();

      user = await queryDatabase(
        `INSERT INTO users (public_id, name, email) VALUES ($1, $2, $3) RETURNING *`,
        [uuid, name, email],
      );
    }

    const token = jwt.sign({ userId: user.public_id }, env.JWT_TOKEN, {
      expiresIn: "5m",
    });

    const mailService = new MailtrapMailService();

    await mailService.sendMail({
      to: {
        name,
        address: email,
      },
      from: {
        name: "EULO COMPANY",
        address: "eulocompany@email.com",
      },
      subject: "System access link.",
      html: `<a href='http://localhost:${env.SERVER_PORT}/api/v1/users/verify?token=${token}'>Access the website.</a>`,
    });

    return response.status(200).send({ message: "Check your email inbox." });
  } catch (error) {
    if (error instanceof ValidationError)
      return response.status(400).send({ message: error.message });

    console.log(error);
    return response.status(500).send({ message: "Internal server error." });
  }
});

export { registerUser };
