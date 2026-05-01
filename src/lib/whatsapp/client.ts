const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";

function getWhatsAppCredentials() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("[WhatsApp] WHATSAPP_PHONE_NUMBER_ID ou WHATSAPP_TOKEN não configurados");
  }
  return { phoneNumberId, token };
}

export async function sendWhatsAppMessage(to: string, text: string) {
  const { phoneNumberId, token } = getWhatsAppCredentials();
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: text },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  components: unknown[] = []
) {
  const { phoneNumberId, token } = getWhatsAppCredentials();
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_BR" },
          components,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`[WhatsApp] Falha ao enviar template "${templateName}": ${JSON.stringify(error)}`);
  }

  return response.json();
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "55");
}
