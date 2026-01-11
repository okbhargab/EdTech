import { useEffect, useState } from "react";
import { api } from "../api";

export default function Tests() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    api("/tests", "GET", null, localStorage.getItem("token"))
      .then(setTests);
  }, []);

  return (
    <div className="container">
      <h2>Available Tests</h2>
      {tests.map(t => (
        <div key={t.id}>
          <h4>{t.title}</h4>
          <p>{t.description}</p>
          <a href={`/tests/${t.id}`}>Start</a>
        </div>
      ))}
    </div>
  );
}
