import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import MainLayout from "../components/MainLayout.jsx";
import Card from "../components/Card.jsx";
import { PlusCircle, Save, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  
  // Create Test Form State
  const [testTitle, setTestTitle] = useState("");
  const [testDesc, setTestDesc] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" }
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    api("/admin/overview", "GET", null, token)
      .then(setData);
  }, []);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[oIndex] = value;
    setQuestions(newQs);
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await api("/admin/tests", "POST", {
        title: testTitle,
        description: testDesc,
        questions
      }, token);

      setMessage("Test created successfully!");
      setTestTitle("");
      setTestDesc("");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
      
      // Refresh overview
      const newData = await api("/admin/overview", "GET", null, token);
      setData(newData);
    } catch (err) {
      setMessage("Failed to create test: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!data) return (
    <MainLayout>
      <div className="flex items-center justify-center h-96">Loading...</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Platform Overview & Management</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card gradient gradientFrom="from-blue-500" gradientTo="to-blue-600">
          <p className="text-blue-100 text-sm font-medium">Total Users</p>
          <h3 className="text-3xl font-bold mt-2 text-white">{data.totalUsers}</h3>
        </Card>
        <Card gradient gradientFrom="from-green-500" gradientTo="to-emerald-600">
          <p className="text-green-100 text-sm font-medium">Total Tests</p>
          <h3 className="text-3xl font-bold mt-2 text-white">{data.totalTests}</h3>
        </Card>
        <Card gradient gradientFrom="from-amber-500" gradientTo="to-orange-600">
          <p className="text-amber-100 text-sm font-medium">Total Submissions</p>
          <h3 className="text-3xl font-bold mt-2 text-white">{data.totalSubmissions}</h3>
        </Card>
        <Card gradient gradientFrom="from-purple-500" gradientTo="to-pink-600">
          <p className="text-purple-100 text-sm font-medium">AI Queries</p>
          <h3 className="text-3xl font-bold mt-2 text-white">{data.totalAIQueries}</h3>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Charts */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily AI Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Create Test Form */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Test</h3>
          {message && (
            <div className={`p-3 mb-4 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleCreateTest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                type="text" 
                required 
                value={testTitle} 
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full"
                placeholder="e.g. Advanced Data Structures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea 
                required 
                value={testDesc} 
                onChange={(e) => setTestDesc(e.target.value)}
                className="w-full"
                rows="2"
              />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question {qIndex + 1}</label>
                  <input 
                    type="text" 
                    required 
                    value={q.question} 
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="w-full mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt, oIndex) => (
                      <input 
                        key={oIndex}
                        type="text" 
                        required 
                        value={opt} 
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="w-full text-sm"
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={q.correctAnswer} 
                    onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                    placeholder="Exact text of correct option"
                    className="w-full border-green-300 dark:border-green-800 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleAddQuestion}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <PlusCircle size={18} /> Add Question
              </button>
              <button 
                type="submit" 
                disabled={isCreating}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
              >
                <Save size={18} /> {isCreating ? "Saving..." : "Save Test"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}