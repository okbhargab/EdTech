import { useEffect, useState } from "react";
import { api } from "../api.jsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Layout from "../components/Layout.jsx";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    api("/admin/overview", "GET", null, token)
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
  <Layout>
    <h2>Admin Overview</h2>

    <div>
      <p>Total Users: {data.totalUsers}</p>
      <p>Total Tests: {data.totalTests}</p>
      <p>Total Submissions: {data.totalSubmissions}</p>
      <p>Total AI Queries: {data.totalAIQueries}</p>
    </div>

    <h3 style={{ marginTop: "40px" }}>Daily AI Usage</h3>

    <LineChart
      width={600}
      height={300}
      data={data.dailyUsage}
      style={{ marginTop: "20px" }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="count" stroke="#8884d8" />
    </LineChart>
  </Layout>
);
}