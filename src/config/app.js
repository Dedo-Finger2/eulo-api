import express from "express";
import cookieParser from "cookie-parser";

import { registerUser } from "../routes/register-user.js";
import { verifyUser } from "../routes/verify-user.js";
import { createBrand } from "../routes/create-brand.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(registerUser);
app.use(verifyUser);
app.use(createBrand);

export { app };
