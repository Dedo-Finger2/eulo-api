import "dotenv/config";
import { app } from "./config/app.js";

app.listen(process.env.SERVER_PORT, () => {
  console.log(`🚀 Running on: http://localhost:${process.env.SERVER_PORT}`);
});
