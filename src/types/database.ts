export type UserGender = "male" | "female";
export type UserStatus = "pending" | "approved" | "rejected" | "banned";
export type TestimonyType = "irmao" | "legendario" | "esposa_legendario";
export type EventCategory = "culto" | "retiro" | "rpm" | "top" | "celula" | "outro";
export type PrayerStatus = "open" | "answered" | "closed";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  whatsapp: string | null;
  photo_url: string | null;
  church_name: string;
  city: string;
  state: string;
  gender: UserGender;
  is_legendario: boolean;
  is_legendario_spouse: boolean;
  status: UserStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface UserMetrics {
  id: string;
  user_id: string;
  date: string;
  session_duration_seconds: number;
  sections_visited: Record<string, number>;
  devocionais_read: number;
  verses_favorited: number;
  consecutive_days: number;
}

export interface Devotional {
  id: string;
  date: string;
  bible_book: string;
  bible_chapter: number;
  bible_verse_start: number;
  bible_verse_end: number | null;
  bible_passage: string;
  title: string;
  reflection_text: string;
  prayer_text: string | null;
  generated_by_ai: boolean;
  created_at: string;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  text: string;
  is_public: boolean;
  via_whatsapp: boolean;
  status: PrayerStatus;
  created_at: string;
  profile?: Pick<Profile, "full_name" | "photo_url" | "church_name"> | null;
}

export interface Testimony {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: TestimonyType;
  approved: boolean;
  created_at: string;
  profile?: Pick<Profile, "full_name" | "photo_url" | "church_name" | "city"> | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  location: string | null;
  google_calendar_event_id: string | null;
  category: EventCategory;
  image_url: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  color: string;
  note: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  url: string | null;
  sent_at: string;
  read_at: string | null;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

// Supabase Database type — format required by @supabase/supabase-js
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "last_seen_at"> & { created_at?: string; last_seen_at?: string | null };
        Update: Partial<Profile>;
        Relationships: [];
      };
      user_metrics: {
        Row: UserMetrics;
        Insert: Omit<UserMetrics, "id"> & { id?: string };
        Update: Partial<UserMetrics>;
        Relationships: [];
      };
      devotionals: {
        Row: Devotional;
        Insert: Omit<Devotional, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Devotional>;
        Relationships: [];
      };
      prayer_requests: {
        Row: PrayerRequest;
        Insert: Omit<PrayerRequest, "id" | "created_at" | "profile"> & { id?: string; created_at?: string };
        Update: Partial<Omit<PrayerRequest, "profile">>;
        Relationships: [];
      };
      testimonies: {
        Row: Testimony;
        Insert: Omit<Testimony, "id" | "created_at" | "profile"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Testimony, "profile">>;
        Relationships: [];
      };
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Event>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Favorite>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id"> & { id?: string };
        Update: Partial<Notification>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: PushSubscription;
        Insert: Omit<PushSubscription, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<PushSubscription>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_gender: UserGender;
      user_status: UserStatus;
      testimony_type: TestimonyType;
      event_category: EventCategory;
      prayer_status: PrayerStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
