import { callOpenAI } from "@/lib/ai/openai";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  try {
    const { verse, book, chapter, verseNumber } = await request.json();
    if (!verse) return NextResponse.json({ error: "Versículo obrigatório" }, { status: 400 });

    const raw = await callOpenAI(
      [
        {
          role: "system",
          content: `Você é um especialista em Bíblia Sagrada. Dado um versículo, retorne referências cruzadas relevantes.
Retorne um JSON no formato:
{
  "references": [
    {
      "reference": "Romanos 8:28",
      "text": "Texto do versículo...",
      "connection": "Explique a conexão temática ou doutrinária"
    }
  ]
}
Retorne entre 3 e 5 referências. Use a versão Almeida Revista e Corrigida (ARC) em português.`,
        },
        {
          role: "user",
          content: `Versículo: ${book} ${chapter}:${verseNumber} — "${verse}"`,
        },
      ],
      { model: "gpt-4o-mini", temperature: 0.3, max_tokens: 1200, response_format: { type: "json_object" } }
    );

    const result = JSON.parse(raw || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro nas referências cruzadas:", error);
    return NextResponse.json({ error: "Erro ao buscar referências" }, { status: 500 });
  }
}
