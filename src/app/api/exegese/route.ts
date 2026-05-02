import { NextRequest, NextResponse } from "next/server";
import { callOpenAI } from "@/lib/ai/openai";

export async function POST(request: NextRequest) {
  try {
    const { texto, livro, capitulo, versiculo } = await request.json();
    const contexto = texto
      ? `"${texto}" (${livro} ${capitulo}:${versiculo})`
      : `${livro} ${capitulo}:${versiculo}`;

    const raw = await callOpenAI(
      [
        {
          role: "system",
          content: `Você é um exegeta bíblico especializado em hermenêutica, línguas bíblicas e interpretação contextual.
Faça uma exegese completa e acadêmica do texto bíblico fornecido.
Retorne um JSON no formato:
{
  "titulo": "Título da exegese",
  "analise_linguistica": {
    "hebraico_grego": "Análise das palavras-chave no hebraico/grego original",
    "termos_importantes": [
      { "termo": "Palavra original", "transliteracao": "Transliteração", "significado": "Significado profundo" }
    ]
  },
  "contexto_historico": "Contexto histórico, cultural e geográfico do texto",
  "contexto_literario": "Gênero literário, estrutura e contexto no livro",
  "analise_versicular": [
    { "versiculo": "Número ou referência", "analise": "Análise detalhada do versículo" }
  ],
  "temas_teologicos": ["Tema 1", "Tema 2"],
  "interpretacoes_historicas": "Como a Igreja histórica interpretou este texto",
  "aplicacao_contemporanea": "Relevância e aplicação para o cristão hoje",
  "conclusao": "Síntese exegética"
}`,
        },
        { role: "user", content: `Faça uma exegese de: ${contexto}` },
      ],
      {
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 3500,
        response_format: { type: "json_object" },
      }
    );

    const result = JSON.parse(raw || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na exegese:", error);
    return NextResponse.json({ error: "Erro ao gerar exegese" }, { status: 500 });
  }
}
