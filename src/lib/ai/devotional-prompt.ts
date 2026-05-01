export interface DevotionalInput {
  bibleBook: string;
  bibleChapter: number;
  bibleVerseStart: number;
  bibleVerseEnd?: number;
  biblePassage: string;
  date: string;
}

export function buildDevotionalPrompt(input: DevotionalInput): string {
  const { bibleBook, bibleChapter, bibleVerseStart, bibleVerseEnd, biblePassage, date } = input;
  const verseRef = `${bibleBook} ${bibleChapter}:${bibleVerseStart}${bibleVerseEnd ? `–${bibleVerseEnd}` : ""}`;

  return `Você é um escritor devocional evangélico profundo, empático e ungido, com voz pastoral e linguagem acessível. Escreva um devocional diário para a comunidade da Casa de Oração de Franca (SP) e do Ministério Legendários Brasil — homens, mulheres e famílias que buscam crescimento espiritual genuíno.

Data: ${date}
Passagem: ${verseRef}
Texto bíblico: "${biblePassage}"

Escreva o devocional no seguinte formato JSON exato (sem markdown, apenas JSON puro):

{
  "title": "Título curto, poético e impactante (máximo 8 palavras, sem dois pontos)",
  "reflection": "Reflexão devocional de 3 a 4 parágrafos. Primeiro parágrafo: contexto bíblico e o que Deus estava comunicando naquele momento. Segundo parágrafo: aplicação prática para o dia de hoje — situações reais de vida, trabalho, família e fé. Terceiro parágrafo: conexão com a missão da comunidade — oração contínua, vida no Espírito, famílias restauradas, herói dentro de cada homem, mulher fortalecida. Quarto parágrafo (opcional): uma pergunta reflexiva poderosa que leva o leitor a um momento de pausa e autoexame. Tom: caloroso, direto, sem clichês religiosos, sem julgamentos, com profundidade teológica acessível.",
  "prayer": "Uma oração de 3 a 5 linhas. Primeira pessoa do plural (nós). Começa com uma declaração de fé. Termina com rendição e confiança. Tom: íntimo, reverente, sem vocabulário piegas. Não usar 'Amém' no final."
}

Diretrizes obrigatórias:
- Nunca use clichês como "Deus está no controle", "tudo vai dar certo", "confie e ore"
- A reflexão deve ter substância teológica real, não apenas motivação
- Conecte a passagem à vida cotidiana concreta
- A oração deve soar como alguém falando com um Pai real, não uma recitação
- Máximo 450 palavras na reflexão
- Máximo 80 palavras na oração
- Responda APENAS com o JSON, sem texto antes ou depois`;
}

export function buildVerseOfDayPrompt(date: string): string {
  return `Você é um curador bíblico evangélico. Para a data ${date}, selecione o versículo do dia mais apropriado para a comunidade da Casa de Oração (Franca-SP) e Ministério Legendários Brasil.

Considere:
- O dia da semana e seu significado espiritual
- Temas de oração, família, propósito, coragem, restauração
- Passagens que tenham profundidade e também clareza imediata

Responda APENAS com este JSON exato:
{
  "book": "Nome do livro bíblico em português",
  "chapter": número,
  "verse_start": número,
  "verse_end": número ou null,
  "text": "Texto completo do versículo na versão NVI",
  "theme": "Uma palavra: o tema central (ex: Coragem, Oração, Restauração, Identidade)"
}`;
}
