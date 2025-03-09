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
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 hover:text-blue-600 cursor-pointer">
          {title}
        </h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {authors.map((author, index) => (
            <span
              key={index}
              className="text-sm text-gray-600 hover:text-blue-500 cursor-pointer"
            >
              {author}
              {index < authors.length - 1 ? "," : ""}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Published: {new Date(publishDate).toLocaleDateString()}
          <span className="mx-2">•</span>
          <a
            href={`https://arxiv.org/abs/${arxivId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            arXiv:{arxivId}
          </a>
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Key Points</h3>
        <ul className="list-disc list-inside space-y-1">
          {summary.map((point, index) => (
            <li key={index} className="text-gray-600">
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Abstract Preview */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Abstract</h3>
        <p className="text-gray-600 line-clamp-3">{abstract}</p>
        <button className="text-blue-500 hover:text-blue-700 text-sm mt-2">
          Read more
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={onLike}
            className="flex items-center space-x-1 text-gray-600 hover:text-green-500"
          >
            <FiThumbsUp className="w-5 h-5" />
            <span>{likes}</span>
          </button>
          <button
            onClick={onDislike}
            className="text-gray-600 hover:text-red-500"
          >
            <FiThumbsDown className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onSave}
            className="text-gray-600 hover:text-blue-500"
          >
            <FiBookmark className="w-5 h-5" />
          </button>
          <button
            onClick={onShare}
            className="text-gray-600 hover:text-purple-500"
          >
            <FiShare2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaperCard; 