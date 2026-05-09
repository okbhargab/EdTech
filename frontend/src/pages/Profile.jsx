import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  Trophy,
  Target,
  CheckCircle
} from "lucide-react";

export default function Profile() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    Promise.all([
      api("/users/profile", "GET", null, token),
      api("/analytics/summary", "GET", null, token)
    ])
      .then(([profileData, analyticsData]) => {
        setProfile(profileData);
        setEditName(profileData.name || user?.name || "");
        setEditEmail(profileData.email || user?.email || "");
        setAnalytics(analyticsData);
      })
      .catch(err => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [token, navigate, user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      await api("/users/profile", "PUT", { name: editName, email: editEmail }, token);
      setProfile({ ...profile, name: editName, email: editEmail });
      setIsEditing(false);
      // NOTE: JWT token still has old user data until next login, 
      // but we update local state for immediate feedback.
      user.name = editName;
      user.email = editEmail;
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
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
          Student Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
        </Card>
      )}

      {/* Profile Header Card */}
      <Card className="mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <User size={48} className="text-white" />
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-lg font-bold p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Your Name"
                />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Your Email"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || "Student"}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span className="text-sm">Member since {new Date().getFullYear()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card gradient gradientFrom="from-blue-500" gradientTo="to-blue-600">
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100">Tests Completed</p>
              <Trophy size={24} className="opacity-70" />
            </div>
            <h3 className="text-3xl font-bold">{analytics?.totalTestsTaken || 0}</h3>
          </div>
        </Card>

        <Card gradient gradientFrom="from-green-500" gradientTo="to-emerald-600">
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100">Average Score</p>
              <TrendingUp size={24} className="opacity-70" />
            </div>
            <h3 className="text-3xl font-bold">{Math.round(analytics?.averageScore || 0)}%</h3>
          </div>
        </Card>

        <Card gradient gradientFrom="from-amber-500" gradientTo="to-orange-600">
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-amber-100">Best Score</p>
              <Star size={24} className="opacity-70" />
            </div>
            <h3 className="text-3xl font-bold">{Math.round(analytics?.bestScore || 0)}%</h3>
          </div>
        </Card>

        <Card gradient gradientFrom="from-purple-500" gradientTo="to-pink-600">
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100">Learning Streak</p>
              <Zap size={24} className="opacity-70" />
            </div>
            <h3 className="text-3xl font-bold">7 🔥</h3>
          </div>
        </Card>
      </div>

      {/* Achievements & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={24} className="text-amber-500" />
            Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center text-lg">
                🥇
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">First Test</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed your first test</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg opacity-50">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-lg">
                🎯
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">Perfect Score</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Score 100% on any test</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg opacity-50">
              <div className="w-10 h-10 bg-red-300 rounded-full flex items-center justify-center text-lg">
                🔥
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">7-Day Streak</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Practice for 7 consecutive days</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={24} className="text-blue-500" />
            Learning Goals
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Tests Goal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">3 / 5</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Average Score Target</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{Math.round(analytics?.averageScore || 0)} / 85%</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(100, ((analytics?.averageScore || 0) / 85) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Daily Practice</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">4 / 7 days</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full" style={{ width: '57%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-dark-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Completed DSA Quiz</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago - Score: 85%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2 border-b border-gray-200 dark:border-dark-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Improved on Trees Topic</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Yesterday - +15% improvement</p>
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <Zap size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Unlocked 7-Day Streak</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
}
