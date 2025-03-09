import React from 'react';
import { FiShare2, FiThumbsUp, FiThumbsDown, FiBookmark } from 'react-icons/fi';

interface PaperCardProps {
  title: string;
  authors: string[];
  abstract: string;
  summary: string[];
  publishDate: string;
  arxivId: string;
  likes: number;
  onLike: () => void;
  onDislike: () => void;
  onShare: () => void;
  onSave: () => void;
}

const PaperCard: React.FC<PaperCardProps> = ({
  title,
  authors,
  abstract,
  summary,
  publishDate,
  arxivId,
  likes,
  onLike,
  onDislike,
  onShare,
  onSave,
}) => {
  return (
    <div className="h-screen snap-start flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full h-full max-w-4xl mx-auto p-8 flex flex-col items-center">
        {/* Header Section */}
        <div className="mb-8 text-center w-full">
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {authors.map((author, index) => (
              <span
                key={index}
                className="text-sm text-gray-300 hover:text-blue-400 cursor-pointer transition-colors"
              >
                {author}
                {index < authors.length - 1 ? "," : ""}
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-400">
            Published: {new Date(publishDate).toLocaleDateString()}
            <span className="mx-2">•</span>
            <a
              href={`https://arxiv.org/abs/${arxivId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              arXiv:{arxivId}
            </a>
          </div>
        </div>

        {/* Content Section - Scrollable if needed */}
        <div className="flex-grow overflow-y-auto w-full max-w-2xl mx-auto">
          {/* Summary Section */}
          <div className="mb-8 text-center">
            <h3 className="font-semibold text-gray-200 mb-4 text-xl">Key Points</h3>
            <ul className="space-y-3">
              {summary.map((point, index) => (
                <li key={index} className="text-gray-300">
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Abstract Section */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-200 mb-4 text-xl">Abstract</h3>
            <p className="text-gray-300 leading-relaxed">
              {abstract}
            </p>
          </div>
        </div>

        {/* Action Bar - Fixed at bottom */}
        <div className="mt-8 pt-4 border-t border-gray-700 w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-6">
              <button
                onClick={onLike}
                className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
              >
                <FiThumbsUp className="w-5 h-5" />
                <span>{likes}</span>
              </button>
              <button
                onClick={onDislike}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <FiThumbsDown className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={onSave}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                <FiBookmark className="w-5 h-5" />
              </button>
              <button
                onClick={onShare}
                className="text-gray-300 hover:text-purple-400 transition-colors"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperCard; 