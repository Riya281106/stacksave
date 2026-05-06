"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AI_TOOLS = [
  { id: "cursor", name: "Cursor", plans: ["Hobby", "Pro", "Business", "Enterprise"] },
  { id: "github_copilot", name: "GitHub Copilot", plans: ["Individual", "Business", "Enterprise"] },
  { id: "claude", name: "Claude", plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API"] },
  { id: "chatgpt", name: "ChatGPT", plans: ["Plus", "Team", "Enterprise", "API"] },
  { id: "gemini", name: "Gemini", plans: ["Pro", "Ultra", "API"] },
  { id: "windsurf", name: "Windsurf", plans: ["Free", "Pro", "Teams"] },
];

const USE_CASES = ["coding", "writing", "data", "research", "mixed"];

type ToolEntry = {
  toolId: string;
  plan: string;
  monthlySpend: number;
  seats: number;
};

type FormData = {
  tools: ToolEntry[];
  teamSize: number;
  useCase: string;
};

const defaultForm: FormData = {
  tools: [{ toolId: "cursor", plan: "Pro", monthlySpend: 0, seats: 1 }],
  teamSize: 1,
  useCase: "coding",
};

export default function AuditPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(defaultForm);

  useEffect(() => {
    const saved = localStorage.getItem("stacksave_form");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("stacksave_form", JSON.stringify(form));
  }, [form]);

  const addTool = () => {
    setForm((prev) => ({
      ...prev,
      tools: [...prev.tools, { toolId: "claude", plan: "Pro", monthlySpend: 0, seats: 1 }],
    }));
  };

  const removeTool = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const updateTool = (index: number, field: keyof ToolEntry, value: string | number) => {
    setForm((prev) => {
      const tools = [...prev.tools];
      tools[index] = { ...tools[index], [field]: value };
      return { ...prev, tools };
    });
  };

  const handleSubmit = () => {
    localStorage.setItem("stacksave_form", JSON.stringify(form));
    router.push("/results");
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">StackSave Audit</h1>
        <p className="text-gray-400 mb-8">Tell us what AI tools you're paying for.</p>

        {/* Team Info */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Team</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Team Size</label>
              <input
                type="number"
                min={1}
                value={form.teamSize}
                onChange={(e) => setForm((prev) => ({ ...prev, teamSize: Number(e.target.value) }))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Primary Use Case</label>
              <select
                value={form.useCase}
                onChange={(e) => setForm((prev) => ({ ...prev, useCase: e.target.value }))}
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
              >
                {USE_CASES.map((u) => (
                  <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tools */}
        {form.tools.map((tool, index) => (
          <div key={index} className="bg-gray-900 rounded-xl p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tool {index + 1}</h2>
              {form.tools.length > 1 && (
                <button onClick={() => removeTool(index)} className="text-red-400 text-sm">Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Tool</label>
                <select
                  value={tool.toolId}
                  onChange={(e) => updateTool(index, "toolId", e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
                >
                  {AI_TOOLS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Plan</label>
                <select
                  value={tool.plan}
                  onChange={(e) => updateTool(index, "plan", e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
                >
                  {AI_TOOLS.find((t) => t.id === tool.toolId)?.plans.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Monthly Spend ($)</label>
                <input
                  type="number"
                  min={0}
                  value={tool.monthlySpend}
                  onChange={(e) => updateTool(index, "monthlySpend", Number(e.target.value))}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Number of Seats</label>
                <input
                  type="number"
                  min={1}
                  value={tool.seats}
                  onChange={(e) => updateTool(index, "seats", Number(e.target.value))}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addTool}
          className="w-full border border-gray-700 rounded-xl py-3 text-gray-400 hover:text-white hover:border-gray-500 transition mb-6"
        >
          + Add Another Tool
        </button>

        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl py-4 text-lg transition"
        >
          Run My Audit →
        </button>
      </div>
    </main>
  );
}