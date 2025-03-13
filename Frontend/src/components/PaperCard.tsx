import React from "react";
import { FiShare2, FiThumbsUp, FiThumbsDown, FiBookmark } from "react-icons/fi";

interface PaperCardProps {
  title: string;
  authors: string[];
  abstract: string;
  summary: string[];
  keywords: string[];
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
  keywords,
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
      <div className="w-full h-full max-w-4xl mx-auto p-8 flex flex-col">
        {/* Header Section */}
        <div className="mb-6 text-center">
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

        {/* Content Section */}
        <div className="flex-grow overflow-y-auto px-4">
          {/* Keywords Section */}
          {/* <div className="mb-6 text-center">
            <h3 className="font-semibold text-gray-200 mb-3 text-xl">
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div> */}

          {/* Summary Section */}
          <div className="mb-6 text-center">
            <h3 className="font-semibold text-gray-200 mb-3 text-xl">
              Key Points
            </h3>
            <ul className="list-none pl-5 space-y-2 inline-block text-left">
              {summary.map((point, index) => (
                <li key={index} className="text-gray-300 text-sm leading-relaxed relative pl-4">
                  <span className="absolute left-0 top-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-auto pt-4 border-t border-gray-800">
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
