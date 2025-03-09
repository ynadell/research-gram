import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PaperCard from '../components/PaperCard';
import { FiLoader } from 'react-icons/fi';

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
const MAX_PAPERS = 10; // Reduced for testing

const Home: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Sample data generator - Replace with actual API call
  const generatePaper = (index: number): Paper => ({
    title: `Research Paper ${index}`,
    authors: ["Author 1", "Author 2"],
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...",
    summary: [
      "Key finding point 1 for paper " + index,
      "Key finding point 2 for paper " + index,
      "Key finding point 3 for paper " + index,
      "Key finding point 4 for paper " + index
    ],
    publishDate: new Date().toISOString(),
    arxivId: `2023.${index}`,
    likes: Math.floor(Math.random() * 1000)
  });

  // Initial load
  useEffect(() => {
    console.log('Initializing papers...'); // Debug log
    const initialPapers = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => 
      generatePaper(i + 1)
    );
    setPapers(initialPapers);
  }, []);

  // Load more papers
  const fetchMoreData = () => {
    console.log('Fetching more papers...'); // Debug log
    
    if (papers.length >= MAX_PAPERS) {
      console.log('No more papers to load'); // Debug log
      setHasMore(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      const newPapers = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => 
        generatePaper(papers.length + i + 1)
      );
      
      console.log('Adding new papers:', newPapers); // Debug log
      setPapers(prevPapers => [...prevPapers, ...newPapers]);
      setPage(prevPage => prevPage + 1);
    }, 1500);
  };

  const handleLike = () => {
    console.log('Liked paper');
  };

  const handleDislike = () => {
    console.log('Disliked paper');
  };

  const handleShare = () => {
    console.log('Shared paper');
  };

  const handleSave = () => {
    console.log('Saved paper');
  };

  return (
    <div 
      id="scrollableDiv"
      style={{ height: 'calc(100vh - 64px)', overflow: 'auto' }}
      className="bg-gray-50"
    >
      <InfiniteScroll
        dataLength={papers.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <div className="flex items-center justify-center p-4">
            <FiLoader className="animate-spin text-blue-600 text-2xl" />
            <span className="ml-2 text-gray-600">Loading more papers...</span>
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 my-4 p-4 bg-white rounded-lg shadow">
            You have seen all papers! 🎉
          </p>
        }
        scrollableTarget="scrollableDiv"
        scrollThreshold={0.7}
      >
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Research Paper Summaries
          </h1>
          
          {papers.map((paper, index) => (
            <div key={`${paper.arxivId}-${index}`} className="mb-6">
              <PaperCard
                {...paper}
                onLike={handleLike}
                onDislike={handleDislike}
                onShare={handleShare}
                onSave={handleSave}
              />
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Home;