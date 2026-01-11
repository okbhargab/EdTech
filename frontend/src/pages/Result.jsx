import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function Result() {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    api(`/tests/${id}/result`, "GET", null, localStorage.getItem("token"))
      .then(setResult);
  }, [id]);

  if (!result) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Result</h2>
      <p>Score: {result.score}</p>
      <p>Submitted at: {result.submitted_at}</p>
    </div>
  );
}
