import type { Tables, Database } from "@/types/database";

export type Homenagem = Tables<"homenagens">;
export type HomenagemStatus = Database["public"]["Enums"]["homenagem_status"];

export interface NewHomenagemPayload {
  user_id: string;
  autor_nome: string;
  autor_instagram?: string | null;
  autor_legendario_numero?: number | null;
  homenageado_nome: string;
  homenageado_parentesco: string;
  homenageado_instagram?: string | null;
  homenageado_legendario: boolean;
  texto: string;
  fotos: string[];
  foto_capa_index: number;
}
