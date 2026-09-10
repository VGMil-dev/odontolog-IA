"use client";

import { useState } from "react";
import { Clinic } from "@/lib/types";
import { updateTelegramCredentials, updateMetaCredentials } from "./actions";
import { useRouter } from "next/navigation";

export default function CredentialsModal({ clinic }: { clinic: Clinic }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"telegram" | "whatsapp">("telegram");
  const router = useRouter();

  const [tgToken, setTgToken] = useState(clinic.telegramBotToken || "");
  const [waPhoneId, setWaPhoneId] = useState(clinic.metaPhoneNumberId || "");
  const [waWabaId, setWaWabaId] = useState(clinic.metaWabaId || "");
  const [waToken, setWaToken] = useState(clinic.metaAccessToken || "");

  const handleSaveTg = async () => {
    const res = await updateTelegramCredentials(clinic.id, tgToken);
    if (res.success) {
      alert("Credenciales de Telegram guardadas");
      router.refresh();
      setOpen(false);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleSaveWa = async () => {
    const res = await updateMetaCredentials(clinic.id, waPhoneId, waWabaId, waToken);
    if (res.success) {
      alert("Credenciales de WhatsApp Meta guardadas");
      router.refresh();
      setOpen(false);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground px-4 py-2 rounded shadow text-sm font-semibold hover:bg-primary/90"
      >
        Configurar Canales
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground p-6 rounded-lg shadow-xl w-[500px] max-w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Credenciales de Bot</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="flex space-x-4 mb-4 border-b">
              <button 
                onClick={() => setTab("telegram")}
                className={`pb-2 ${tab === "telegram" ? "border-b-2 border-primary font-bold" : "text-muted-foreground"}`}
              >
                Telegram
              </button>
              <button 
                onClick={() => setTab("whatsapp")}
                className={`pb-2 ${tab === "whatsapp" ? "border-b-2 border-primary font-bold" : "text-muted-foreground"}`}
              >
                WhatsApp Meta
              </button>
            </div>

            {tab === "telegram" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bot Token</label>
                  <input 
                    type="text" 
                    value={tgToken} 
                    onChange={e => setTgToken(e.target.value)}
                    className="w-full border rounded p-2 bg-background" 
                    placeholder="123456789:AAH..." 
                  />
                </div>
                <button onClick={handleSaveTg} className="w-full bg-primary text-primary-foreground p-2 rounded font-bold hover:bg-primary/90">
                  Guardar Telegram
                </button>
              </div>
            )}

            {tab === "whatsapp" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number ID</label>
                  <input 
                    type="text" 
                    value={waPhoneId} 
                    onChange={e => setWaPhoneId(e.target.value)}
                    className="w-full border rounded p-2 bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WABA ID (Business Account ID)</label>
                  <input 
                    type="text" 
                    value={waWabaId} 
                    onChange={e => setWaWabaId(e.target.value)}
                    className="w-full border rounded p-2 bg-background" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Access Token Temporal/Permanente</label>
                  <input 
                    type="password" 
                    value={waToken} 
                    onChange={e => setWaToken(e.target.value)}
                    className="w-full border rounded p-2 bg-background" 
                  />
                </div>
                <button onClick={handleSaveWa} className="w-full bg-primary text-primary-foreground p-2 rounded font-bold hover:bg-primary/90">
                  Guardar WhatsApp Meta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
