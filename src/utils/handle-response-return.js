import { ValidationError } from "yup";

export function handleHttpResponseErrors(error) {
  console.error(error);

  if (error instanceof ValidationError)
    return { statusCode: 400, message: error.message };

  return { statusCode: 500, message: "Internal Server Error" };
}
