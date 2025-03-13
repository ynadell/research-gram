const express = require("express");
const {
  getArxivPapers,
  getArxivAbstract,
  fetchResearchPaperData,
} = require("../controllers/apiController");

const router = express.Router();

router.get("/arxiv", getArxivPapers);
router.get("/arxiv-abstract", getArxivAbstract);
router.get("/fetchResearchPaperData", fetchResearchPaperData);

module.exports = router;
