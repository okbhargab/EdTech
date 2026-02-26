import { useState,useEffect } from "react";
import { api } from "../api.jsx";
import Layout from "../components/Layout.jsx";


export default function AITutor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const token = localStorage.getItem("token");

    api("/ai/history", "GET", null, token)
    .then(data=>{
        setMessages(data);
    })
    .catch(()=>{});
  },[]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api("/ai/ask", "POST", { question: input }, token);

      const aiMessage = { role: "ai", content: res.answer };

      setMessages(prev => [...prev, aiMessage]);
      setInput("");
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "Error generating answer." }
      ]);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <h2>AI Tutor</h2>

      <div style={{
        border: "1px solid #ccc",
        padding: "10px",
        height: "400px",
        overflowY: "auto"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>

      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </Layout>
  );
}