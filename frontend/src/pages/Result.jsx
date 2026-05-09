import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { 
  Trophy, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    if (!token) return;
    
    Promise.all([
      api(`/tests/${id}/result`, "GET", null, token),
      api(`/tests/${id}`, "GET", null, token)
    ])
      .then(([resultData, questionsData]) => {
        setResult(resultData);
        setQuestions(questionsData);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleGenerateFeedback = () => {
    if (result && questions.length > 0) {
      generateFeedback(result, questions);
    }
  };

  const generateFeedback = async (resultData, questionsData) => {
    setLoadingFeedback(true);
    try {
      // Identify wrong topics
      const wrongQs = resultData.answers 
        ? Object.entries(resultData.answers)
            .filter(([qId, answer]) => {
              const q = questionsData.find(q => q.id == qId);
              return q && q.correct_answer !== answer;
            })
            .map(([qId]) => questionsData.find(q => q.id == qId)?.topic)
            .filter(Boolean)
        : [];

      const feedbackResponse = await api(
        "/ai/feedback",
        "POST",
        {
          testId: id,
          score: resultData.score,
          totalMarks: questionsData.length,
          wrongTopics: [...new Set(wrongQs)]
        },
        token
      );

      setFeedback(feedbackResponse);
    } catch (err) {
      console.error("Failed to generate feedback", err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const generateExplanation = async (question) => {
    try {
      const userAnswer = result.answers?.[question.id];
      const response = await api(
        "/ai/explain",
        "POST",
        {
          questionId: question.id,
          userAnswer,
          correctAnswer: question.correct_answer
        },
        token
      );
      setExplanations(prev => ({ ...prev, [question.id]: response.explanation }));
    } catch (err) {
      console.error("Failed to generate explanation", err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading results...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!result) {
    return (
      <MainLayout>
        <Card className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No result found</p>
        </Card>
      </MainLayout>
    );
  }

  const percentage = ((result.score / questions.length) * 100).toFixed(1);
  const correctAnswers = Object.entries(result.answers || {})
    .filter(([qId, answer]) => {
      const q = questions.find(q => q.id == qId);
      return q && q.correct_answer === answer;
    }).length;
  const wrongAnswers = questions.length - correctAnswers;

  // Performance indicators
  let performanceLevel, performanceColor, performanceEmoji;
  if (percentage >= 90) {
    performanceLevel = 'Excellent';
    performanceColor = 'from-green-500 to-emerald-600';
    performanceEmoji = '🌟';
  } else if (percentage >= 70) {
    performanceLevel = 'Good';
    performanceColor = 'from-blue-500 to-cyan-600';
    performanceEmoji = '👍';
  } else if (percentage >= 50) {
    performanceLevel = 'Average';
    performanceColor = 'from-amber-500 to-orange-600';
    performanceEmoji = '📈';
  } else {
    performanceLevel = 'Needs Improvement';
    performanceColor = 'from-orange-500 to-red-600';
    performanceEmoji = '💪';
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {performanceEmoji} Test Completed
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date(result.submitted_at).toLocaleString()}
        </p>
      </div>

      {/* Score Card */}
      <Card gradient gradientFrom={performanceColor} className="text-white mb-8">
        <div className="text-center">
          <p className="text-white/80 text-lg mb-4">Your Performance</p>
          <h2 className="text-6xl font-bold mb-4">{percentage}%</h2>
          <div className="text-xl font-semibold mb-6">{performanceLevel}</div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-white/80 text-sm">Correct</p>
              <p className="text-2xl font-bold">{correctAnswers}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Wrong</p>
              <p className="text-2xl font-bold">{wrongAnswers}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total</p>
              <p className="text-2xl font-bold">{questions.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Feedback */}
      {loadingFeedback ? (
        <Card className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <p className="text-gray-600 dark:text-gray-400">Generating AI feedback...</p>
          </div>
        </Card>
      ) : feedback ? (
        <Card className="mb-8 border-l-4 border-blue-500">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lightbulb size={24} className="text-blue-500" />
            AI-Powered Feedback
          </h3>
          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {feedback.feedback}
          </div>
        </Card>
      ) : (
        <Card className="mb-8 text-center py-6">
          <Lightbulb size={32} className="mx-auto text-blue-500 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Want personalized feedback?</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Our AI tutor can analyze your performance and suggest areas for improvement.</p>
          <button
            onClick={handleGenerateFeedback}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate AI Feedback
          </button>
        </Card>
      )}

      {/* Questions Review */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Questions Review
        </h3>

        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = result.answers?.[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            const isAnswered = userAnswer !== undefined && userAnswer !== null;

            return (
              <Card key={question.id} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      {isCorrect ? (
                        <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Question {index + 1}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{question.question}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer Comparison */}
                  <div className="ml-9 space-y-3 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {isAnswered ? 'Your Answer' : 'Not Answered'}
                      </p>
                      <div className={`p-3 rounded-lg text-sm ${
                        isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}>
                        {userAnswer || 'Skipped'}
                      </div>
                    </div>

                    {!isCorrect && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                          Correct Answer
                        </p>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
                          {question.correct_answer}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Explanation */}
                {!isCorrect && (
                  <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mt-4">
                    {explanations[question.id] ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                          💡 AI Explanation
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                          {explanations[question.id]}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => generateExplanation(question)}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                      >
                        💡 Get Explanation <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="py-3 px-6 bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors font-semibold"
        >
          📊 Back to Dashboard
        </button>

        <button
          onClick={() => navigate("/tests")}
          className="py-3 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-semibold"
        >
          ✅ Take Another Test
        </button>
      </div>
    </MainLayout>
  );
}
