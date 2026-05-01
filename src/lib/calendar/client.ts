const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json();
  return data.access_token as string;
}

export interface CalendarEventInput {
  title: string;
  dateTime: string;
  description?: string;
  durationMinutes?: number;
  location?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent | null> {
  try {
    const token = await getAccessToken();
    const start = new Date(input.dateTime);
    const end = new Date(start.getTime() + (input.durationMinutes ?? 60) * 60 * 1000);

    const body = {
      summary: input.title,
      description: input.description ?? "Criado via SELAH WhatsApp",
      location: input.location,
      start: { dateTime: start.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: end.toISOString(), timeZone: "America/Sao_Paulo" },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 },
          { method: "email", minutes: 60 },
        ],
      },
    };

    const response = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function listUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
  try {
    const token = await getAccessToken();
    const now = new Date().toISOString();

    const response = await fetch(
      `${CALENDAR_API}/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!)}/events?` +
        new URLSearchParams({
          timeMin: now,
          maxResults: String(maxResults),
          singleEvents: "true",
          orderBy: "startTime",
        }),
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) return [];
    const data = await response.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function addEventToUserCalendar(
  userRefreshToken: string,
  event: CalendarEventInput
): Promise<CalendarEvent | null> {
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: userRefreshToken,
        grant_type: "refresh_token",
      }),
    });
    const { access_token } = await tokenRes.json();
    const start = new Date(event.dateTime);
    const end = new Date(start.getTime() + (event.durationMinutes ?? 60) * 60 * 1000);

    const response = await fetch(
      `${CALENDAR_API}/calendars/primary/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: { dateTime: start.toISOString(), timeZone: "America/Sao_Paulo" },
          end: { dateTime: end.toISOString(), timeZone: "America/Sao_Paulo" },
          reminders: { useDefault: true },
        }),
      }
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
