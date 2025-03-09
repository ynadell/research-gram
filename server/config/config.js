require('dotenv').config();

const config = {
  semanticScholar: {
    apiKey: process.env.SEMANTIC_SCHOLAR_API_KEY,
  },
  arxiv: {
    apiKey: process.env.ARXIV_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

module.exports = config; 