import { env } from "./utils/env.js";
import { app } from "./config/app.js";

import { registerUser } from "./routes/register-user.js";

app.use(registerUser);

app.listen(env.SERVER_PORT, () => {
  console.log(`🚀 Running on: http://localhost:${env.SERVER_PORT}`);
});
