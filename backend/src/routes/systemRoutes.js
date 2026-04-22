const express = require("express");
const { getStatus } = require("../controllers/systemController");

const router = express.Router();
router.get("/status", getStatus);

module.exports = router;
