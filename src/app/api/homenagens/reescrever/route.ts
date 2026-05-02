import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json();
    if (!texto) return NextResponse.json({ error: "Texto obrigatório" }, { status: 400 });

    const prompt = `Aja como um redator especializado em textos cristãos para igreja evangélica, com sensibilidade pastoral e linguagem humana.

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

    const res = await fetch(`${process.env.OPENAI_API_BASE ?? "https://api.openai.com"}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });
    const json = await res.json();
    const reescrito: string = json.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ texto: reescrito, caracteres: reescrito.length });
  } catch (err) {
    console.error("Erro ao reescrever homenagem:", err);
    return NextResponse.json({ error: "Erro ao processar texto" }, { status: 500 });
  }
}
