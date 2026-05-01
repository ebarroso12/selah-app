import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@selah.app";
const ADMIN_EMAIL = "edson.barroso@gmail.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://selah.app";

// ─── Email para o Admin: novo cadastro aguardando aprovação ─────────────────

export async function sendNewUserNotificationToAdmin(user: {
  full_name: string;
  email: string;
  whatsapp?: string | null;
  church_name: string;
  city: string;
  state: string;
  gender: string;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
}) {
  const gender = user.gender === "male" ? "Homem" : "Mulher";
  const badges = [
    user.is_legendario ? "Legendário" : null,
    user.is_legendario_spouse ? "Esposa de Legendário" : null,
  ].filter(Boolean).join(", ") || "—";

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `SELAH — Novo cadastro aguardando aprovação: ${user.full_name}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin:0 0 4px 0;">SELAH</p>
        <p style="font-size:11px;color:rgba(201,162,39,0.55);letter-spacing:4px;text-transform:uppercase;margin:0 0 36px 0;">Pause · Ore · Cresça</p>

        <div style="background:rgba(15,22,41,0.9);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:32px;">
          <p style="font-family:Georgia,serif;font-size:18px;color:#c9a227;margin:0 0 6px 0;">Novo Cadastro Recebido</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:0 0 28px 0;">Um novo usuário solicita acesso ao SELAH e aguarda sua aprovação.</p>

          <table width="100%" cellpadding="0" cellspacing="0">
            ${row("Nome", user.full_name)}
            ${row("Email", user.email)}
            ${row("WhatsApp", user.whatsapp ?? "Não informado")}
            ${row("Igreja", user.church_name)}
            ${row("Cidade / Estado", `${user.city} / ${user.state}`)}
            ${row("Gênero", gender)}
            ${row("Ministério", badges)}
          </table>

          <div style="margin-top:28px;text-align:center;">
            <a href="${APP_URL}/admin/aprovacoes"
               style="display:inline-block;background:#c9a227;color:#080d1a;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Revisar no Painel
            </a>
          </div>
        </div>

        <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin-top:24px;">
          SELAH — App Devocional · Casa de Oração Franca
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

// ─── Email para o usuário: acesso aprovado ───────────────────────────────────

export async function sendApprovalEmail(user: {
  email: string;
  full_name: string;
}) {
  const firstName = user.full_name.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "SELAH — Seu acesso foi aprovado",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin:0 0 4px 0;">SELAH</p>
        <p style="font-size:11px;color:rgba(201,162,39,0.55);letter-spacing:4px;text-transform:uppercase;margin:0 0 36px 0;">Pause · Ore · Cresça</p>

        <div style="background:rgba(15,22,41,0.9);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:32px;">
          <p style="font-family:Georgia,serif;font-size:18px;color:#c9a227;margin:0 0 16px 0;">Acesso Liberado, ${firstName}</p>

          <p style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 12px 0;">
            Seu cadastro no SELAH foi aprovado. A partir de agora você tem acesso completo ao app devocional da Casa de Oração e Ministério Legendários Brasil.
          </p>

          <div style="background:rgba(201,162,39,0.06);border-left:3px solid rgba(201,162,39,0.5);border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
            <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.8;margin:0;">
              "Aguarda o Senhor; anima-te, e ele fortalecer-te-á o coração; aguarda, pois, o Senhor."
            </p>
            <p style="font-size:11px;color:rgba(201,162,39,0.65);font-family:Georgia,serif;letter-spacing:2px;margin:8px 0 0 0;">SALMOS 27:14</p>
          </div>

          <p style="font-size:13px;color:rgba(255,255,255,0.5);margin:20px 0 28px 0;">
            Acesse com o email e senha cadastrados — ou continue com o Google se usou esta opção.
          </p>

          <div style="text-align:center;">
            <a href="${APP_URL}/login"
               style="display:inline-block;background:#c9a227;color:#080d1a;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Acessar o SELAH
            </a>
          </div>
        </div>

        <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin-top:24px;">
          SELAH — App Devocional · Casa de Oração Franca<br>
          Voluntariado Dr. Edson Barroso
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

// ─── Email para o usuário: cadastro rejeitado ────────────────────────────────

export async function sendRejectionEmail(user: {
  email: string;
  full_name: string;
}) {
  const firstName = user.full_name.split(" ")[0];

  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "SELAH — Atualização sobre seu cadastro",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <tr>
      <td>
        <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin:0 0 4px 0;">SELAH</p>
        <p style="font-size:11px;color:rgba(201,162,39,0.55);letter-spacing:4px;text-transform:uppercase;margin:0 0 36px 0;">Pause · Ore · Cresça</p>

        <div style="background:rgba(15,22,41,0.9);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:32px;">
          <p style="font-family:Georgia,serif;font-size:18px;color:#c9a227;margin:0 0 16px 0;">Olá, ${firstName}</p>

          <p style="font-size:15px;color:rgba(255,255,255,0.75);line-height:1.7;margin:0 0 16px 0;">
            Revisamos seu cadastro no SELAH e, por enquanto, não foi possível liberar o acesso.
          </p>

          <p style="font-size:14px;color:rgba(255,255,255,0.55);line-height:1.7;margin:0 0 20px 0;">
            Se acredita que houve algum engano ou deseja mais informações, entre em contato diretamente com o administrador pelo email abaixo.
          </p>

          <div style="text-align:center;">
            <a href="mailto:${ADMIN_EMAIL}"
               style="display:inline-block;border:1px solid rgba(201,162,39,0.4);color:#c9a227;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Contatar Administrador
            </a>
          </div>
        </div>

        <p style="font-size:11px;color:rgba(255,255,255,0.2);text-align:center;margin-top:24px;">
          SELAH — App Devocional · Casa de Oração Franca
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}

// ─── Helper interno ───────────────────────────────────────────────────────────

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <span style="font-size:11px;color:rgba(201,162,39,0.6);font-family:Georgia,serif;letter-spacing:2px;text-transform:uppercase;">${label}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
        <span style="font-size:13px;color:rgba(255,255,255,0.8);">${value}</span>
      </td>
    </tr>`;
}
