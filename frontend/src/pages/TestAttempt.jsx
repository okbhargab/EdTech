import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { Clock, AlertCircle, Lightbulb, CheckCircle, Circle, ChevronLeft, ChevronRight } from "lucide-react";

export default function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    api(`/tests/${id}`, "GET", null, token)
      .then((data) => {
        setQuestions(data);
        setTimeLeft(data[0]?.duration || 600);
      })
      .catch(err => setError(err.message || "Failed to load test"))
      .finally(() => setLoading(false));
  }, [id, token]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const generateHint = async () => {
    if (!questions[currentQuestionIndex]) return;
    
    setLoadingHint(true);
    try {
      const response = await api(
        "/ai/hint",
        "POST",
        { question: questions[currentQuestionIndex].question },
        token
      );
      setHint(response.hint);
      setShowHint(true);
    } catch (err) {
      console.error("Failed to generate hint", err);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      if (!window.confirm("You haven't answered any questions. Submit anyway?")) {
        return;
      }
    } else {
      const unanswered = questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) {
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      await api("/tests/submit", "POST", { testId: id, answers }, token);
      navigate(`/result/${id}`);
    } catch (err) {
      setError(err.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading test...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = (answeredCount / questions.length) * 100;

  // Format time display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor = timeLeft < 60 ? 'text-red-600' : timeLeft < 300 ? 'text-amber-600' : 'text-green-600';

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Test in Progress
        </h1>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </Card>
        )}

        {/* Top Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Question</p>
              <h3 className="text-2xl font-bold text-primary-600">{currentQuestionIndex + 1}/{questions.length}</h3>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Answered</p>
              <h3 className="text-2xl font-bold text-green-600">{answeredCount}</h3>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Remaining</p>
              <h3 className="text-2xl font-bold text-amber-600">{unansweredCount}</h3>
            </div>
          </Card>

          <Card gradient gradientFrom={`from-${timeLeft < 60 ? 'red' : 'blue'}-500`} gradientTo={`to-${timeLeft < 60 ? 'red' : 'blue'}-600`}>
            <div className="text-center text-white">
              <p className="text-white/80 text-sm">Time Left</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Clock size={20} />
                <h3 className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</p>
              <p className="text-sm font-bold text-primary-600">{Math.round(progressPercent)}%</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-3">
          <Card>
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Question {currentQuestionIndex + 1}</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {currentQuestion?.question}
              </h2>
              {currentQuestion?.difficulty && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  currentQuestion.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {currentQuestion.difficulty.toUpperCase()}
                </span>
              )}
            </div>

            {/* Hint Section */}
            {showHint && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} /> Hint
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">{hint}</p>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 mb-6">
              {Object.entries(currentQuestion?.options || {}).map(([key, value]) => (
                <label key={key} className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-500 dark:hover:border-primary-400"
                  style={{
                    borderColor: answers[currentQuestion.id] === value ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)',
                    backgroundColor: answers[currentQuestion.id] === value ? 'rgb(239, 246, 255)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === value}
                    onChange={() => setAnswers({ ...answers, [currentQuestion.id]: value })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">{value}</span>
                </label>
              ))}
            </div>

            {/* Hint Button */}
            <button
              onClick={generateHint}
              disabled={loadingHint}
              className="w-full py-2 px-4 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
            >
              {loadingHint ? 'Generating hint...' : '💡 Get Hint'}
            </button>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={20} />
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-lg disabled:opacity-50"
          >
            {submitting ? '📤 Submitting...' : '✅ Submit Test'}
          </button>
        </div>

        {/* Question Palette Sidebar */}
        <div>
          <Card>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Question Palette</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-semibold text-sm flex items-center justify-center transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                      : answers[q.id]
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                  title={`Question ${idx + 1}${answers[q.id] ? ' (Answered)' : ''}`}
                >
                  {answers[q.id] ? <CheckCircle size={18} /> : idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-dark-700 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-600 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Current</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
