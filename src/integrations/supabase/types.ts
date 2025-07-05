export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      authorized_students: {
        Row: {
          created_at: string
          id: string
          name: string
          roll_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          roll_number: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          roll_number?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          added_date: string
          available: number
          category: string
          condition: string
          created_at: string
          id: string
          name: string
          notes: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          added_date?: string
          available?: number
          category: string
          condition?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Update: {
          added_date?: string
          available?: number
          category?: string
          condition?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          created_at: string
          id: string
          issue_date: string
          item_id: string
          item_name: string
          notes: string | null
          phone_number: string
          return_date: string | null
          room_number: string
          status: string
          student_id: string
          student_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_date?: string
          item_id: string
          item_name: string
          notes?: string | null
          phone_number: string
          return_date?: string | null
          room_number: string
          status?: string
          student_id: string
          student_name: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_date?: string
          item_id?: string
          item_name?: string
          notes?: string | null
          phone_number?: string
          return_date?: string | null
          room_number?: string
          status?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "issues_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          type?: string
        }
        Relationships: []
      }
      return_requests: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          item_id: string | null
          item_name: string | null
          notes: string | null
          request_date: string
          status: string
          student_id: string | null
          student_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          item_id?: string | null
          item_name?: string | null
          notes?: string | null
          request_date?: string
          status?: string
          student_id?: string | null
          student_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          item_id?: string | null
          item_name?: string | null
          notes?: string | null
          request_date?: string
          status?: string
          student_id?: string | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          created_at: string
          from_user_id: string
          from_user_name: string
          id: string
          item_id: string
          item_name: string
          notes: string | null
          request_date: string
          status: string
          to_user_id: string
          to_user_name: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          from_user_name: string
          id?: string
          item_id: string
          item_name: string
          notes?: string | null
          request_date?: string
          status?: string
          to_user_id: string
          to_user_name: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          from_user_name?: string
          id?: string
          item_id?: string
          item_name?: string
          notes?: string | null
          request_date?: string
          status?: string
          to_user_id?: string
          to_user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          phone_number: string
          registered_date: string
          roll_number: string
          room_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          phone_number: string
          registered_date?: string
          roll_number: string
          room_number: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          phone_number?: string
          registered_date?: string
          roll_number?: string
          room_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
