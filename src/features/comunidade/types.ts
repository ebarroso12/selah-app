import type { Tables, Database } from "@/types/database";

export type TestimonyType = Database["public"]["Enums"]["testimony_type"];

export type Testimony = Tables<"testimonies"> & {
  profile?: {
    full_name: string | null;
    photo_url?: string | null;
    church_name: string | null;
    city: string | null;
  } | null;
};

export interface NewTestimony {
  user_id: string;
  title: string;
  content: string;
  type: TestimonyType;
}

export interface ListApprovedOptions {
  type?: TestimonyType;
  limit?: number;
}
