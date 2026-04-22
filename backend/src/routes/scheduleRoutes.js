const express = require("express");
const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { scheduleSchema } = require("../validators/scheduleValidator");
const { upsertSchedule, getSchedule } = require("../controllers/scheduleController");

const router = express.Router();
router.post("/", auth, validate(scheduleSchema), upsertSchedule);
router.get("/", auth, getSchedule);

module.exports = router;
