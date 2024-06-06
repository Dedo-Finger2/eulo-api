import { ValidationError, object, string } from "yup";

export async function verifyAuthCookie(request, response, next) {
  const cookiesSchema = object({
    userId: string().uuid().required(),
  });

  try {
    const { userId } = await cookiesSchema.validate(request.cookies);

    if (!userId)
      return response.status(401).send({ message: "Not authenticated." });

    next();
  } catch (error) {
    if (error instanceof ValidationError)
      return response.status(401).send({ message: "Not authenticated." });
  }
}
