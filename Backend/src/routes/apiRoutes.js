const express = require("express");
const {
  getArxivPapers,
  getSemanticScholarPapers,
  getArxivAbstract
} = require("../controllers/apiController");

const router = express.Router();

router.get("/arxiv", getArxivPapers);
router.get("/arxiv-abstract", getArxivAbstract);
router.get("/semantic-scholar", getSemanticScholarPapers);

module.exports = router;
