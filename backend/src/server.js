require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { startScheduler } = require("./services/schedulerService");

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  if (process.env.USE_SYNC_PIPELINE !== "true") {
    startScheduler();
  }
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
