import { Router } from "express";
import { ValidationError, object, string } from "yup";
import { queryDatabase } from "../utils/query.js";
import { randomUUID } from "node:crypto";
import { env } from "../utils/env.js";
import { MailtrapMailService } from "../services/mailtrap-mail.js";
import jwt from "jsonwebtoken";

const registerUser = Router();

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

    if (user.length === 0) {
      const uuid = randomUUID();

      user = await queryDatabase(
        `INSERT INTO users (public_id, name, email) VALUES ($1, $2, $3) RETURNING *`,
        [uuid, name, email],
      );
    }

    const token = jwt.sign({ userId: user[0].public_id }, env.JWT_TOKEN, {
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
