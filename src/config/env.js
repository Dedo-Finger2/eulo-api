import "dotenv/config";
import { object, string, number } from "yup";

const envSchema = object({
  DB_PG_DATABASE: string().required(),
  DB_PG_USER: string().required(),
  DB_PG_PASSWORD: string().required(),
  DB_PG_HOST: string().required(),
  DB_PG_PORT: number().integer().positive().required(),
  SERVER_PORT: number().integer().positive().required(),
  JWT_TOKEN: string().required(),
});

export const env = await envSchema.validate(process.env);
