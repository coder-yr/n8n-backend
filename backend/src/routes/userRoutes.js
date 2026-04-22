const express = require("express");
const { updateSettings } = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.put("/settings", auth, updateSettings);

module.exports = router;
