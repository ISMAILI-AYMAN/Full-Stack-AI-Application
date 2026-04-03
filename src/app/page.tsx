"use client";
import { useState, useEffect } from "react";

export default function ModelManager() {
  const [models, setModels] = useState([]);
  const [form, setForm] = useState({ name: "", accuracy: 0 });

  // Load models from Python Backend
  const fetchModels = async () => {
    const res = await fetch("http://127.0.0.1:8000/models");
    const data = await res.json();
    setModels(data);
  };

  useEffect(() => { fetchModels(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/add-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", accuracy: 0 });
    fetchModels(); // Refresh list
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">AI Model Registry</h1>
      
      {/* Form to Add Model */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10 flex gap-4">
        <input 
          className="border p-2 rounded w-full"
          placeholder="Model Name (e.g. YOLOv8)" 
          onChange={e => setForm({...form, name: e.target.value})}
          value={form.name}
        />
        <input 
          type="number" step="0.01"
          className="border p-2 rounded w-32"
          placeholder="Accuracy" 
          onChange={e => setForm({...form, accuracy: parseFloat(e.target.value)})}
          value={form.accuracy}
        />
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save</button>
      </form>

      {/* Table to Display Output */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Model Name</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Registered At</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="p-4 font-medium">{m.name}</td>
                <td className="p-4 text-green-600 font-bold">{m.accuracy}%</td>
                <td className="p-4 text-gray-500">{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}