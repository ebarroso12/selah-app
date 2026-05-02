import { NextRequest, NextResponse } from "next/server";
import { callOpenAI } from "@/lib/ai/openai";
import path from "path";
import fs from "fs";

interface SearchResult {
  referencia: string;
  texto: string;
  relevancia?: string;
}

function localSearch(query: string, limit = 5): SearchResult[] {
  try {
    const searchPath = path.join(process.cwd(), "public", "bible", "search.json");
    const data: { r: string; t: string }[] = JSON.parse(fs.readFileSync(searchPath, "utf-8"));
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const results: SearchResult[] = [];
    for (const item of data) {
      const text = item.t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const ref = item.r.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (text.includes(q) || ref.includes(q)) {
        results.push({ referencia: item.r, texto: item.t });
        if (results.length >= limit) break;
      }
    }
    return results;
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: "Consulta obrigatória" }, { status: 400 });

    const localResults = localSearch(query, 5);
    const localContext = localResults.length > 0
      ? `\n\nVersículos encontrados localmente (ARC):\n${localResults.map(r => `${r.referencia}: "${r.texto}"`).join("\n")}`
      : "";

    const text = await callOpenAI(
      [
        {
          role: "system",
          content: `Você é um especialista em Bíblia Sagrada. Busque versículos relevantes para a consulta do usuário.
Retorne um JSON no formato:
{
  "results": [
    {
      "reference": "João 3:16",
      "text": "Porque Deus amou o mundo de tal maneira...",
      "relevance": "Explique brevemente por que este versículo é relevante"
    }
  ],
  "resumo": "O que a Bíblia diz sobre este tema em 2-3 frases"
}
Use a versão Almeida Revista e Corrigida (ARC) em português.${localContext}`,
        },
        { role: "user", content: `Buscar versículos sobre: ${query}` },
      ],
      {
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }
    );

    const result = JSON.parse(text || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na busca bíblica:", error);
    return NextResponse.json({ error: "Erro ao buscar versículos" }, { status: 500 });
  }
}
