export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_alerts: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          dismissed: boolean
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          dismissed?: boolean
          id?: string
          read_at?: string | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          dismissed?: boolean
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_budgets: {
        Row: {
          bonus_brl: number
          cost_brl: number
          id: string
          period_end: string
          period_start: string
          tokens_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_brl?: number
          cost_brl?: number
          id?: string
          period_end: string
          period_start: string
          tokens_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_brl?: number
          cost_brl?: number
          id?: string
          period_end?: string
          period_start?: string
          tokens_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          completion_tokens: number
          created_at: string
          duration_ms: number | null
          feature: Database["public"]["Enums"]["ai_feature"]
          id: string
          model: string
          prompt_tokens: number
          provider: Database["public"]["Enums"]["ai_provider"]
          total_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string
          duration_ms?: number | null
          feature: Database["public"]["Enums"]["ai_feature"]
          id?: string
          model: string
          prompt_tokens?: number
          provider: Database["public"]["Enums"]["ai_provider"]
          total_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string
          duration_ms?: number | null
          feature?: Database["public"]["Enums"]["ai_feature"]
          id?: string
          model?: string
          prompt_tokens?: number
          provider?: Database["public"]["Enums"]["ai_provider"]
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bible_verses: {
        Row: {
          book: string
          chapter: number
          id: number
          text: string
          text_search: unknown
          verse: number
          version: Database["public"]["Enums"]["bible_version"]
        }
        Insert: {
          book: string
          chapter: number
          id?: number
          text: string
          text_search?: unknown
          verse: number
          version?: Database["public"]["Enums"]["bible_version"]
        }
        Update: {
          book?: string
          chapter?: number
          id?: number
          text?: string
          text_search?: unknown
          verse?: number
          version?: Database["public"]["Enums"]["bible_version"]
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          id: string
          notify: boolean
          psalm_ref: string | null
          psalm_text: string | null
          time: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          id?: string
          notify?: boolean
          psalm_ref?: string | null
          psalm_text?: string | null
          time?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notify?: boolean
          psalm_ref?: string | null
          psalm_text?: string | null
          time?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          bible_book: string
          bible_chapter: number
          bible_passage: string
          bible_verse_end: number | null
          bible_verse_start: number
          created_at: string
          date: string
          generated_by_ai: boolean
          id: string
          prayer_text: string | null
          reflection_text: string
          title: string
        }
        Insert: {
          bible_book: string
          bible_chapter: number
          bible_passage: string
          bible_verse_end?: number | null
          bible_verse_start: number
          created_at?: string
          date: string
          generated_by_ai?: boolean
          id?: string
          prayer_text?: string | null
          reflection_text: string
          title: string
        }
        Update: {
          bible_book?: string
          bible_chapter?: number
          bible_passage?: string
          bible_verse_end?: number | null
          bible_verse_start?: number
          created_at?: string
          date?: string
          generated_by_ai?: boolean
          id?: string
          prayer_text?: string | null
          reflection_text?: string
          title?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          created_at: string
          date_end: string | null
          date_start: string
          description: string | null
          google_calendar_event_id: string | null
          id: string
          image_url: string | null
          location: string | null
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          date_end?: string | null
          date_start: string
          description?: string | null
          google_calendar_event_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          date_end?: string | null
          date_start?: string
          description?: string | null
          google_calendar_event_id?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          color: string
          created_at: string
          id: string
          note: string | null
          user_id: string
          verse_id: number
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
          verse_id: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
          verse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_verse_id_fkey"
            columns: ["verse_id"]
            isOneToOne: false
            referencedRelation: "bible_verses"
            referencedColumns: ["id"]
          },
        ]
      }
      healthcheck_logs: {
        Row: {
          ai_analysis: string | null
          ai_recommendations: Json | null
          checks: Json | null
          created_at: string | null
          duration_ms: number | null
          errors_found: number | null
          fixes_applied: number | null
          id: string
          overall: string
          timestamp: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_recommendations?: Json | null
          checks?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          errors_found?: number | null
          fixes_applied?: number | null
          id?: string
          overall: string
          timestamp?: string
        }
        Update: {
          ai_analysis?: string | null
          ai_recommendations?: Json | null
          checks?: Json | null
          created_at?: string | null
          duration_ms?: number | null
          errors_found?: number | null
          fixes_applied?: number | null
          id?: string
          overall?: string
          timestamp?: string
        }
        Relationships: []
      }
      homenagens: {
        Row: {
          approved_at: string | null
          autor_instagram: string | null
          autor_legendario_numero: number | null
          autor_nome: string
          created_at: string
          foto_capa_index: number
          fotos: string[]
          homenageado_instagram: string | null
          homenageado_legendario: boolean
          homenageado_nome: string
          homenageado_parentesco: string
          id: string
          status: Database["public"]["Enums"]["homenagem_status"]
          texto: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          autor_instagram?: string | null
          autor_legendario_numero?: number | null
          autor_nome: string
          created_at?: string
          foto_capa_index?: number
          fotos?: string[]
          homenageado_instagram?: string | null
          homenageado_legendario?: boolean
          homenageado_nome: string
          homenageado_parentesco: string
          id?: string
          status?: Database["public"]["Enums"]["homenagem_status"]
          texto: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          autor_instagram?: string | null
          autor_legendario_numero?: number | null
          autor_nome?: string
          created_at?: string
          foto_capa_index?: number
          fotos?: string[]
          homenageado_instagram?: string | null
          homenageado_legendario?: boolean
          homenageado_nome?: string
          homenageado_parentesco?: string
          id?: string
          status?: Database["public"]["Enums"]["homenagem_status"]
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homenagens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          created_by: string
          default_permissions: string[]
          expires_at: string
          id: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          default_permissions?: string[]
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          default_permissions?: string[]
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          id: string
          read_at: string | null
          sent_at: string
          title: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          id?: string
          read_at?: string | null
          sent_at?: string
          title?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_requests: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          status: Database["public"]["Enums"]["prayer_status"]
          text: string
          user_id: string
          via_whatsapp: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          status?: Database["public"]["Enums"]["prayer_status"]
          text: string
          user_id: string
          via_whatsapp?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          status?: Database["public"]["Enums"]["prayer_status"]
          text?: string
          user_id?: string
          via_whatsapp?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prayer_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_budget_brl: number | null
          approved_at: string | null
          approved_by: string | null
          birth_date: string | null
          church_name: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          gender: Database["public"]["Enums"]["user_gender"] | null
          id: string
          instagram_handle: string | null
          is_legendario: boolean
          is_legendario_spouse: boolean
          last_seen_at: string | null
          legendario_number: number | null
          linkedin_url: string | null
          permissions: string[]
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          status: Database["public"]["Enums"]["user_status"]
          wants_to_be_legendario: boolean
          whatsapp: string | null
        }
        Insert: {
          ai_budget_brl?: number | null
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          church_name?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          gender?: Database["public"]["Enums"]["user_gender"] | null
          id: string
          instagram_handle?: string | null
          is_legendario?: boolean
          is_legendario_spouse?: boolean
          last_seen_at?: string | null
          legendario_number?: number | null
          linkedin_url?: string | null
          permissions?: string[]
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          wants_to_be_legendario?: boolean
          whatsapp?: string | null
        }
        Update: {
          ai_budget_brl?: number | null
          approved_at?: string | null
          approved_by?: string | null
          birth_date?: string | null
          church_name?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: Database["public"]["Enums"]["user_gender"] | null
          id?: string
          instagram_handle?: string | null
          is_legendario?: boolean
          is_legendario_spouse?: boolean
          last_seen_at?: string | null
          legendario_number?: number | null
          linkedin_url?: string | null
          permissions?: string[]
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          wants_to_be_legendario?: boolean
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          created_at: string
          id: number
          reset_at: string
        }
        Insert: {
          bucket: string
          count?: number
          created_at?: string
          id?: number
          reset_at: string
        }
        Update: {
          bucket?: string
          count?: number
          created_at?: string
          id?: number
          reset_at?: string
        }
        Relationships: []
      }
      testimonies: {
        Row: {
          approved: boolean
          content: string
          created_at: string
          id: string
          title: string
          type: Database["public"]["Enums"]["testimony_type"]
          user_id: string
        }
        Insert: {
          approved?: boolean
          content: string
          created_at?: string
          id?: string
          title: string
          type?: Database["public"]["Enums"]["testimony_type"]
          user_id: string
        }
        Update: {
          approved?: boolean
          content?: string
          created_at?: string
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["testimony_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metrics: {
        Row: {
          biblia_interactions: number
          consecutive_days: number
          date: string
          devocionais_read: number
          devocional_interactions: number
          estudo_interactions: number
          exegese_interactions: number
          id: string
          kairo_interactions: number
          oracao_interactions: number
          sections_visited: Json
          session_duration_seconds: number
          teologia_interactions: number
          user_id: string
          verses_favorited: number
        }
        Insert: {
          biblia_interactions?: number
          consecutive_days?: number
          date?: string
          devocionais_read?: number
          devocional_interactions?: number
          estudo_interactions?: number
          exegese_interactions?: number
          id?: string
          kairo_interactions?: number
          oracao_interactions?: number
          sections_visited?: Json
          session_duration_seconds?: number
          teologia_interactions?: number
          user_id: string
          verses_favorited?: number
        }
        Update: {
          biblia_interactions?: number
          consecutive_days?: number
          date?: string
          devocionais_read?: number
          devocional_interactions?: number
          estudo_interactions?: number
          exegese_interactions?: number
          id?: string
          kairo_interactions?: number
          oracao_interactions?: number
          sections_visited?: Json
          session_duration_seconds?: number
          teologia_interactions?: number
          user_id?: string
          verses_favorited?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      immutable_unaccent: { Args: { "": string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_approved: { Args: never; Returns: boolean }
      search_bible_verses: {
        Args: { p_limit?: number; p_query: string; p_version?: string }
        Returns: {
          book: string
          chapter: number
          headline: string
          id: number
          text: string
          verse: number
          version: Database["public"]["Enums"]["bible_version"]
        }[]
      }
    }
    Enums: {
      ai_feature:
        | "kairo"
        | "devocional_cron"
        | "devocional_interativo"
        | "biblia_busca"
        | "biblia_referencias"
        | "estudo"
        | "teologia"
        | "exegese"
        | "homenagens_reescrever"
        | "whatsapp_parse"
        | "healthcheck"
      ai_provider: "openai" | "anthropic"
      bible_version: "ARC" | "NVI" | "ARA" | "KJV"
      event_category: "culto" | "retiro" | "rpm" | "top" | "celula" | "outro"
      homenagem_status: "pending" | "approved" | "rejected"
      prayer_status: "open" | "answered" | "closed"
      testimony_type: "irmao" | "legendario" | "esposa_legendario"
      user_gender: "male" | "female"
      user_role: "user" | "admin"
      user_status: "pending" | "approved" | "rejected" | "banned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_feature: [
        "kairo",
        "devocional_cron",
        "devocional_interativo",
        "biblia_busca",
        "biblia_referencias",
        "estudo",
        "teologia",
        "exegese",
        "homenagens_reescrever",
        "whatsapp_parse",
        "healthcheck",
      ],
      ai_provider: ["openai", "anthropic"],
      bible_version: ["ARC", "NVI", "ARA", "KJV"],
      event_category: ["culto", "retiro", "rpm", "top", "celula", "outro"],
      homenagem_status: ["pending", "approved", "rejected"],
      prayer_status: ["open", "answered", "closed"],
      testimony_type: ["irmao", "legendario", "esposa_legendario"],
      user_gender: ["male", "female"],
      user_role: ["user", "admin"],
      user_status: ["pending", "approved", "rejected", "banned"],
    },
  },
} as const

// ─── Helper exports do projeto ────────────────────────────────────────────────
export type Profile        = Tables<"profiles">
export type Invitation     = Tables<"invitations">
export type Event          = Tables<"events">
export type Homenagem      = Tables<"homenagens">
export type PrayerRequest  = Tables<"prayer_requests">
export type Testimony      = Tables<"testimonies">
export type Devotional     = Tables<"devotionals">
export type Notification   = Tables<"notifications">
export type AiFeature      = Database["public"]["Enums"]["ai_feature"]
export type AiProvider     = Database["public"]["Enums"]["ai_provider"]
export type UserRole       = Database["public"]["Enums"]["user_role"]
export type UserStatus     = Database["public"]["Enums"]["user_status"]
export type UserGender     = Database["public"]["Enums"]["user_gender"]
export type EventCategory  = Database["public"]["Enums"]["event_category"]
export type BibleVersion   = Database["public"]["Enums"]["bible_version"]
export type HomenagemStatus = Database["public"]["Enums"]["homenagem_status"]
export type PrayerStatus   = Database["public"]["Enums"]["prayer_status"]
export type TestimonyType  = Database["public"]["Enums"]["testimony_type"]
