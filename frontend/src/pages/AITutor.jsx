import { useState, useEffect, useRef } from "react";
import { api } from "../api.jsx";
import { useAuth } from "../AuthContext.jsx";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { Send, MessageCircle, Brain, Zap, BookOpen } from "lucide-react";

export default function AITutor() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    api("/ai/history", "GET", null, token)
      .then(data => setMessages(data))
      .catch(err => setError(err.message || "Failed to load chat history"))
      .finally(() => setPageLoading(false));
  }, [token]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", message: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await api("/ai/ask", "POST", { question: input }, token);
      const aiMessage = { role: "ai", message: res.answer };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || "Failed to get AI response");
      const errorMessage = { role: "ai", message: `❌ Error: ${err.message}` };
      setMessages(prev => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading AI Tutor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Brain size={32} className="text-primary-600" />
          AI Tutor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask any question about your course topics
        </p>
      </div>

      {/* Quick Tips */}
      {messages.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-blue-500">
            <div className="flex gap-3">
              <MessageCircle size={24} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Ask Questions</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get detailed explanations on any topic
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <div className="flex gap-3">
              <Zap size={24} className="text-purple-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Get Help</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Solve doubts with examples
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-amber-500">
            <div className="flex gap-3">
              <BookOpen size={24} className="text-amber-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Learn</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Understand concepts better
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Container */}
      <Card className="h-96 flex flex-col mb-6">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Brain size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Start a conversation by asking a question!
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-dark-700 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="border-t border-gray-200 dark:border-dark-700 pt-4">
          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Example Questions
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• "Explain binary search trees"</li>
            <li>• "What is the difference between BFS and DFS?"</li>
            <li>• "How do linked lists work?"</li>
            <li>• "Explain dynamic programming"</li>
          </ul>
        </Card>

        <Card>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            Tips for Better Responses
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Be specific with your question</li>
            <li>• Ask follow-up questions</li>
            <li>• Ask for examples or code</li>
            <li>• Request step-by-step explanations</li>
          </ul>
        </Card>
      </div>
    </MainLayout>
  );
}