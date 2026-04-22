const express = require("express");
const auth = require("../middlewares/authMiddleware");
const {
	runContentEngine,
	getContentHistory,
	exportContentCsv
} = require("../controllers/contentController");

const router = express.Router();
router.post("/run", auth, runContentEngine);
router.get("/history", auth, getContentHistory);
router.get("/export.csv", auth, exportContentCsv);

module.exports = router;
