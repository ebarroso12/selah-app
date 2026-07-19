"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/services/supabase/supabase.client";
import { PasswordInput } from "@/shared/components/ui/password-input";
import type { Profile } from "@/types/database";

const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

type Tab = "dados" | "senha";

interface Props { profile: Profile }

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dados");

  // Dados pessoais
  const [full_name, setFullName] = useState(profile.full_name);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [church_name, setChurchName] = useState(profile.church_name ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [state, setState] = useState(profile.state ?? "");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!full_name.trim() || !church_name.trim() || !city.trim() || !state) {
      setProfileMsg({ type: "err", text: "Preencha todos os campos obrigatórios." });
      return;
    }
    setSaving(true);
    setProfileMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, whatsapp: whatsapp || null, church_name, city, state })
      .eq("id", profile.id);

    if (error) {
      setProfileMsg({ type: "err", text: "Erro ao salvar. Tente novamente." });
    } else {
      setProfileMsg({ type: "ok", text: "Perfil atualizado com sucesso." });
      router.refresh();
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ type: "err", text: "A nova senha deve ter no mínimo 8 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "err", text: "As senhas não coincidem." });
      return;
    }
    setChangingPw(true);

    const supabase = createClient();

    // Re-authenticate with current password first
    const { data: { user } } = await supabase.auth.getUser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: currentPassword,
    });

    if (signInError) {
      setPwMsg({ type: "err", text: "Senha atual incorreta." });
      setChangingPw(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwMsg({ type: "err", text: "Erro ao alterar senha. Tente novamente." });
    } else {
      setPwMsg({ type: "ok", text: "Senha alterada com sucesso." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPw(false);
  }

  const tabStyle = (t: Tab) => ({
    fontFamily: "var(--font-cinzel)",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    padding: "0.625rem 1.25rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
    background: tab === t ? "var(--gold)" : "transparent",
    color: tab === t ? "#080d1a" : "var(--text-subtle)",
  });

  return (
    <div className="card p-6">
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg"
        style={{ background: "var(--bg-2)", border: "1px solid rgba(184,115,51,0.12)", width: "fit-content" }}>
        <button style={tabStyle("dados")} onClick={() => setTab("dados")}>Dados Pessoais</button>
        <button style={tabStyle("senha")} onClick={() => setTab("senha")}>Alterar Senha</button>
      </div>

      {tab === "dados" && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label" htmlFor="full_name">Nome Completo</label>
              <input id="full_name" type="text" className="input-field"
                value={full_name} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="whatsapp">WhatsApp</label>
              <input id="whatsapp" type="tel" className="input-field" placeholder="(16) 99999-9999"
                value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="church">Igreja</label>
              <input id="church" type="text" className="input-field"
                value={church_name} onChange={(e) => setChurchName(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="city">Cidade</label>
              <input id="city" type="text" className="input-field"
                value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="state">Estado</label>
              <select id="state" className="input-field" value={state} onChange={(e) => setState(e.target.value)} required>
                <option value="">Selecione</option>
                {BRAZIL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            {profileMsg && (
              <p className="text-sm" style={{
                color: profileMsg.type === "ok" ? "#34d399" : "#f87171"
              }}>
                {profileMsg.text}
              </p>
            )}
          </div>

          <div className="pt-2 border-t" style={{ borderColor: "rgba(184,115,51,0.1)" }}>
            <p className="text-xs" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)" }}>
              Email: {profile.email} — para alterar o email entre em contato com o administrador.
            </p>
          </div>
        </form>
      )}

      {tab === "senha" && (
        <form onSubmit={handleChangePassword} className="space-y-5 max-w-sm">
          <div>
            <label className="label" htmlFor="current_pw">Senha Atual</label>
            <PasswordInput id="current_pw" placeholder="Sua senha atual"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <div>
            <label className="label" htmlFor="new_pw">Nova Senha</label>
            <PasswordInput id="new_pw" placeholder="Mínimo 8 caracteres"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label className="label" htmlFor="confirm_pw">Confirmar Nova Senha</label>
            <PasswordInput id="confirm_pw" placeholder="Repita a nova senha"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={changingPw}>
              {changingPw ? "Alterando..." : "Alterar Senha"}
            </button>
            {pwMsg && (
              <p className="text-sm" style={{ color: pwMsg.type === "ok" ? "#34d399" : "#f87171" }}>
                {pwMsg.text}
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg" style={{ background: "rgba(184,115,51,0.04)", border: "1px solid rgba(184,115,51,0.1)" }}>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-subtle)", fontFamily: "var(--font-cinzel)", letterSpacing: "0.04em" }}>
              Esqueceu a senha atual? Saia da conta e use &quot;Esqueceu?&quot; na tela de login para recuperar via email.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
