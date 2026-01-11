import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function TestAttempt() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    api(`/tests/${id}`, "GET", null, localStorage.getItem("token"))
      .then(setQuestions);
  }, [id]);

  const submit = async () => {
    await api(
      "/tests/submit",
      "POST",
      { testId: id, answers },
      localStorage.getItem("token")
    );

    window.location.href = `/result/${id}`;
  };

  return (
    <div>
      <h2>Test</h2>
      {questions.map((q, index) => (
      <div key={q.id} className="question-card">
      <p className="question-title">
        Q{index + 1}. {q.question}
        <span className="marks"> (1 mark)</span>
      </p>

      {Object.entries(q.options).map(([key, value]) => (
        <label key={key} className="option">
          <input
            type="radio"
            name={`question-${q.id}`}
            onChange={() =>
              setAnswers({ ...answers, [q.id]: key })
            }
          />
          {value}
        </label>
      ))}
      </div>
      ))}

      <button onClick={submit}>Submit</button>
    </div>
  );
}
