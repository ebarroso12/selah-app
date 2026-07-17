export interface ApprovalData {
  full_name: string;
  email: string;
}

export function renderApproval(data: ApprovalData, appUrl: string): { subject: string; html: string } {
  const firstName = data.full_name.split(" ")[0];
  return {
    subject: "SELAH — Seu acesso foi aprovado",
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080d1a;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <p style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#c9a227;letter-spacing:6px;text-transform:uppercase;margin:0 0 4px 0;">SELAH</p>
      <p style="font-size:11px;color:var(--gold-label);letter-spacing:4px;text-transform:uppercase;margin:0 0 36px 0;">Pause · Ore · Cresça</p>
      <div style="background:rgba(15,22,41,0.9);border:1px solid rgba(201,162,39,0.2);border-radius:12px;padding:32px;">
        <p style="font-family:Georgia,serif;font-size:18px;color:#c9a227;margin:0 0 16px 0;">Acesso Liberado, ${firstName}</p>
        <p style="font-size:15px;color:var(--text);line-height:1.7;margin:0 0 12px 0;">Seu cadastro no SELAH foi aprovado. A partir de agora você tem acesso completo ao app devocional da Casa de Oração e Ministério Legendários Brasil.</p>
        <div style="background:rgba(201,162,39,0.06);border-left:3px solid rgba(201,162,39,0.5);border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
          <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:var(--text-muted);line-height:1.8;margin:0;">"Aguarda o Senhor; anima-te, e ele fortalecer-te-á o coração; aguarda, pois, o Senhor."</p>
          <p style="font-size:11px;color:var(--gold-label);font-family:Georgia,serif;letter-spacing:2px;margin:8px 0 0 0;">SALMOS 27:14</p>
        </div>
        <div style="text-align:center;margin-top:28px;">
          <a href="${appUrl}/login" style="display:inline-block;background:#c9a227;color:#080d1a;font-family:Georgia,serif;font-size:12px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:14px 32px;border-radius:8px;text-decoration:none;">Acessar o SELAH</a>
        </div>
      </div>
      <p style="font-size:11px;color:var(--text-subtle);text-align:center;margin-top:24px;">SELAH — App Devocional · Casa de Oração Franca<br>Voluntariado Dr. Edson Barroso</p>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
