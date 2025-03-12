const axios = require("axios");
//TODO: For all APIs add a retry functionality because they are failing
//TODO: Get 10 DOIs from the arxiv API from the below function while taking key words as inputs
const getArxivPapers = async (req, res) => {
  try {
    const query = req.query.q || "machine learning"; // if q is not given then we show machine learning papers
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=10`,
    );

    res.json({ source: "arXiv", data: response.data });
  } catch (error) {
    res.status(500).json({ error: "Error fetching data from Arxiv" });
  }
};
//TODO: Implement getArxivAbstract from DOI below to return Abstract when given DOI as input

// 🔹 Fetch Papers from Semantic Scholar API
const getSemanticScholarPapers = async (req, res) => {
  try {
    const doi = req.query.id; // Get DOI from query params
    if (!doi) {
      return res.status(400).json({ error: "DOI is required" });
    }
    const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/DOI:${doi}?fields=title,authors,abstract,year,tldr,url`;
    const response = await axios.get(apiUrl);
    res.json({ source: "Semantic Scholar", data: response.data });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching data from Semantic Scholar" });
  }
};

const getGeminiSummary = async (content) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText";

    const requestBody = {
      prompt: {
        text: `
          Here is the information from two sources about a research paper:\n
          - **Abstract:** ${content.abstract}\n
          - **TLDR Summary:** ${content.tldr}\n\n

          **Tasks:**
          1. Generate a concise summary of the paper.
          2. List key bullet points highlighting important findings or contributions.
          3. Identify the most relevant keywords.

          **Output format:**
          - Summary: ...
          - Bullet Points: ...
          - Keywords: ...
        `,
      },
    };

    const response = await axios.post(
      `${geminiUrl}?key=${geminiApiKey}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching summary from Gemini:", error.message);
    return {
      summary: "Error generating summary.",
      bullet_points: [],
      keywords: [],
    };
  }
};

const fetchResearchPaperData = async (req, res) => {
  try {
    const doi = req.query.id; // DOI

    const [abstract, tldr] = await Promise.all([
      getArxivAbstract(doi),
      getSemanticScholarPapers(doi),
    ]);

    const content = { abstract, tldr };
    const geminiResponse = await getGeminiSummary(content);

    res.json({
      source: "arXiv & Semantic Scholar",
      abstract,
      tldr,
      summary: geminiResponse.summary || "No summary available",
      bullet_points: geminiResponse.bullet_points || [],
      keywords: geminiResponse.keywords || [],
    });
  } catch (error) {
    console.error("Error fetching research paper data:", error.message);
    res.status(500).json({ error: "Error processing research paper data." });
  }
};

module.exports = {
  getArxivPapers,
  getSemanticScholarPapers,
  fetchResearchPaperData,
  getGeminiSummary,
};
