import express from "express";
import cookieParser from "cookie-parser";

import { registerUser } from "../routes/register-user.js";
import { verifyUser } from "../routes/verify-user.js";
import { createBrand } from "../routes/create-brand.js";
import { updateBrand } from "../routes/update-brand.js";
import { deleteBrand } from "../routes/delete-brand.js";
import { createProductType } from "../routes/create-product-type.js";
import { updateProductType } from "../routes/update-product-type.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(registerUser);
app.use(verifyUser);
app.use(createBrand);
app.use(updateBrand);
app.use(deleteBrand);
app.use(createProductType);
app.use(updateProductType);

export { app };
