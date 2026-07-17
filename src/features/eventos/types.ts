import type { Tables, Database } from "@/types/database";

export type Event = Tables<"events">;
export type EventCategory = Database["public"]["Enums"]["event_category"];

export interface NewEvent {
  title: string;
  category: EventCategory;
  date_start: string;
  date_end?: string | null;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
}

export type UpdateEvent = Partial<NewEvent>;
