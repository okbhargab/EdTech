import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { useTheme } from "../ThemeContext.jsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, Trophy, Target, Zap, BookOpen, Brain } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const { token, loading: authLoading, user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState("");

  const chartColors = {
    grid: theme === 'dark' ? '#374151' : '#e5e7eb',
    text: theme === 'dark' ? '#9ca3af' : '#6b7280',
    tooltip: {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
      border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
      color: theme === 'dark' ? '#f3f4f6' : '#000'
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      navigate("/");
      return;
    }

    Promise.all([
      api("/analytics/summary", "GET", null, token),
      api("/analytics/trends", "GET", null, token)
    ])
      .then(([analyticsData, trendsData]) => {
        setAnalytics(analyticsData);
        setTrends(trendsData);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analytics");
      });
  }, [token, authLoading, navigate]);

  if (authLoading || !analytics || !trends) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name || 'Learner'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your progress and keep learning
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/tests">
          <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-lg flex items-center justify-center gap-2">
            <BookOpen size={20} />
            Start a Test
          </button>
        </Link>
        <Link to="/ai-tutor">
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2">
            <Brain size={20} />
            Ask AI Tutor
          </button>
        </Link>
        <Link to="/profile">
          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2">
            <Zap size={20} />
            View Streak
          </button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card gradient gradientFrom="from-blue-500" gradientTo="to-blue-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tests Taken</p>
              <h3 className="text-3xl font-bold mt-2">{analytics.totalTestsTaken || 0}</h3>
            </div>
            <TrendingUp size={32} className="opacity-70" />
          </div>
        </Card>

        <Card gradient gradientFrom="from-green-500" gradientTo="to-emerald-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Average Score</p>
              <h3 className="text-3xl font-bold mt-2">{Math.round(analytics.averageScore || 0)}%</h3>
            </div>
            <Target size={32} className="opacity-70" />
          </div>
        </Card>

        <Card gradient gradientFrom="from-amber-500" gradientTo="to-orange-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Best Score</p>
              <h3 className="text-3xl font-bold mt-2">{Math.round(analytics.bestScore || 0)}%</h3>
            </div>
            <Trophy size={32} className="opacity-70" />
          </div>
        </Card>

        <Card gradient gradientFrom="from-purple-500" gradientTo="to-pink-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Streak</p>
              <h3 className="text-3xl font-bold mt-2">7 🔥</h3>
            </div>
            <Zap size={32} className="opacity-70" />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attempts Over Time */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Attempts Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.attemptsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={chartColors.tooltip}
                labelStyle={{ color: chartColors.tooltip.color }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Score Trend */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Score Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.scoreTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={chartColors.tooltip}
                labelStyle={{ color: chartColors.tooltip.color }}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance by Topic */}
      {trends.performanceByTopic && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Performance by Topic
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends.performanceByTopic}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="topic" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip
                contentStyle={chartColors.tooltip}
                labelStyle={{ color: chartColors.tooltip.color }}
              />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </MainLayout>
  );
}

