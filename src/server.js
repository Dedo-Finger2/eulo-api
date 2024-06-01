import { env } from "./utils/env.js";
import { app } from "./config/app.js";

app.listen(env.SERVER_PORT, () => {
  console.log(`🚀 Running on: http://localhost:${env.SERVER_PORT}`);
});
