import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FiBook, FiSearch, FiBookmark, FiUser } from 'react-icons/fi';
import Home from './pages/Home';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        {/* <nav className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">Research-Gram</h1>
          </div>
          <div className="px-4">
            <NavItem icon={<FiBook />} text="Feed" active />
            <NavItem icon={<FiSearch />} text="Search" />
            <NavItem icon={<FiBookmark />} text="Saved" />
            <NavItem icon={<FiUser />} text="Profile" />
          </div>
        </nav> */}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>

        {/* Right Sidebar - Topics */}
        {/* <aside className="w-80 bg-white shadow-lg p-6 hidden lg:block">
          <h2 className="text-xl font-semibold mb-4">Popular Topics</h2>
          <div className="space-y-2">
            <TopicTag text="Machine Learning" count={1234} />
            <TopicTag text="Deep Learning" count={890} />
            <TopicTag text="Natural Language Processing" count={567} />
            <TopicTag text="Computer Vision" count={432} />
            <TopicTag text="Reinforcement Learning" count={321} />
          </div>
        </aside> */}
      </div>
    </Router>
  );
};

// Helper Components
const NavItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}> = ({ icon, text, active }) => (
  <div
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </div>
);

const TopicTag: React.FC<{ text: string; count: number }> = ({
  text,
  count,
}) => (
  <div className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
    <span className="text-gray-700">{text}</span>
    <span className="text-sm text-gray-500">{count}</span>
  </div>
);

export default App; 