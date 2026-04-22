const express = require("express");
const auth = require("../middlewares/authMiddleware");
const { updateAnalytics, getAnalytics } = require("../controllers/analyticsController");

const router = express.Router();
router.post("/update", auth, updateAnalytics);
router.get("/", auth, getAnalytics);

module.exports = router;
