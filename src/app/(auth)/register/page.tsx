"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  whatsapp: string;
  linkedin_url: string;
  instagram_handle: string;
  birth_date: string;
  church_name: string;
  city: string;
  state: string;
  gender: "male" | "female" | "";
  is_legendario: boolean;
  wants_to_be_legendario: boolean;
  is_legendario_spouse: boolean;
}

const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState<FormData>({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    whatsapp: "",
    linkedin_url: "",
    instagram_handle: "",
    birth_date: "",
    church_name: "",
    city: "",
    state: "",
    gender: "",
    is_legendario: false,
    wants_to_be_legendario: false,
    is_legendario_spouse: false,
  });

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep1() {
    if (!form.full_name.trim()) return "Informe seu nome completo.";
    if (!form.email.trim()) return "Informe seu email.";
    if (!form.phone.trim()) return "Informe seu telefone.";
    if (!form.birth_date) return "Informe sua data de nascimento.";
    if (form.password.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
    if (form.password !== form.confirm_password) return "As senhas não coincidem.";
    return null;
  }

  function validateStep2() {
    if (!form.church_name.trim()) return "Informe o nome da sua igreja.";
    if (!form.city.trim()) return "Informe sua cidade.";
    if (!form.state) return "Selecione seu estado.";
    if (!form.gender) return "Selecione seu gênero.";
    return null;
  }

  function nextStep() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Este email já está cadastrado. Faça login."
        : "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: form.email,
        full_name: form.full_name,
        phone: form.phone || null,
        whatsapp: form.whatsapp || null,
        linkedin_url: form.linkedin_url || null,
        instagram_handle: form.instagram_handle || null,
        birth_date: form.birth_date || null,
        church_name: form.church_name,
        city: form.city,
        state: form.state,
        gender: form.gender as "male" | "female",
        is_legendario: form.is_legendario,
        wants_to_be_legendario: form.wants_to_be_legendario,
        is_legendario_spouse: form.is_legendario_spouse,
        status: "approved",
      });

      if (profileError) {
        console.error("[register] profileError:", profileError.message);
      }

      // Notifica o admin (fire-and-forget)
      fetch("/api/notify/new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authData.user.id }),
      }).catch(() => {});
    }

    router.push("/home");
  }

  return (
    <div className="card p-8 glow-gold">
      <div className="text-center mb-6">
        <p className="selah-wordmark mb-1">SELAH</p>
        <p className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(201,162,39,0.6)", fontFamily: "var(--font-cinzel)" }}>
          Criar Conta
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-7">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: step >= s ? "#c9a227" : "rgba(255,255,255,0.08)",
                color: step >= s ? "#080d1a" : "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-cinzel)",
              }}>
              {s}
            </div>
            {s < 2 && (
              <div className="w-8 h-px"
                style={{ background: step > s ? "#c9a227" : "rgba(255,255,255,0.12)" }} />
            )}
          </div>
        ))}
      </div>

      {error && <p className="error-text text-center mb-4">{error}</p>}

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="full_name">Nome completo *</label>
              <input id="full_name" type="text" className="input-field" placeholder="Seu nome completo"
                value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="email">Email *</label>
              <input id="email" type="email" className="input-field" placeholder="seu@email.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="phone">Telefone *</label>
              <input id="phone" type="tel" className="input-field" placeholder="(16) 99999-9999"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="whatsapp">WhatsApp</label>
              <input id="whatsapp" type="tel" className="input-field" placeholder="(16) 99999-9999 (se diferente)"
                value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="birth_date">Data de nascimento *</label>
              <input id="birth_date" type="date" className="input-field"
                value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="linkedin_url">LinkedIn</label>
              <input id="linkedin_url" type="url" className="input-field" placeholder="https://linkedin.com/in/seuperfil"
                value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="instagram_handle">Instagram</label>
              <input id="instagram_handle" type="text" className="input-field" placeholder="@seuperfil"
                value={form.instagram_handle} onChange={(e) => set("instagram_handle", e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="password">Senha *</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} className="input-field w-full pr-12" placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(201,162,39,0.6)" }} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="confirm_password">Confirmar senha *</label>
              <div className="relative">
                <input id="confirm_password" type={showConfirmPassword ? "text" : "password"} className="input-field w-full pr-12" placeholder="Repita a senha"
                  value={form.confirm_password} onChange={(e) => set("confirm_password", e.target.value)} required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(201,162,39,0.6)" }} aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-2">Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="church_name">Nome da Igreja *</label>
              <input id="church_name" type="text" className="input-field" placeholder="Ex: Casa de Oração Franca"
                value={form.church_name} onChange={(e) => set("church_name", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="city">Cidade *</label>
                <input id="city" type="text" className="input-field" placeholder="Sua cidade"
                  value={form.city} onChange={(e) => set("city", e.target.value)} required />
              </div>
              <div>
                <label className="label" htmlFor="state">Estado *</label>
                <select id="state" className="input-field" value={form.state}
                  onChange={(e) => set("state", e.target.value)} required>
                  <option value="">UF</option>
                  {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Gênero *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ value: "male", label: "Homem" }, { value: "female", label: "Mulher" }].map((g) => (
                  <button key={g.value} type="button"
                    onClick={() => { set("gender", g.value); set("is_legendario", false); set("wants_to_be_legendario", false); set("is_legendario_spouse", false); }}
                    className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      background: form.gender === g.value ? "#c9a227" : "rgba(255,255,255,0.04)",
                      color: form.gender === g.value ? "#080d1a" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${form.gender === g.value ? "#c9a227" : "rgba(255,255,255,0.1)"}`,
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {form.gender === "male" && (
              <div className="space-y-2">
                <label className="label">Ministério Legendários</label>
                <button type="button"
                  onClick={() => { set("is_legendario", !form.is_legendario); if (!form.is_legendario) set("wants_to_be_legendario", false); }}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between px-4"
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    background: form.is_legendario ? "rgba(201,162,39,0.1)" : "rgba(255,255,255,0.04)",
                    color: form.is_legendario ? "#c9a227" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${form.is_legendario ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  <span>Já sou Legendário</span>
                  <span>{form.is_legendario ? "Sim" : "Não"}</span>
                </button>
                {!form.is_legendario && (
                  <button type="button"
                    onClick={() => set("wants_to_be_legendario", !form.wants_to_be_legendario)}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between px-4"
                    style={{
                      fontFamily: "var(--font-cinzel)",
                      background: form.wants_to_be_legendario ? "rgba(201,162,39,0.1)" : "rgba(255,255,255,0.04)",
                      color: form.wants_to_be_legendario ? "#c9a227" : "rgba(255,255,255,0.5)",
                      border: `1px solid ${form.wants_to_be_legendario ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
                    }}>
                    <span>Pretendo ser Legendário</span>
                    <span>{form.wants_to_be_legendario ? "Sim" : "Não"}</span>
                  </button>
                )}
              </div>
            )}

            {form.gender === "female" && (
              <div>
                <label className="label">Conexão Legendários</label>
                <button type="button"
                  onClick={() => set("is_legendario_spouse", !form.is_legendario_spouse)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-between px-4"
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    background: form.is_legendario_spouse ? "rgba(201,162,39,0.1)" : "rgba(255,255,255,0.04)",
                    color: form.is_legendario_spouse ? "#c9a227" : "rgba(255,255,255,0.5)",
                    border: `1px solid ${form.is_legendario_spouse ? "rgba(201,162,39,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}>
                  <span>Esposa de Legendário</span>
                  <span>{form.is_legendario_spouse ? "Sim" : "Não"}</span>
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => { setError(null); setStep(1); }}>
                Voltar
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </button>
            </div>
          </div>
        )}
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Já tem acesso?{" "}
        <Link href="/login" className="font-semibold"
          style={{ color: "rgba(201,162,39,0.85)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.05em" }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
