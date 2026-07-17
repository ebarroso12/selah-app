export interface NewUserData {
  full_name: string;
  email: string;
  whatsapp?: string | null;
  church_name: string;
  city: string;
  state: string;
  gender: string;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid var(--bg-2);">
        <span style="font-size:11px;color:var(--gold-label);font-family:Georgia,serif;letter-spacing:2px;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid var(--bg-2);text-align:right;">
        <span style="font-size:13px;color:var(--text);">${value}</span>
      </td>
    </tr>`;
}

export function renderNewUser(data: NewUserData, appUrl: string): { subject: string; html: string } {
  const gender = data.gender === "male" ? "Homem" : "Mulher";
  const badges = [
    data.is_legendario ? "Legendário" : null,
    data.is_legendario_spouse ? "Esposa de Legendário" : null,
  ].filter(Boolean).join(", ") || "—";

  return {
    subject: `SELAH — Novo cadastro aguardando aprovação: ${data.full_name}`,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin:0 0 4px 0;">SELAH</p>
      <p style="font-size:11px;color:var(--gold-label);letter-spacing:4px;text-transform:uppercase;margin:0 0 36px 0;">Pause · Ore · Cresça</p>
      <div style="background:rgba(15,22,41,0.9);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:32px;">
        <p style="font-family:Georgia,serif;font-size:18px;color:#c9a227;margin:0 0 6px 0;">Novo Cadastro Recebido</p>
        <p style="font-size:13px;color:var(--text-muted);margin:0 0 28px 0;">Um novo usuário solicita acesso ao SELAH e aguarda sua aprovação.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${row("Nome", data.full_name)}
          ${row("Email", data.email)}
          ${row("WhatsApp", data.whatsapp ?? "Não informado")}
          ${row("Igreja", data.church_name)}
          ${row("Cidade / Estado", `${data.city} / ${data.state}`)}
          ${row("Gênero", gender)}
          ${row("Ministério", badges)}
        </table>
        <div style="margin-top:28px;text-align:center;">
          <a href="${appUrl}/admin/aprovacoes" style="display:inline-block;background:#c9a227;color:#080d1a;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">Revisar no Painel</a>
        </div>
      </div>
      <p style="font-size:11px;color:var(--text-subtle);text-align:center;margin-top:24px;">SELAH — App Devocional · Casa de Oração Franca</p>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
