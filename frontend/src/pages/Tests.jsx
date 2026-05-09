import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { Link } from "react-router-dom";
import { Search, Filter, BookOpen, Clock, BarChart3, ChevronRight } from "lucide-react";

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    
    api("/tests", "GET", null, token)
      .then(setTests)
      .catch(err => setError(err.message || "Failed to load tests"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    let filtered = tests;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficulty !== "all") {
      filtered = filtered.filter(t => t.difficulty === difficulty);
    }

    setFilteredTests(filtered);
  }, [searchQuery, difficulty, tests]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tests...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📚 Available Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Challenge yourself with our carefully curated test suite
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {searchQuery || difficulty !== "all"
              ? "No tests found matching your criteria"
              : "No tests available yet. Check back soon!"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map(t => (
            <Link key={t.id} to={`/tests/${t.id}`} className="group">
              <Card hover className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <BookOpen size={20} className="text-primary-600 dark:text-primary-300" />
                  </div>
                  {t.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      t.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : t.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                  {t.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                  {t.description}
                </p>

                {/* Test Stats */}
                <div className="flex gap-4 mb-4 pt-4 border-t border-gray-200 dark:border-dark-700">
                  {t.total_marks && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <BarChart3 size={16} />
                      <span>{t.total_marks} marks</span>
                    </div>
                  )}
                  {t.question_count && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen size={16} />
                      <span>{t.question_count} questions</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="flex items-center justify-between text-primary-600 dark:text-primary-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Take Test</span>
                  <ChevronRight size={20} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
