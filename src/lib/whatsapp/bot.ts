import { createServiceClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "./client";
import { createCalendarEvent, listUpcomingEvents } from "@/lib/calendar/client";
import Anthropic from "@anthropic-ai/sdk";

export interface WhatsAppMessage {
  from: string;
  id: string;
  text: { body: string };
  timestamp: string;
}

const COMMANDS = {
  VERSICULO: ["verso", "versículo", "versiculo", "verso do dia", "versículo do dia"],
  DEVOCIONAL: ["devocional", "devo", "meditação", "meditacao", "reflexão", "reflexao"],
  EVENTOS: ["eventos", "agenda", "programação", "programacao", "culto", "cultos"],
  ORACAO: ["oração", "oracao", "pedido", "pedido de oração", "orar"],
  AGENDAR: ["agendar", "marcar", "criar evento", "novo evento", "lembrete"],
  AJUDA: ["ajuda", "help", "menu", "o que você faz", "comandos", "oi", "olá", "ola"],
};

function detectIntent(text: string): keyof typeof COMMANDS | "UNKNOWN" {
  const lower = text.toLowerCase().trim();
  for (const [intent, keywords] of Object.entries(COMMANDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      return intent as keyof typeof COMMANDS;
    }
  }
  return "UNKNOWN";
}

async function getTodayDevotional() {
  const supabase = await createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("devotionals")
    .select("title, bible_book, bible_chapter, bible_verse_start, bible_passage, prayer_text")
    .eq("date", today)
    .maybeSingle();
  return data;
}

async function parseScheduleRequest(text: string): Promise<{
  title: string;
  dateTime: string;
  description: string;
} | null> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const now = new Date().toISOString();

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `Você é um assistente que extrai informações de agendamento de mensagens em português.

Data/hora atual: ${now}
Mensagem do usuário: "${text}"

Extraia o evento de agendamento e responda APENAS com JSON:
{
  "title": "título do evento",
  "dateTime": "ISO 8601 com timezone -03:00",
  "description": "descrição ou contexto adicional"
}

Se não for possível extrair uma data e hora válidas, responda: null`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return null;

  try {
    const text = content.text.trim();
    if (text === "null") return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildMenuMessage(): string {
  return [
    "SELAH — Pause. Ore. Cresça.",
    "",
    "Como posso ajudar? Responda com um dos tópicos:",
    "",
    "1. Devocional — reflexão do dia",
    "2. Versículo — palavra do dia",
    "3. Eventos — programação da Casa de Oração",
    "4. Oração — enviar pedido de oração",
    "5. Agendar — marcar compromisso no Google Agenda",
    "",
    "Exemplo: 'quero o devocional de hoje'",
    "Exemplo: 'agendar reunião de célula sexta 20h'",
  ].join("\n");
}

export async function handleIncomingMessage(message: WhatsAppMessage): Promise<void> {
  const { from, text } = message;
  const intent = detectIntent(text.body);

  try {
    switch (intent) {
      case "AJUDA": {
        await sendWhatsAppMessage(from, buildMenuMessage());
        break;
      }

      case "DEVOCIONAL": {
        const devotional = await getTodayDevotional();
        if (!devotional) {
          await sendWhatsAppMessage(
            from,
            "O devocional de hoje ainda está sendo preparado. Tente novamente em alguns instantes."
          );
          break;
        }
        const msg = [
          `DEVOCIONAL — ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`,
          "",
          devotional.title.toUpperCase(),
          "",
          `${devotional.bible_book} ${devotional.bible_chapter}:${devotional.bible_verse_start}`,
          `"${devotional.bible_passage}"`,
          "",
          devotional.prayer_text ? `Oração:\n${devotional.prayer_text}` : "",
          "",
          "Abra o app SELAH para a reflexão completa.",
        ]
          .filter(Boolean)
          .join("\n");
        await sendWhatsAppMessage(from, msg);
        break;
      }

      case "VERSICULO": {
        const devotional = await getTodayDevotional();
        if (!devotional) {
          await sendWhatsAppMessage(from, "Versículo do dia: \"Aguarda o Senhor; anima-te, e ele fortalecer-te-á o coração.\" — Salmos 27:14");
          break;
        }
        const msg = [
          "PALAVRA DO DIA",
          "",
          `"${devotional.bible_passage}"`,
          "",
          `${devotional.bible_book} ${devotional.bible_chapter}:${devotional.bible_verse_start}`,
        ].join("\n");
        await sendWhatsAppMessage(from, msg);
        break;
      }

      case "EVENTOS": {
        const events = await listUpcomingEvents(5);
        if (!events || events.length === 0) {
          await sendWhatsAppMessage(from, "Nenhum evento programado nos próximos dias. Fique atento ao app SELAH para novidades.");
          break;
        }
        const lines = [
          "PROXIMOS EVENTOS — Casa de Oração",
          "",
          ...events.map((e) => {
            const date = new Date(e.start?.dateTime ?? e.start?.date ?? "");
            const dateStr = date.toLocaleDateString("pt-BR", {
              weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            });
            return `- ${e.summary} — ${dateStr}`;
          }),
          "",
          "Para adicionar à sua agenda: acesse o app SELAH > Eventos.",
        ];
        await sendWhatsAppMessage(from, lines.join("\n"));
        break;
      }

      case "ORACAO": {
        const supabase = await createServiceClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, status")
          .eq("whatsapp", from.replace("55", ""))
          .maybeSingle();

        if (!profile || profile.status !== "approved") {
          await sendWhatsAppMessage(
            from,
            "Para enviar pedidos de oração via WhatsApp, você precisa ter cadastro aprovado no app SELAH.\n\nAcesse: https://selah.app/register"
          );
          break;
        }

        const requestText = text.body
          .toLowerCase()
          .replace(/pedido.*de.*oração|oração|oracao|pedido/gi, "")
          .trim();

        if (requestText.length > 10) {
          await supabase.from("prayer_requests").insert({
            user_id: profile.id,
            text: requestText,
            is_public: true,
            via_whatsapp: true,
            status: "open",
          });
          await sendWhatsAppMessage(
            from,
            `Pedido de oração recebido, ${profile.full_name.split(" ")[0]}.\n\nA comunidade do SELAH estará intercedendo por você.\n\n"A oração eficaz do justo pode muito." — Tiago 5:16`
          );
        } else {
          await sendWhatsAppMessage(
            from,
            "Descreva seu pedido de oração na mensagem. Exemplo:\n\n'pedido de oração: preciso de sabedoria para uma decisão importante'"
          );
        }
        break;
      }

      case "AGENDAR": {
        const parsed = await parseScheduleRequest(text.body);
        if (!parsed) {
          await sendWhatsAppMessage(
            from,
            "Não consegui identificar a data e hora do compromisso. Tente assim:\n\n'Agendar culto de oração domingo às 10h'\n'Marcar reunião de célula sexta 20h'\n'Lembrete: RPM segunda-feira 19h30'"
          );
          break;
        }

        const event = await createCalendarEvent({
          title: parsed.title,
          dateTime: parsed.dateTime,
          description: parsed.description,
          durationMinutes: 60,
        });

        if (!event) {
          await sendWhatsAppMessage(from, "Não foi possível criar o evento. Tente novamente ou acesse o app SELAH > Eventos.");
          break;
        }

        const eventDate = new Date(parsed.dateTime);
        const dateStr = eventDate.toLocaleDateString("pt-BR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });

        await sendWhatsAppMessage(
          from,
          [
            "Compromisso agendado no Google Agenda.",
            "",
            `Evento: ${parsed.title}`,
            `Data: ${dateStr}`,
            "",
            "Você receberá um lembrete 30 minutos antes.",
          ].join("\n")
        );
        break;
      }

      default: {
        await sendWhatsAppMessage(from, buildMenuMessage());
      }
    }
  } catch (error) {
    console.error("WhatsApp bot error:", error);
    await sendWhatsAppMessage(
      from,
      "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente ou acesse o app SELAH diretamente."
    );
  }
}
