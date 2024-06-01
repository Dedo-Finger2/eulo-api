import express from "express";

import { registerUser } from "../routes/register-user.js";

const app = express();

app.use(express.json());

app.use(registerUser);

export { app };
