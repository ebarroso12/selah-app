"use client";
import { useState } from "react";
import { getTodayBR } from "@/shared/lib/utils";
import type { NewCalendarEvent } from "../types";

const PSALMS = [
  { ref: "Salmos 37:5", text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará." },
  { ref: "Salmos 121:2", text: "O meu socorro vem do Senhor, que fez os céus e a terra." },
  { ref: "Salmos 46:1", text: "Deus é o nosso refúgio e força, socorro bem presente na angústia." },
  { ref: "Salmos 23:1", text: "O Senhor é o meu pastor; nada me faltará." },
  { ref: "Salmos 91:11", text: "Pois ele ordenará que os seus anjos te guardem em todos os teus caminhos." },
  { ref: "Salmos 27:1", text: "O Senhor é a minha luz e a minha salvação; a quem temerei?" },
  { ref: "Salmos 32:8", text: "Instruir-te-ei e ensinar-te-ei o caminho que deves seguir." },
  { ref: "Salmos 55:22", text: "Lança o teu cuidado sobre o Senhor, e ele te susterá." },
  { ref: "Salmos 119:105", text: "A tua palavra é lâmpada que ilumina o meu caminho." },
  { ref: "Salmos 34:18", text: "O Senhor está perto dos que têm o coração quebrantado." },
];

function getRandomPsalm() {
  return PSALMS[Math.floor(Math.random() * PSALMS.length)];
}

interface NewEventFormProps {
  initialDate?: string;
  onSubmit: (input: NewCalendarEvent) => Promise<boolean>;
  onClose: () => void;
}

export function NewEventForm({ initialDate, onSubmit, onClose }: NewEventFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: initialDate ?? getTodayBR(),
    time: "09:00",
    description: "",
    notify: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const psalm = getRandomPsalm();
    const ok = await onSubmit({
      title: form.title,
      date: form.date,
      time: form.time,
      description: form.description || null,
      psalm_ref: psalm.ref,
      psalm_text: psalm.text,
      notify: form.notify,
    });
    setSaving(false);
    if (ok) onClose();
  }

  const inp = "w-full rounded-lg px-3 py-2.5 text-sm outline-none";
  const inpStyle = { background: "var(--bg-2)", border: "1px solid rgba(201,162,39,0.2)", color: "var(--text)" };
  const labelStyle = { color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em" };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: "#0d1526", border: "1px solid rgba(201,162,39,0.2)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "var(--font-cinzel)", color: "#c9a227", letterSpacing: "0.08em" }}>
            Novo Compromisso
          </h3>
          <button onClick={onClose} style={{ color: "var(--text-subtle)" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1" style={labelStyle}>TÍTULO *</label>
            <input required className={inp} style={inpStyle} value={form.title}
              placeholder="Ex: Reunião de oração"
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={labelStyle}>DATA *</label>
              <input type="date" required className={inp} style={{ ...inpStyle, colorScheme: "dark" }}
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={labelStyle}>HORÁRIO</label>
              <input type="time" className={inp} style={{ ...inpStyle, colorScheme: "dark" }}
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={labelStyle}>DESCRIÇÃO</label>
            <textarea className={inp} style={{ ...inpStyle, resize: "none" as const }} rows={2}
              value={form.description} placeholder="Detalhes do compromisso..."
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.notify} className="w-4 h-4 accent-[#c9a227]"
              onChange={(e) => setForm((f) => ({ ...f, notify: e.target.checked }))} />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Receber Salmo de encorajamento
            </span>
          </label>
          <div className="rounded-lg p-3" style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.12)" }}>
            <p className="text-xs" style={{ color: "var(--gold-label)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
              UM SALMO SERÁ ATRIBUÍDO AO SEU COMPROMISSO
            </p>
            <p className="text-xs mt-1 italic" style={{ color: "var(--text-muted)" }}>
              &ldquo;Entrega o teu caminho ao Senhor; confia nele, e ele o fará.&rdquo; — Salmos 37:5
            </p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-sm"
            style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? "Salvando..." : "Salvar Compromisso"}
          </button>
        </form>
      </div>
    </div>
  );
}
