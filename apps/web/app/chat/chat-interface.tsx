"use client";

import { useState } from "react";
import { Clinic } from "@/lib/types";
import { fetchApi } from "@/lib/api";

type Message = { role: "user" | "bot"; content: string };

export default function ChatInterface({ clinics }: { clinics: Clinic[] }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "¡Hola! Soy Valeria, la asistente virtual de la clínica. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<string>(clinics.length > 0 ? clinics[0]?.id || "" : "");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedClinic) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetchApi<{ ok: boolean; reply: string; error?: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg, clinicId: selectedClinic })
      });
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: "bot", content: res.reply }]);
      } else {
        setMessages(prev => [...prev, { role: "bot", content: "⚠️ Error: " + (res.error || "Fallo de conexión con el agente.") }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "bot", content: "⚠️ Error de red: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-card border rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
        <div className="font-semibold text-sm">Simulador de Paciente</div>
        <div>
          <select 
            value={selectedClinic} 
            onChange={e => setSelectedClinic(e.target.value)}
            className="text-sm p-1.5 border rounded bg-background"
          >
            <option value="" disabled>Selecciona una clínica...</option>
            {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground p-3 rounded-xl rounded-tl-none text-sm animate-pulse">
              Valeria está escribiendo...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-muted/30 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          disabled={loading || !selectedClinic}
          className="flex-1 p-2 border rounded bg-background disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim() || !selectedClinic}
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
