export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      collaborators: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          invited_by: string
          status: Database["public"]["Enums"]["collaborator_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          invited_by: string
          status?: Database["public"]["Enums"]["collaborator_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          invited_by?: string
          status?: Database["public"]["Enums"]["collaborator_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          accessibility_features:
            | Database["public"]["Enums"]["accessibility_feature"][]
            | null
          address: string | null
          category: Database["public"]["Enums"]["company_category"]
          city: string | null
          cnpj: string
          created_at: string | null
          description: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          name: string
          owner_id: string
          state: string | null
          tiktok: string | null
          updated_at: string | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          accessibility_features?:
            | Database["public"]["Enums"]["accessibility_feature"][]
            | null
          address?: string | null
          category: Database["public"]["Enums"]["company_category"]
          city?: string | null
          cnpj: string
          created_at?: string | null
          description?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          name: string
          owner_id: string
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          accessibility_features?:
            | Database["public"]["Enums"]["accessibility_feature"][]
            | null
          address?: string | null
          category?: Database["public"]["Enums"]["company_category"]
          city?: string | null
          cnpj?: string
          created_at?: string | null
          description?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          name?: string
          owner_id?: string
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_photos: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          is_cover: boolean | null
          order_index: number | null
          storage_path: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          is_cover?: boolean | null
          order_index?: number | null
          storage_path: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          is_cover?: boolean | null
          order_index?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          collaborator_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          review_id: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          review_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          collaborator_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          review_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "collaborators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_needs:
            | Database["public"]["Enums"]["user_accessibility_need"][]
            | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          accessibility_needs?:
            | Database["public"]["Enums"]["user_accessibility_need"][]
            | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          accessibility_needs?:
            | Database["public"]["Enums"]["user_accessibility_need"][]
            | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          company_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      accessibility_feature:
        | "rampa"
        | "elevador"
        | "banheiro_adaptado"
        | "vaga_pcd"
        | "piso_tatil"
        | "libras"
        | "braille"
        | "cadeira_rodas"
        | "audiodescricao"
        | "entrada_acessivel"
      collaborator_status: "pending" | "accepted" | "declined"
      company_category:
        | "hotel"
        | "hostel"
        | "pousada"
        | "bar"
        | "restaurante"
        | "cafe"
        | "espaco_eventos"
        | "passeio_turistico"
        | "museu"
        | "parque"
        | "academia"
        | "clinica"
        | "outros"
      notification_status: "unread" | "read"
      notification_type:
        | "company_invite"
        | "invite_accepted"
        | "invite_declined"
        | "company_edited"
        | "new_review"
      user_accessibility_need:
        | "visual"
        | "auditiva"
        | "motora"
        | "intelectual"
        | "tea"
        | "neurodivergencia"
        | "nenhuma"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      accessibility_feature: [
        "rampa", "elevador", "banheiro_adaptado", "vaga_pcd", "piso_tatil",
        "libras", "braille", "cadeira_rodas", "audiodescricao", "entrada_acessivel",
      ],
      collaborator_status: ["pending", "accepted", "declined"],
      company_category: [
        "hotel", "hostel", "pousada", "bar", "restaurante", "cafe",
        "espaco_eventos", "passeio_turistico", "museu", "parque",
        "academia", "clinica", "outros",
      ],
      notification_status: ["unread", "read"],
      notification_type: [
        "company_invite", "invite_accepted", "invite_declined",
        "company_edited", "new_review",
      ],
      user_accessibility_need: [
        "visual", "auditiva", "motora", "intelectual",
        "tea", "neurodivergencia", "nenhuma",
      ],
    },
  },
} as const
