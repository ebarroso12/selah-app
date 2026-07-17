/**
 * Task 10 — Auth obrigatório + rate limit + validação Zod
 * Refatorado para usar generateAI com userId + feature: "homenagens_reescrever"
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAI } from "@/shared/services/ai/ai.service";
import { requireAuthOrUnauthorized } from "@/shared/services/auth/server";
import { withRateLimit } from "@/shared/services/rate-limit/rate-limit.service";

const schema = z.object({
  texto: z.string().min(1).max(3000),
});

const PROMPT_TEMPLATE = (texto: string) => `Aja como um redator especializado em textos cristãos para igreja evangélica, com sensibilidade pastoral e linguagem humana.

Sua tarefa é reescrever um texto de homenagem (como aniversário, gratidão, mensagem para esposa, filhos ou família), mantendo fielmente o sentimento, a intenção e as ideias do autor original.

Você DEVE:
- Garantir que o texto final tenha no máximo 2000 caracteres (incluindo espaços)
- Preservar TODAS as ideias principais da homenagem
- Manter TODOS os nomes citados exatamente como estão
- Respeitar o tom original do autor, tornando-o acolhedor, humano e natural
- Ajustar o texto apenas para melhorar clareza, fluidez e tamanho
- Manter uma linguagem adequada ao contexto cristão (respeitosa, sensível e edificante)

Você NÃO DEVE:
- Inventar informações
- Criar fatos que não estejam no texto original
- Alterar o significado da mensagem
- Omitir nomes mencionados
- Usar emojis
- Inserir doutrinas, versículos ou conteúdos religiosos que não estejam no texto original

Regras importantes:
- Se o texto ultrapassar 2000 caracteres, reduza cuidadosamente sem perder o sentimento e a essência
- Priorize manter o sentimento e a mensagem principal acima de detalhes secundários
- O texto deve parecer escrito por uma pessoa real da igreja, e não por uma IA

Texto original:
${texto}

Resposta final (apenas o texto reescrito, sem comentários adicionais):`;

export async function POST(req: NextRequest) {
  const auth = await requireAuthOrUnauthorized();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { texto } = parsed.data;

    return withRateLimit(
      `homenagens:${auth.user.id}`,
      { max: 5, windowMs: 60_000 },
      async () => {
        const { content } = await generateAI({
          provider: "openai",
          model: "gpt-4o-mini",
          feature: "homenagens_reescrever",
          messages: [{ role: "user", content: PROMPT_TEMPLATE(texto) }],
          maxTokens: 800,
          temperature: 0.7,
          userId: auth.user.id,
        });

        const reescrito = content.trim();
        return NextResponse.json({ texto: reescrito, caracteres: reescrito.length });
      },
    );
  } catch (err) {
    console.error("[homenagens/reescrever] Erro:", err);
    return NextResponse.json({ error: "Erro ao processar texto" }, { status: 500 });
  }
}
