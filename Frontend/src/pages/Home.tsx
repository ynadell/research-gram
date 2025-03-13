import React, { useState, useEffect, useRef, useCallback } from "react";
import PaperCard from "../components/PaperCard";
import { FiLoader } from "react-icons/fi";

interface Paper {
  title: string;
  authors: string[];
  abstract: string;
  summary: string[];
  publishDate: string;
  arxivId: string;
  likes: number;
}

const ITEMS_PER_PAGE = 1;
const MAX_PAPERS = 100;
const API_ENDPOINT = "http://localhost:5001/api/fetchResearchPaperData";

const Home: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchPaperData = async () => {
    try {
      const response = await fetch(`${API_ENDPOINT}`);
      const data = await response.json();
      return {
        title: `Research Paper`,
        authors: ["Author 1", "Author 2"],
        abstract: data.abstract || "No abstract available",
        summary: data.bullet_points || "No summary available",
        publishDate: new Date().toISOString(),
        arxivId: `2023`,
        likes: Math.floor(Math.random() * 1000),
      };
    } catch (error) {
      console.error("Error fetching paper:", error);
      return null;
    }
  };
  // const generatePaper = (index: number): Paper => ({
  //   title: `Research Paper ${index}`,
  //   authors: ["Author 1", "Author 2"],
  //   abstract:
  //     "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...",
  //   summary: [
  //     "Key finding point 1 for paper " + index,
  //     "Key finding point 2 for paper " + index,
  //     "Key finding point 3 for paper " + index,
  //     "Key finding point 4 for paper " + index,
  //   ],
  //   publishDate: new Date().toISOString(),
  //   arxivId: `2023.${index}`,
  //   likes: Math.floor(Math.random() * 1000),
  // });

  const loadMorePapers = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const newPaper = await fetchPaperData();
    if (newPaper) {
      setPapers((prev) => [...prev, newPaper]);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [papers.length, hasMore, isLoading]);

  const lastPaperElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (!node || isLoading || !hasMore) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMorePapers();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        },
      );

      observer.current.observe(node);
    },
    [loadMorePapers, isLoading, hasMore],
  );

  useEffect(() => {
    // Load initial papers
    loadMorePapers();
  }, []); // Empty dependency array for initial load only

  const handleLike = () => {
    console.log("Liked paper");
  };

  const handleDislike = () => {
    console.log("Disliked paper");
  };

  const handleShare = () => {
    console.log("Shared paper");
  };

  const handleSave = () => {
    console.log("Saved paper");
  };

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll bg-gray-900">
      {papers.map((paper, index) => (
        <div
          key={index}
          ref={index === papers.length - 1 ? lastPaperElementRef : undefined}
          className="snap-start h-screen"
        >
          <PaperCard
            {...paper}
            onLike={handleLike}
            onDislike={handleDislike}
            onShare={handleShare}
            onSave={handleSave}
          />
        </div>
      ))}

      {isLoading && (
        <div className="snap-start h-screen flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-3 text-white">
            <FiLoader className="animate-spin text-blue-400 text-3xl" />
            <span className="text-gray-300">Loading more papers...</span>
          </div>
        </div>
      )}

      {!hasMore && !isLoading && (
        <div className="snap-start h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center p-8 bg-gray-800 rounded-xl shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-white">
              That's all for now! 🎉
            </h2>
            <p className="text-gray-300">
              You've reached the end of available papers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
