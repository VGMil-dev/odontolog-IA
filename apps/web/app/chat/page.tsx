import ChatInterface from "./chat-interface";
import { fetchApi } from "@/lib/api";
import { Clinic } from "@/lib/types";

export default async function ChatPlaygroundPage() {
  let clinics: Clinic[] = [];
  try {
    const res = await fetchApi<{ ok: boolean; clinics: Clinic[] }>("/api/clinics");
    if (res.ok) {
      clinics = res.clinics;
    }
  } catch (e) {}

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chat Playground</h1>
        <p className="text-muted-foreground">Prueba el comportamiento de Valeria IA (Bot) en tiempo real</p>
      </div>

      <ChatInterface clinics={clinics} />
    </div>
  );
}
