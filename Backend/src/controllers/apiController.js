const axios = require("axios");
const xml2js = require("xml2js");
//TODO: For all APIs add a retry functionality because they are failing
//TODO: Get 10 DOIs from the arxiv API from the below function while taking key words as inputs

const getArxivPapers = async (req, res) => {
  const query = req.query.q || "machine learning";

  const maxRetries = 10;
  const delayMs = 1000;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(
        `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=10`,
      );

      const xmlData = response.data;

      // Parse the XML into JS objects
      const parsed = await xml2js.parseStringPromise(xmlData);

      // `parsed.feed.entry` is typically an array of entries
      const entries = (parsed?.feed?.entry || []).map((entry) => {
        // Extract the ID portion after "/abs/"
        const rawId = entry.id?.[0] || "";
        const arxivId = rawId.includes("/abs/")
          ? rawId.split("/abs/")[1]
          : rawId;

        // Authors can be multiple
        const authors = (entry.author || []).map(
          (authorObj) => authorObj.name?.[0],
        );

        return {
          arxivId,
          title: entry.title?.[0] || "",
          authors,
          abstract: entry.summary?.[0] || "",
          publishDate: entry.published?.[0] || "",
        };
      });

      // Return parsed array as JSON
      return res.json({ source: "arXiv", data: entries });
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      console.warn(
        `Attempt ${attempt} to fetch from arXiv failed: ${error.message}. Retrying...`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // If we're here, all attempts have failed
  return res.status(500).json({
    error: "Error fetching data from arXiv",
    details: lastError?.message,
  });
};
//TODO: Implement getArxivAbstract from DOI below to return Abstract when given DOI as input
const getArxivAbstract = async (req, res) => {
  // Get arxivId from req.query, or use a default as a fallback
  const arxivId = req.query.id || "1909.03550";
  const maxRetries = 10;
  const delayMs = 1000;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Make the request (note: no quotes around arxivId)
      const response = await axios.get(
        `http://export.arxiv.org/api/query?id_list=${arxivId}`,
      );

      // Parse the XML
      const parsed = await xml2js.parseStringPromise(response.data);

      // The response is typically in parsed.feed.entry[0]
      const entry = parsed?.feed?.entry?.[0];
      if (!entry) {
        // If there's no entry, it might be an invalid ID or something else
        return res.status(404).json({
          error: `No entry found for arXiv ID: ${arxivId}`,
        });
      }

      // Extract the abstract (summary) from the first entry
      const abstract = entry.summary?.[0] ?? "";
      console.log(abstract);
      // Return the abstract as JSON
      return res.json({
        arxivId,
        abstract,
      });
    } catch (error) {
      lastError = error;
      // If it's our last retry, break the loop and return an error
      if (attempt === maxRetries) {
        break;
      }
      console.warn(
        `Attempt ${attempt} to fetch from arXiv failed: ${error.message}. Retrying...`,
      );
      // Delay before the next attempt
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // If we reach here, it means we didn't succeed in any attempt
  return res.status(500).json({
    error: "Error fetching data from arXiv",
    details: lastError?.message,
  });
};

// 🔹 Fetch Papers from Semantic Scholar API
const getSemanticScholarPapers = async (doi) => {
  const maxRetries = 3; // Number of retry attempts
  const delayMs = 1000; // Delay between retries in milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const doi_id = doi || "10.1017/S0022226797006889";
      console.log(doi_id, " in semantic scholar papers");
      if (!doi_id) {
        return res.status(400).json({ error: "DOI is required" });
      }
      const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/DOI:${doi_id}?fields=title,authors,abstract,year,tldr,url`;
      const response = await axios.get(apiUrl);
      return {
        source: "Semantic Scholar",
        tldr: response.data.tldr,
        abstract: response.data.abstract,
        year: response.data.year,
        url: response.data.url,
        title: response.data.title,
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        console.error("Max retries reached. Error fetching data:", error);
        return res.status(500).json({
          error:
            "Error fetching data from Semantic Scholar after multiple retries.",
        });
      }
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

const getGeminiSummary = async (content) => {
  const maxRetries = 3; // Adjusted for testing, change as needed
  const delayMs = 100000;
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      const geminiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const requestBody = {
        contents: [
          {
            parts: [
              {
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
            ],
          },
        ],
      };
      console.log(`${geminiUrl}?key=${geminiApiKey}`);
      console.log("************/n**********/n********/n********/n");
      console.log("************/n**********/n********/n********/n");
      const response = await axios.post(
        `${geminiUrl}?key=${geminiApiKey}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (
        response.data &&
        response.data.candidates &&
        response.data.candidates.length > 0
      ) {
        return response.data;
      } else {
        console.error("Gemini API returned unexpected data:", response.data);
        throw new Error("Unexpected response from Gemini API");
      }
    } catch (error) {
      lastError = error;
      console.warn(
        `Attempt ${attempt} to fetch from Gemini failed: ${error.message}. Retrying...`,
      );
      if (attempt === maxRetries) {
        console.error(
          "Max retries reached. Error fetching summary from Gemini:",
          error,
        );
        return {
          summary: "Error generating summary.",
          bullet_points: [],
          keywords: [],
        };
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};
const parseGeminiOutput = (geminiText) => {
  const summaryRegex =
    /Summary:\s*([\s\S]*?)(?=\nBullet Points:|\nKeywords:|$)/i;
  const bulletPointsRegex = /Bullet Points:\s*([\s\S]*?)(?=\nKeywords:|$)/i;
  const keywordsRegex = /Keywords:\s*([\s\S]*)/i;

  const summaryMatch = geminiText.match(summaryRegex);
  const bulletPointsMatch = geminiText.match(bulletPointsRegex);
  const keywordsMatch = geminiText.match(keywordsRegex);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : "No summary found.",
    bullet_points: bulletPointsMatch
      ? bulletPointsMatch[1]
          .trim()
          .split("\n")
          .map((bp) => bp.replace(/^\*\s+/, "").trim())
          .filter((bp) => bp.length > 0)
      : [],
    keywords: keywordsMatch
      ? keywordsMatch[1]
          .trim()
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw.length > 0)
      : [],
  };
};
const fetchResearchPaperData = async (req, res) => {
  try {
    const doi = req.query.id; // DOI
    console.log("doi is " + doi);

    const response = await Promise.all([
      // getArxivAbstract(doi),
      getSemanticScholarPapers(doi),
    ]);
    // console.log(response);
    const abstract = response[0].abstract;
    const tldr = response[0].tldr;
    const content = { abstract, tldr };
    const geminiResponse = await getGeminiSummary(content);
    // console.log(geminiResponse);
    console.log(geminiResponse.candidates[0].content.parts[0].text);
    const parsedOutput = parseGeminiOutput(
      geminiResponse.candidates[0].content.parts[0].text,
    );
    console.log(parsedOutput);
    res.json({
      source: "arXiv & Semantic Scholar",
      abstract,
      tldr,
      summary: parsedOutput.summary || "No summary available",
      bullet_points: parsedOutput.bullet_points || [],
      keywords: parsedOutput.keywords || [],
    });
  } catch (error) {
    console.error("Error fetching research paper data:", error.message);
    res.status(500).json({ error: "Error processing research paper data." });
  }
};

module.exports = {
  getArxivPapers,
  getArxivAbstract,
  getSemanticScholarPapers,
  fetchResearchPaperData,
  getGeminiSummary,
};
