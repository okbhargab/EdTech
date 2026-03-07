import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";
import Layout from "../components/Layout.jsx";

export default function TestAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    api(`/tests/${id}`, "GET", null, token)
      .then(setQuestions)
      .catch(err => setError(err.message || "Failed to load test"))
      .finally(() => setLoading(false));
  }, [id, token]);

  const unansweredCount = questions.length - Object.keys(answers).length;

  const submit = async () => {
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await api(
        "/tests/submit",
        "POST",
        { testId: id, answers },
        token
      );
      navigate(`/result/${id}`);
    } catch (err) {
      setError(err.message || "Failed to submit test");
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><p>Loading test...</p></Layout>;
  if (error && loading) return <Layout>
    <div style={{
      padding: "10px",
      background: "#fee",
      color: "#c00",
      borderRadius: "4px",
      border: "1px solid #fcc"
    }}>Error: {error}</div>
  </Layout>;

  return (
    <Layout>
      <h2>Test Attempt</h2>
      <div style={{
        marginBottom: "20px",
        padding: "10px",
        background: "#e8f4f8",
        borderRadius: "4px"
      }}>
        <strong>Questions:</strong> {questions.length} | <strong>Answered:</strong> {Object.keys(answers).length} | <strong>Remaining:</strong> {unansweredCount}
      </div>
      {error && <div style={{
        padding: "10px",
        marginBottom: "10px",
        background: "#fee",
        color: "#c00",
        borderRadius: "4px"
      }}>{error}</div>}
      {questions.map((q, index) => (
        <div key={q.id} className="question-card" style={{
          background: "#fff",
          padding: "15px",
          marginBottom: "15px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <p className="question-title" style={{ fontWeight: "bold", marginBottom: "10px" }}>
            Q{index + 1}. {q.question}
            <span className="marks" style={{ color: "#666", fontSize: "0.9em", marginLeft: "10px" }}>(1 mark)</span>
          </p>

          {Object.entries(q.options).map(([key, value]) => (
            <label key={key} className="option" style={{
              display: "block",
              padding: "8px",
              margin: "8px 0",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                name={`question-${q.id}`}
                onChange={() =>
                  setAnswers({ ...answers, [q.id]: key })
                }
                checked={answers[q.id] === key}
                style={{ marginRight: "8px" }}
              />
              {value}
            </label>
          ))}
        </div>
      ))}

      <button onClick={submit} disabled={submitting} style={{ marginTop: "20px" }}>
        {submitting ? "Submitting..." : "Submit Test"}
      </button>
    </Layout>
  );
}
