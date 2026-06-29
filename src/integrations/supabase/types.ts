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
      customers: {
        Row: {
          address: string | null
          created_at: string
          customer_id: number
          email: string | null
          full_name: string
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id?: number
          email?: string | null
          full_name: string
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: number
          email?: string | null
          full_name?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          employee_id: number
          employee_name: string
          position: string | null
          salary: number
        }
        Insert: {
          created_at?: string
          employee_id?: number
          employee_name: string
          position?: string | null
          salary?: number
        }
        Update: {
          created_at?: string
          employee_id?: number
          employee_name?: string
          position?: string | null
          salary?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          available_stock: number
          inventory_id: number
          last_updated: string
          product_id: number | null
        }
        Insert: {
          available_stock?: number
          inventory_id?: number
          last_updated?: string
          product_id?: number | null
        }
        Update: {
          available_stock?: number
          inventory_id?: number
          last_updated?: string
          product_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_details: {
        Row: {
          order_detail_id: number
          order_id: number
          product_id: number | null
          quantity: number
          unit_price: number
        }
        Insert: {
          order_detail_id?: number
          order_id: number
          product_id?: number | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          order_detail_id?: number
          order_id?: number
          product_id?: number | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: number | null
          order_date: string
          order_id: number
          order_status: string
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_id?: number | null
          order_date?: string
          order_id?: number
          order_status?: string
          total_amount?: number
        }
        Update: {
          created_at?: string
          customer_id?: number | null
          order_date?: string
          order_id?: number
          order_status?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          order_id: number
          payment_date: string
          payment_id: number
          payment_method: string | null
        }
        Insert: {
          amount?: number
          order_id: number
          payment_date?: string
          payment_id?: number
          payment_method?: string | null
        }
        Update: {
          amount?: number
          order_id?: number
          payment_date?: string
          payment_id?: number
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      production: {
        Row: {
          employee_id: number | null
          product_id: number | null
          production_date: string
          production_id: number
          quantity_produced: number
        }
        Insert: {
          employee_id?: number | null
          product_id?: number | null
          production_date?: string
          production_id?: number
          quantity_produced?: number
        }
        Update: {
          employee_id?: number | null
          product_id?: number | null
          production_date?: string
          production_id?: number
          quantity_produced?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "production_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          price: number
          product_id: number
          product_name: string
          stock_quantity: number
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          price?: number
          product_id?: number
          product_name: string
          stock_quantity?: number
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          price?: number
          product_id?: number
          product_name?: string
          stock_quantity?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      raw_materials: {
        Row: {
          cost: number
          created_at: string
          material_id: number
          material_name: string
          quantity_available: number
          supplier_id: number | null
        }
        Insert: {
          cost?: number
          created_at?: string
          material_id?: number
          material_name: string
          quantity_available?: number
          supplier_id?: number | null
        }
        Update: {
          cost?: number
          created_at?: string
          material_id?: number
          material_name?: string
          quantity_available?: number
          supplier_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string
          supplier_id: number
          supplier_name: string
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          supplier_id?: number
          supplier_name: string
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          supplier_id?: number
          supplier_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
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
      app_role: ["admin", "staff"],
    },
  },
} as const
