import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  RefreshCw,
  LayoutDashboard,
  Moon,
  Sun,
  X,
  Sparkles,
  FileText,
  ExternalLink,
  Maximize2
} from 'lucide-react';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null); // For the Modal

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/api/articles');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not connect to Backend. Is Docker running?");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchArticles();
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>

      {/* --- DYNAMIC BACKGROUND (Aurora Effect) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob ${darkMode ? 'opacity-10' : ''}`}></div>
        <div className={`absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${darkMode ? 'opacity-10' : ''}`}></div>
        <div className={`absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${darkMode ? 'opacity-10' : ''}`}></div>
      </div>

      <div className="relative z-10 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-500">

        {/* --- HEADER --- */}
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <LayoutDashboard size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                BeyondChats <span className={`font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Intelligence Hub</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={fetchArticles}
                disabled={loading}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all active:scale-95 ${darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-indigo-500 hover:text-indigo-400'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
              >
                <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // SKELETONS
              Array(3).fill(0).map((_, i) => (
                <div key={i} className={`rounded-2xl p-6 border h-96 animate-pulse flex flex-col gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className={`h-4 rounded w-1/4 mb-2 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                  <div className={`h-8 rounded w-3/4 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                  <div className="space-y-2 flex-grow mt-4">
                    <div className={`h-3 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                    <div className={`h-3 rounded w-5/6 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                  </div>
                </div>
              ))
            ) : (
              // CARDS
              articles.map(article => (
                <article
                  key={article.id}
                  className={`relative group rounded-2xl border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden ${darkMode
                    ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50 shadow-black/50'
                    : 'bg-white border-slate-200 hover:border-indigo-200 shadow-slate-200/50'
                    }`}
                >
                  {/* Status Bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${article.status === 'updated' ? 'bg-emerald-500' : 'bg-slate-300'}`} />

                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${article.status === 'updated'
                        ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')
                        : (darkMode ? 'bg-slate-700 text-slate-400 border border-slate-600' : 'bg-slate-100 text-slate-600 border border-slate-200')
                        }`}>
                        {article.status === 'updated' ? <><Sparkles size={12} /> AI Enhanced</> : <><FileText size={12} /> Original</>}
                      </span>
                      <span className="text-slate-400 text-xs font-mono opacity-50">#{article.id}</span>
                    </div>

                    <h2 className={`text-lg font-bold leading-snug mb-2 line-clamp-2 ${darkMode ? 'text-slate-100 group-hover:text-indigo-400' : 'text-slate-800 group-hover:text-indigo-600'} transition-colors`}>
                      {article.title}
                    </h2>
                  </div>

                  <div className="px-6 pb-6 flex-grow relative">
                    {/* Content Preview */}
                    <div className={`prose prose-sm max-w-none line-clamp-4 ${darkMode ? 'prose-invert text-slate-400' : 'text-slate-500'}`}>
                      <ReactMarkdown>{article.content}</ReactMarkdown>
                    </div>

                    {/* Read More Button (Solves the "..." issue) */}
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className={`mt-4 flex items-center gap-1 text-sm font-semibold transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                    >
                      <Maximize2 size={14} /> Read Full Article
                    </button>
                  </div>

                  <div className={`p-4 border-t flex justify-between items-center mt-auto ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="text-xs text-slate-500 font-medium">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </div>
                    <a
                      href={article.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                        }`}
                    >
                      Source <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              ))
            )}
          </div>
        </main>

        {/* --- ARTICLE MODAL (The Fix for Truncation) --- */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedArticle(null)}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}>

              {/* Modal Header */}
              <div className={`p-6 border-b flex justify-between items-start ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div>
                  <h3 className="text-2xl font-bold leading-tight pr-8">{selectedArticle.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {selectedArticle.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className={`prose max-w-none ${darkMode ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white' : 'prose-slate'}`}>
                  <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t flex justify-end ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <a
                  href={selectedArticle.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Visit Original Website <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;