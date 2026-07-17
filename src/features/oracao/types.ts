import type { Tables } from "@/types/database";

export type PrayerRequest = Tables<"prayer_requests"> & {
  profile?: {
    full_name: string | null;
    church_name: string | null;
    city: string | null;
  } | null;
};

export type PrayerStatus = "open" | "answered" | "closed";

export interface NewPrayerRequest {
  user_id: string;
  text: string;
  is_public: boolean;
  via_whatsapp?: boolean;
}
