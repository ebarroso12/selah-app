import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/shared/services/auth/server";
import { generateAI } from "@/shared/services/ai/ai.service";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { prompt, message } = await req.json();

    if (!prompt || !message) {
      return NextResponse.json({ error: "prompt e message são obrigatórios" }, { status: 400 });
    }

    const { content } = await generateAI({
      provider: "openai",
      model: "gpt-4o-mini",
      feature: "kairo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
      maxTokens: 600,
      temperature: 0.75,
    });

    return NextResponse.json({ reply: content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao testar";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
