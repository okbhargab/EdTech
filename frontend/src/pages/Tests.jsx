import { useEffect, useState } from "react";
import { api } from "../api";
import Layout from "../components/Layout.jsx";
export default function Tests() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    api("/tests", "GET", null, localStorage.getItem("token"))
      .then(setTests);
  }, []);

  return (
    <Layout>
      <h2>Available Tests</h2>
      {tests.map(t => (
        <div key={t.id}>
          <h4>{t.title}</h4>
          <p>{t.description}</p>
          <a href={`/tests/${t.id}`}>Start</a>
        </div>
      ))}
    </Layout>
  );
}
