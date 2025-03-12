const axios = require("axios");

// 🔹 Fetch Papers from Arxiv API
const getArxivPapers = async (req, res) => {
  try {
    const query = req.query.q || "machine learning";
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=10`,
    );

    res.json({ source: "arXiv", data: response.data });
  } catch (error) {
    res.status(500).json({ error: "Error fetching data from Arxiv" });
  }
};

// 🔹 Fetch Papers from Semantic Scholar API
const getSemanticScholarPapers = async (req, res) => {
  try {
    const query = req.query.q || "machine learning";
    const response = await axios.get(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${query}&limit=10`,
    );

    res.json({ source: "Semantic Scholar", data: response.data });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching data from Semantic Scholar" });
  }
};

module.exports = { getArxivPapers, getSemanticScholarPapers };
