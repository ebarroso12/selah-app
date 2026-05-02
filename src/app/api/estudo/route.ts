import { callOpenAI } from "@/lib/ai/openai";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { texto, livro, capitulo } = await request.json();

    const contexto = texto
      ? `Texto/versículo específico: "${texto}"`
      : `Capítulo: ${livro} ${capitulo}`;

    const raw = await callOpenAI(
      [
        {
          role: "system",
          content: `Você é um professor de Bíblia e teólogo experiente. Crie um guia de estudo bíblico completo e didático.

Retorne um JSON no formato:
{
  "titulo": "Título do guia de estudo",
  "contexto_historico": "Contexto histórico e cultural do texto (2-3 parágrafos)",
  "estrutura": [
    {
      "secao": "Nome da seção",
      "versiculo": "Versículo(s) de referência",
      "explicacao": "Explicação detalhada",
      "aplicacao": "Aplicação prática para hoje"
    }
  ],
  "temas_principais": ["tema1", "tema2", "tema3"],
  "perguntas_reflexao": [
    "Pergunta 1 para reflexão pessoal",
    "Pergunta 2 para reflexão pessoal",
    "Pergunta 3 para reflexão pessoal"
  ],
  "versiculos_relacionados": [
    { "referencia": "Referência", "texto": "Texto" }
  ],
  "conclusao": "Conclusão e aplicação final"
}`,
        },
        { role: "user", content: `Crie um guia de estudo para: ${contexto}` },
      ],
      { model: "gpt-4o-mini", temperature: 0.5, max_tokens: 3000, response_format: { type: "json_object" } }
    );

    const result = JSON.parse(raw || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar guia de estudo:", error);
    return NextResponse.json({ error: "Erro ao gerar guia de estudo" }, { status: 500 });
  }
}
