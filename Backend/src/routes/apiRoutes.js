const express = require("express");
const {
  getArxivPapers,
  getSemanticScholarPapers,
} = require("../controllers/apiController");

const router = express.Router();

router.get("/arxiv", getArxivPapers);
router.get("/semantic-scholar", getSemanticScholarPapers);

module.exports = router;
