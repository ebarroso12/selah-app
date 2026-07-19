/**
 * Prompts default (fallback) para a geração de texto de apresentação/autoridade
 * do CMS admin (parceiros, causas sociais e evento em destaque dos Legendários).
 *
 * Cada prompt pode ser sobrescrito pelo admin e salvo em `app_settings` na key
 * `cms_ai_prompt_${kind}` (mesmo padrão do `kairo_system_prompt`).
 *
 * Placeholders substituídos server-side em /api/admin/cms-ai-generate:
 *   {{name}}     — nome da marca/pessoa/evento
 *   {{url}}      — site oficial (opcional)
 *   {{rawNotes}} — informações brutas/reais coladas pelo admin (única fonte de fatos)
 *
 * A IA DEVE responder apenas com JSON no formato: { "paragraphs": string[] }.
 */

export type CmsAiKind = "partner" | "cause" | "legendarios_event";

const TONE_EXAMPLE = `Existe uma diferença enorme entre tratar o sintoma e tratar a causa. O Dr. Edson Barroso, idealizador do SELAH, é médico psiquiatra pós-graduado em Saúde Mental e Medicina Integrativa (...) e construiu sua prática recusando a pergunta rápida e a receita genérica. Antes de qualquer diagnóstico, ele investiga: exames laboratoriais completos (...), porque corpo e mente caminham juntos, e não existe saúde mental real sem entender o corpo que a sustenta.`;

const COMMON_RULES = `REGRAS INEGOCIÁVEIS:
- Escreva SOMENTE com base nas informações fornecidas em "INFORMAÇÕES BRUTAS" abaixo. É terminantemente PROIBIDO inventar credenciais, títulos, números, datas, prêmios, endereços ou fatos que não estejam ali. Se um dado não foi fornecido, simplesmente não o mencione.
- Não repita o nome oficial em toda frase; escreva de forma fluida e natural.
- Tom: profundo, persuasivo, autoritativo e empático quando fizer sentido — o estilo de copywriting institucional já usado no app SELAH. Exemplo de tom (apenas referência de ESTILO, não de conteúdo):
"""
${TONE_EXAMPLE}
"""
- Produza de 3 a 4 parágrafos coesos, em português brasileiro.
- Responda APENAS com um objeto JSON válido no formato: {"paragraphs": ["parágrafo 1", "parágrafo 2", "..."]}. Nada de texto fora do JSON.`;

export const CMS_AI_DEFAULT_PROMPTS: Record<CmsAiKind, string> = {
  partner: `Você é um redator institucional do app cristão SELAH. Sua tarefa é escrever o texto de apresentação e autoridade de um PARCEIRO (profissional ou negócio de confiança que caminha ao lado da comunidade SELAH).

PARCEIRO: {{name}}
SITE OFICIAL: {{url}}

INFORMAÇÕES BRUTAS (única fonte de fatos permitida):
"""
{{rawNotes}}
"""

Escreva a apresentação do parceiro destacando quem é, credenciais/história reais e o propósito/diferencial — terminando, se houver, numa frase-lema real. ${COMMON_RULES}`,

  cause: `Você é um redator institucional do app cristão SELAH. Sua tarefa é escrever o texto de apresentação de uma CAUSA SOCIAL que o SELAH escolhe caminhar ao lado (seção "Propósito Social" — fé em ação).

CAUSA: {{name}}
SITE OFICIAL: {{url}}

INFORMAÇÕES BRUTAS (única fonte de fatos permitida):
"""
{{rawNotes}}
"""

Escreva com sensibilidade e urgência real, mostrando a história, a missão e por que essa causa importa — sempre com empatia e sem sensacionalismo. Nunca invente estatísticas ou números. ${COMMON_RULES}`,

  legendarios_event: `Você é um redator do movimento masculino cristão LEGENDÁRIOS dentro do app SELAH. Sua tarefa é escrever a descrição do EVENTO em destaque ("Próximo Evento") — tom viril, desafiador, espiritual e inspirador.

EVENTO: {{name}}
SITE OFICIAL: {{url}}

INFORMAÇÕES BRUTAS (única fonte de fatos permitida):
"""
{{rawNotes}}
"""

Escreva uma descrição envolvente que convoque o homem à ação e à transformação, fiel ao espírito dos Legendários. Não invente datas, valores ou detalhes logísticos que não estejam nas informações brutas. ${COMMON_RULES}`,
};

export function isCmsAiKind(v: unknown): v is CmsAiKind {
  return v === "partner" || v === "cause" || v === "legendarios_event";
}

export function settingKeyFor(kind: CmsAiKind): string {
  return `cms_ai_prompt_${kind}`;
}

/** Substitui os placeholders {{name}}, {{url}}, {{rawNotes}} no template. */
export function fillPrompt(
  template: string,
  data: { name: string; url?: string; rawNotes: string }
): string {
  return template
    .replaceAll("{{name}}", data.name || "(não informado)")
    .replaceAll("{{url}}", data.url || "(não informado)")
    .replaceAll("{{rawNotes}}", data.rawNotes || "(nenhuma informação fornecida)");
}
