import { PORT } from "./config.ts";
import { createApp } from "./app.ts";

// call function from app.ts to create app
const app = createApp();

// Initialize tunnel and start server
async function startServer() {
  try {
    // start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
