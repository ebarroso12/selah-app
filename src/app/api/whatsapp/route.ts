import { NextResponse } from "next/server";
import { handleIncomingMessage, type WhatsAppMessage } from "@/lib/whatsapp/bot";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ status: "ignored" });
  }

  const entries = body.entry ?? [];
  const messages: Promise<void>[] = [];

  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;

      for (const message of value.messages) {
        if (message.type !== "text") continue;
        messages.push(
          handleIncomingMessage(message as WhatsAppMessage).catch((err) =>
            console.error("Bot handler error:", err)
          )
        );
      }
    }
  }

  await Promise.allSettled(messages);

  return NextResponse.json({ status: "ok" });
}
