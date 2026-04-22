const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const systemRoutes = require("./routes/systemRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", systemRoutes);

app.use(errorMiddleware);

module.exports = app;
