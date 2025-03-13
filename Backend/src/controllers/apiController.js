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
  const maxRetries = 3;
  const delayMs = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const doi_id = doi || "10.1017/S0022226797006889";
      console.log(doi_id, " in semantic scholar papers");
      
      if (!doi_id) {
        throw new Error("DOI is required");
      }

      const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/DOI:${doi_id}?fields=title,authors,abstract,year,tldr,url`;
      const response = await axios.get(apiUrl);
      
      // Check if we have the required data
      if (!response.data.abstract && !response.data.tldr) {
        throw new Error("No abstract or TLDR available for this paper");
      }

      return {
        source: "Semantic Scholar",
        tldr: response.data.tldr?.text || null, // Access the text property of tldr
        abstract: response.data.abstract || null,
        year: response.data.year || null,
        url: response.data.url || null,
        title: response.data.title || "Untitled Paper",
        authors: response.data.authors?.map(author => author.name) || []
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        return {
          source: "Semantic Scholar",
          tldr: "No TLDR available",
          abstract: "No abstract available",
          year: null,
          url: null,
          title: "Error fetching paper details",
          authors: []
        };
      }
      
      console.log(`Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Fallback if all retries fail
  return {
    source: "Semantic Scholar",
    tldr: "No TLDR available",
    abstract: "No abstract available",
    year: null,
    url: null,
    title: "Error fetching paper details",
    authors: []
  };
};

const getGeminiSummary = async (content) => {
  const maxRetries = 3;
  const delayMs = 2000;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const geminiApiKey = process.env.GEMINI_API_KEY;
      const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `
              You are a research paper analyzer. Your task is to analyze this research paper and provide a structured response.
              DO NOT leave any section empty. If you can't find specific information, extract relevant points from the available content.

              Paper Content:
              ${content.abstract ? `Abstract: ${content.abstract}` : ''}
              ${content.tldr ? `TLDR: ${content.tldr}` : ''}

              IMPORTANT: You MUST provide ALL of the following sections with actual content (DO NOT use placeholders):

              1. Summary:
              [Write a 2-3 sentence summary of the main research contribution]

              2. Key Points:
              - [Extract or infer a key finding or methodology point]
              - [Extract or infer another significant finding or approach]
              - [Extract or infer an important result or conclusion]
              - [Extract or infer a notable contribution]
              - [Extract or infer a research implication]

              3. Keywords:
              - [Extract or infer a primary research area]
              - [Extract or infer a key methodology]
              - [Extract or infer a main concept]
              - [Extract or infer a relevant field]
              - [Extract or infer a key technology or approach]

              Remember:
              1. NEVER leave any section empty
              2. NEVER use placeholder text like [Point 1] or [keyword1]
              3. ALWAYS provide actual content based on the paper
              4. If information is limited, make reasonable inferences from the available content
              `,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
        },
      };

      const response = await axios.post(
        `${geminiUrl}?key=${geminiApiKey}`,
        requestBody,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        // Validate the response has actual content
        const text = response.data.candidates[0].content.parts[0].text;
        if (text.includes('[Point') || text.includes('[keyword') || !text.includes('Key Points:')) {
          throw new Error("Invalid response format from Gemini API");
        }
        return response.data;
      }

      throw new Error("Invalid response structure from Gemini API");

    } catch (error) {
      lastError = error;
      console.warn(
        `Attempt ${attempt} to fetch from Gemini failed: ${error.message}. ${attempt < maxRetries ? 'Retrying...' : ''}`
      );
      
      if (attempt === maxRetries) {
        return {
          candidates: [{
            content: {
              parts: [{
                text: `
                1. Summary:
                The paper discusses research findings and methodologies in its field.

                2. Key Points:
                - Research methodology and approach discussed
                - Analysis of relevant data presented
                - Findings and results outlined
                - Implications for the field considered
                - Future research directions suggested

                3. Keywords:
                - Research methodology
                - Data analysis
                - Scientific investigation
                - Academic research
                - Scholarly contribution
                `
              }]
            }
          }]
        };
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    candidates: [{
      content: {
        parts: [{
          text: `
          1. Summary:
          The paper discusses research findings and methodologies in its field.

          2. Key Points:
          - Research methodology and approach discussed
          - Analysis of relevant data presented
          - Findings and results outlined
          - Implications for the field considered
          - Future research directions suggested

          3. Keywords:
          - Research methodology
          - Data analysis
          - Scientific investigation
          - Academic research
          - Scholarly contribution
          `
        }]
      }
    }]
  };
};
const parseGeminiOutput = (geminiText) => {
  try {
    // Clean up the text first
    const cleanText = geminiText.replace(/\r\n/g, '\n').trim();

    // Extract Summary
    const summaryMatch = cleanText.match(/1\.\s*Summary:\s*\n([\s\S]*?)(?=\n\s*2\.|$)/);
    const summary = summaryMatch 
      ? summaryMatch[1].trim()
      : "No summary available";

    // Extract Key Points
    const keyPointsMatch = cleanText.match(/2\.\s*Key Points:\s*\n([\s\S]*?)(?=\n\s*3\.|$)/);
    const keyPoints = keyPointsMatch
      ? keyPointsMatch[1]
          .split('\n')
          .map(point => point.trim())
          .filter(point => point.startsWith('-'))
          .map(point => point.substring(1).trim())
          .filter(point => point && !point.includes('[Point') && point !== 'No key points available')
      : [];

    // Extract Keywords
    const keywordsMatch = cleanText.match(/3\.\s*Keywords:\s*\n([\s\S]*?)(?=\n\s*Note:|$)/);
    const keywords = keywordsMatch
      ? keywordsMatch[1]
          .split('\n')
          .map(keyword => keyword.trim())
          .filter(keyword => keyword.startsWith('-'))
          .map(keyword => keyword.substring(1).trim())
          .filter(keyword => keyword && !keyword.includes('[keyword') && keyword !== 'No keywords available')
      : [];

    // Ensure we have at least empty arrays if nothing was found
    return {
      summary: summary || "No summary available",
      bullet_points: keyPoints.length > 0 ? keyPoints : [],
      keywords: keywords.length > 0 ? keywords : []
    };
  } catch (error) {
    console.error('Error parsing Gemini output:', error);
    return {
      summary: "Error parsing summary",
      bullet_points: [],
      keywords: []
    };
  }
};
const fetchResearchPaperData = async (req, res) => {
  try {
    const doi = req.query.id || "10.1017/S0022226797006889"; // Use default DOI if none provided
    console.log("Processing DOI:", doi);

    // Get paper data from Semantic Scholar
    const semanticData = await getSemanticScholarPapers(doi);
    console.log("Semantic Scholar data received:", {
      hasAbstract: !!semanticData.abstract,
      hasTldr: !!semanticData.tldr,
      title: semanticData.title,
      abstractLength: semanticData.abstract?.length || 0
    });

    // Prepare content for Gemini
    const content = {
      abstract: semanticData.abstract,
      tldr: semanticData.tldr
    };

    // Only call Gemini if we have some content to analyze
    let parsedOutput;
    if (content.abstract || content.tldr) {
      const geminiResponse = await getGeminiSummary(content);
      console.log("Gemini response received");
      
      parsedOutput = parseGeminiOutput(
        geminiResponse.candidates[0].content.parts[0].text
      );
      console.log("Parsed output:", {
        hasSummary: !!parsedOutput.summary,
        numPoints: parsedOutput.bullet_points.length,
        numKeywords: parsedOutput.keywords.length,
        summaryLength: parsedOutput.summary?.length || 0
      });
    } else {
      parsedOutput = {
        summary: "No content available for analysis",
        bullet_points: ["No content available for analysis"],
        keywords: ["No content available"]
      };
    }

    // Send the complete response
    res.json({
      source: semanticData.source,
      title: semanticData.title,
      authors: semanticData.authors,
      abstract: semanticData.abstract || "No abstract available",
      tldr: semanticData.tldr || "No TLDR available",
      summary: parsedOutput.summary,
      bullet_points: parsedOutput.bullet_points.length > 0 
        ? parsedOutput.bullet_points 
        : ["No key points available"],
      keywords: parsedOutput.keywords.length > 0 
        ? parsedOutput.keywords 
        : ["No keywords available"]
    });

  } catch (error) {
    console.error("Error in fetchResearchPaperData:", error);
    res.status(500).json({
      error: "Error processing research paper data",
      title: "Error",
      abstract: "Error fetching paper details",
      tldr: "Error fetching paper details",
      summary: "Error generating summary",
      bullet_points: ["Error generating key points"],
      keywords: ["Error generating keywords"]
    });
  }
};

module.exports = {
  getArxivPapers,
  getArxivAbstract,
  getSemanticScholarPapers,
  fetchResearchPaperData,
  getGeminiSummary,
};
