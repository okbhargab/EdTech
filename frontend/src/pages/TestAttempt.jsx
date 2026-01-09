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
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>
          {Object.entries(q.options).map(([k, v]) => (
            <label key={k}>
              <input
                type="radio"
                name={q.id}
                onChange={() =>
                  setAnswers({ ...answers, [q.id]: k })
                }
              />
              {v}
            </label>
          ))}
        </div>
      ))}
      <button onClick={submit}>Submit</button>
    </div>
  );
}
