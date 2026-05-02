export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";
import InviteUser from "@/components/admin/InviteUser";

export const metadata = { title: "Usuários — Admin" };

const STATUS_LABEL: Record<string, string> = {
  approved: "Aprovado", pending: "Pendente", rejected: "Rejeitado", banned: "Banido",
};
const STATUS_BADGE: Record<string, string> = {
  approved: "badge-success", pending: "badge-pending", rejected: "badge-danger", banned: "badge-danger",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "todos") query = query.eq("status", status);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data } = await query.limit(100);
  const users = (data ?? []) as Profile[];

  const counts = {
    todos: users.length,
    approved: users.filter((u) => u.status === "approved").length,
    pending: users.filter((u) => u.status === "pending").length,
    rejected: users.filter((u) => u.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl mb-1">Usuários</h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {users.length} usuário{users.length !== 1 ? "s" : ""} encontrado{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Convidar usuário */}
      <InviteUser />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,162,39,0.12)" }}>
          {[
            { value: "todos", label: `Todos (${counts.todos})` },
            { value: "approved", label: `Aprovados (${counts.approved})` },
            { value: "pending", label: `Pendentes (${counts.pending})` },
            { value: "rejected", label: `Rejeitados (${counts.rejected})` },
          ].map((f) => {
            const isActive = (status ?? "todos") === f.value;
            return (
              <a key={f.value}
                href={f.value === "todos" ? "/admin/usuarios" : `/admin/usuarios?status=${f.value}`}
                className="text-xs px-3 py-1.5 rounded-md transition-all"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  letterSpacing: "0.05em",
                  textDecoration: "none",
                  background: isActive ? "#c9a227" : "transparent",
                  color: isActive ? "#080d1a" : "rgba(255,255,255,0.45)",
                }}>
                {f.label}
              </a>
            );
          })}
        </div>

        <form method="get" action="/admin/usuarios" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="text" name="q" defaultValue={q} className="input-field py-1.5 text-sm w-52"
            placeholder="Buscar por nome..." />
          <button type="submit" className="btn-outline text-xs py-1.5 px-4">Buscar</button>
        </form>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(201,162,39,0.12)" }}>
                {["Nome", "Email", "Igreja / Cidade", "Perfil", "Status", "Cadastro", "Ações"].map((h) => (
                  <th key={h} className="text-left px-4 py-3"
                    style={{ color: "rgba(201,162,39,0.65)", fontFamily: "var(--font-cinzel)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td className="px-4 py-3">
                    <div>
                      <a href={`/admin/usuarios/${u.id}`}
                        className="font-medium hover:underline"
                        style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-cinzel)", fontSize: "0.8rem", textDecoration: "none" }}>
                        {u.full_name}
                      </a>
                      {u.is_legendario && <span className="badge badge-gold" style={{ fontSize: "0.55rem" }}>Legendário</span>}
                      {u.is_legendario_spouse && <span className="badge badge-gold" style={{ fontSize: "0.55rem" }}>Esposa Leg.</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{u.email}</p>
                    {u.whatsapp && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{u.whatsapp}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>{u.church_name}</p>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{u.city} / {u.state}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>{u.gender === "male" ? "Homem" : "Mulher"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_BADGE[u.status] ?? "badge-gold"}`}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "var(--font-cinzel)" }}>
                      {formatDate(u.created_at, { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                    {u.last_seen_at && (
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem" }}>
                        Visto: {formatDate(u.last_seen_at, { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`/admin/usuarios/${u.id}`}
                      className="text-xs px-3 py-1.5 rounded-md"
                      style={{ background: "rgba(201,162,39,0.1)", color: "#c9a227", fontFamily: "var(--font-cinzel)", textDecoration: "none", border: "1px solid rgba(201,162,39,0.25)" }}>
                      Ver Detalhes
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum usuário encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
