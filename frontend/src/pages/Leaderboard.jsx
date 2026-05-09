import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";

export default function Leaderboard() {
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("week"); // week, month, all-time

  useEffect(() => {
    if (!token) return;

    api(`/analytics/leaderboard?period=${period}`, "GET", null, token)
      .then(setLeaderboard)
      .catch(err => setError(err.message || "Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, [token, period]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy size={24} className="text-yellow-500" />;
      case 2:
        return <Medal size={24} className="text-gray-400" />;
      case 3:
        return <Medal size={24} className="text-amber-600" />;
      default:
        return <span className="font-bold text-lg">{rank}</span>;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compete and showcase your learning excellence
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
        </Card>
      )}

      {/* Period Filter */}
      <div className="flex gap-3 mb-8">
        {['week', 'month', 'all-time'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === p
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white hover:bg-gray-300'
            }`}
          >
            {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Second Place */}
          <Card className="order-2 md:order-1">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Medal size={48} className="text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">2nd Place</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {leaderboard[1]?.name}
              </h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {leaderboard[1]?.average_score || 0}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {leaderboard[1]?.test_count || 0} tests
                </p>
              </div>
            </div>
          </Card>

          {/* First Place */}
          <Card gradient gradientFrom="from-yellow-400" gradientTo="to-amber-600" className="order-1 md:order-2">
            <div className="text-center text-white">
              <div className="mb-4 flex justify-center">
                <Trophy size={56} className="text-yellow-200" />
              </div>
              <p className="text-yellow-100 text-sm font-medium mb-2">1st Place</p>
              <h3 className="text-2xl font-bold mb-3">
                {leaderboard[0]?.name}
              </h3>
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {leaderboard[0]?.average_score || 0}%
                </p>
                <p className="text-yellow-100 text-sm">
                  {leaderboard[0]?.test_count || 0} tests
                </p>
              </div>
            </div>
          </Card>

          {/* Third Place */}
          <Card className="order-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <Medal size={48} className="text-amber-600" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">3rd Place</p>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {leaderboard[2]?.name}
              </h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {leaderboard[2]?.average_score || 0}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {leaderboard[2]?.test_count || 0} tests
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Full Rankings
        </h3>

        <div className="space-y-3">
          {leaderboard.map((student, index) => (
            <div
              key={student.user_id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                {getMedalIcon(index + 1)}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {student.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {student.test_count} tests completed
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {student.average_score || 0}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    avg score
                  </p>
                </div>

                {index < 3 && (
                  <Star size={20} className="text-amber-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No leaderboard data available yet. Take some tests to appear here!
            </p>
          </div>
        )}
      </Card>
    </MainLayout>
  );
}
