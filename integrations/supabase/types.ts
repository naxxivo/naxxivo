export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      manual_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: number
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          sender_details: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
          order_id: string | null
          payment_method: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          id?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          sender_details: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
          order_id?: string | null
          payment_method: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          id?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          sender_details?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
          order_id?: string | null
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payments_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["order_payment_status"]
          order_status: Database["public"]["Enums"]["order_status"]
          shipping_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          order_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
          order_status?: Database["public"]["Enums"]["order_status"]
          shipping_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_quantity: number
          updated_at: string
          original_price: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          stock_quantity?: number
          updated_at?: string
          original_price?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock_quantity?: number
          updated_at?: string
          original_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          photo_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          is_admin: boolean | null
        }
        Insert: {
          id: string
          name?: string | null
          photo_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          name?: string | null
          photo_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          is_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          comment?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          address_line1: string
          address_line2: string | null
          city: string
          postal_code: string
          country: string
          phone_number: string
          is_default: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          address_line1: string
          address_line2?: string | null
          city: string
          postal_code: string
          country: string
          phone_number: string
          is_default?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          postal_code?: string
          country?: string
          phone_number?: string
          is_default?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Enums: {
      notification_type: "follow" | "like" | "comment" | "mention" | "system"
      order_payment_status: "pending" | "paid" | "failed" | "refunded"
      order_status:
        | "pending_payment"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payment_method: "credit_card" | "paypal" | "bank_transfer"
      payment_status: "pending" | "completed" | "failed"
      xp_product_type: "subscription" | "one_time" | "cosmetic"
    }
    Functions: {
      approve_payment: {
        Args: {
          p_payment_id: number
        }
        Returns: undefined
      }
      create_order_from_cart: {
        Args: Record<string, unknown>
        Returns: string
      }
      create_order_from_single_product: {
        Args: {
          p_product_id: string
          p_address_id: string
        }
        Returns: string
      }
      reject_payment: {
        Args: {
          p_payment_id: number
          p_admin_notes: string
        }
        Returns: undefined
      }
    }
  }
}
