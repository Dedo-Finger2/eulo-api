import express from "express";
import cookieParser from "cookie-parser";

import { registerUser } from "../routes/register-user.js";
import { verifyUser } from "../routes/verify-user.js";
import { createBrand } from "../routes/create-brand.js";
import { updateBrand } from "../routes/update-brand.js";
import { deleteBrand } from "../routes/delete-brand.js";
import { createProductType } from "../routes/create-product-type.js";
import { updateProductType } from "../routes/update-product-type.js";
import { deleteProductType } from "../routes/delete-product-type.js";
import { createUnitType } from "../routes/create-unit-type.js";
import { updateUnitType } from "../routes/update-unit-type.js";
import { deleteUnitType } from "../routes/delete-unit-type.js";
import { createProduct } from "../routes/create-product.js";
import { getProduct } from "../routes/get-product.js";
import { getProducts } from "../routes/get-products.js";
import { getProductPriceLog } from "../routes/get-product-price-log.js";

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
app.use(deleteProductType);
app.use(createUnitType);
app.use(updateUnitType);
app.use(deleteUnitType);
app.use(createProduct);
app.use(getProduct);
app.use(getProducts);
app.use(getProductPriceLog);

export { app };
