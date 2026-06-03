import app from "./app";
import { envVars } from "./config/env";

const bootstrap = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      app.listen(envVars.PORT, () => {
        console.log(`Server is running on http://localhost:${envVars.PORT}`);
      });
    }
  } catch (error) {
    console.error("Server error:", error);
  }
};

bootstrap();

// export for Vercel / serverless
export default app;
