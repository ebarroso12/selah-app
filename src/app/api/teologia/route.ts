import { NextRequest, NextResponse } from "next/server";
import { callOpenAI } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const { texto, livro, capitulo } = await request.json();
    const contexto = texto
      ? `Texto/versículo: "${texto}"`
      : `${livro} capítulo ${capitulo}`;

    const raw = await callOpenAI(
      [
        {
          role: "system",
          content: `Você é um teólogo cristão de alto nível acadêmico, com profundo conhecimento em teologia sistemática, bíblica e histórica.
Faça uma análise teológica aprofundada do texto bíblico fornecido.
Retorne um JSON no formato:
{
  "titulo": "Título da análise teológica",
  "doutrinas_principais": [
    {
      "doutrina": "Nome da doutrina",
      "explicacao": "Como esta doutrina aparece no texto",
      "versiculos_suporte": ["Ref1", "Ref2"]
    }
  ],
  "cristologia": "Dimensão cristológica do texto",
  "pneumatologia": "Aspectos do Espírito Santo",
  "soteriologia": "Aspectos da salvação",
  "escatologia": "Aspectos proféticos ou escatológicos",
  "hermeneutica": "Princípios hermenêuticos aplicados",
  "aplicacao_pratica": "Como esta teologia se aplica à vida cristã hoje",
  "perspectivas_historicas": "Como os grandes teólogos interpretaram este texto"
}`,
        },
        { role: "user", content: `Faça uma análise teológica de: ${contexto}` },
      ],
      {
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }
    );

    const result = JSON.parse(raw || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na análise teológica:", error);
    return NextResponse.json({ error: "Erro ao gerar análise teológica" }, { status: 500 });
  }
}
