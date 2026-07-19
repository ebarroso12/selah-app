export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  date: string;
  time: string;
  description: string | null;
  psalm_ref: string | null;
  psalm_text: string | null;
  notify: boolean;
  created_at: string;
}

export interface NewCalendarEvent {
  title: string;
  date: string;
  time?: string;
  description?: string | null;
  psalm_ref?: string | null;
  psalm_text?: string | null;
  notify?: boolean;
}
