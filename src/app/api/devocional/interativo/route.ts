import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAI } from "@/shared/services/ai/ai.service";
import { requireAuthOrUnauthorized } from "@/shared/services/auth/server";
import { withRateLimit } from "@/shared/services/rate-limit/rate-limit.service";

const schema = z.object({
  tipo: z.enum(["tema", "dia", "palavra-do-dia"]).optional(),
  tema: z.string().min(1).max(200).optional(),
});

const TEMAS_DO_DIA = [
  "Fé que move montanhas", "A graça de Deus", "Perseverança na tribulação",
  "Amor incondicional", "Esperança na promessa", "Paz que excede o entendimento",
  "Identidade em Cristo", "O poder da oração", "Renovação da mente",
  "Gratidão como estilo de vida", "Confiança no plano de Deus", "Humildade e serviço",
  "A presença de Deus", "Perdão e restauração", "Força nos momentos difíceis",
  "Propósito e chamado", "Comunhão com o Espírito Santo", "A Palavra como lâmpada",
  "Vitória sobre o medo", "Cuidado com o próximo",
];

const SYSTEM_PROMPT = `Você é um pastor e escritor cristão de profunda espiritualidade, com conhecimento bíblico sólido e linguagem acessível e tocante.
Crie um devocional completo sobre o tema solicitado.

Retorne um JSON no formato:
{
  "titulo": "Título inspirador do devocional",
  "versiculo": "Texto completo do versículo base (versão NVI)",
  "referencia": "Livro Capítulo:Versículo (ex: João 3:16)",
  "reflexao": "Reflexão profunda e tocante em 3-4 parágrafos separados por \\n\\n. Use linguagem pastoral, calorosa e edificante.",
  "oracao": "Uma oração em primeira pessoa, pessoal e sincera, relacionada ao tema. 3-5 frases.",
  "frase_destaque": "Uma frase curta e poderosa que resume a mensagem central do devocional.",
  "topico": "O tema do devocional"
}`;

export async function POST(request: NextRequest) {
  const auth = await requireAuthOrUnauthorized();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { tipo, tema } = parsed.data;

    let topico = tema;
    if (tipo === "dia" || tipo === "palavra-do-dia") {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
      );
      topico = TEMAS_DO_DIA[dayOfYear % TEMAS_DO_DIA.length];
    }

    if (!topico) {
      return NextResponse.json({ error: "Tema obrigatório" }, { status: 400 });
    }

    return withRateLimit(
      `devocional:${auth.user.id}`,
      { max: 10, windowMs: 60_000 },
      async () => {
        const { content } = await generateAI({
          provider: "openai",
          model: "gpt-4o-mini",
          feature: "devocional_interativo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Crie um devocional sobre: ${topico}` },
          ],
          userId: auth.user.id,
        });

        const result = JSON.parse(content || "{}");
        return NextResponse.json(result);
      },
    );
  } catch (error) {
    console.error("[devocional/interativo]", error);
    return NextResponse.json({ error: "Erro ao gerar devocional" }, { status: 500 });
  }
}
