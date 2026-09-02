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
      activity_log: {
        Row: {
          action: string
          client_id: string
          created_at: string
          details: string | null
          id: string
          performed_by: string
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string
          details?: string | null
          id?: string
          performed_by: string
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string
          details?: string | null
          id?: string
          performed_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string
          actor_name: string | null
          created_at: string
          details: Json | null
          entity_type: string
          id: string
          target_id: string | null
          target_name: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          entity_type: string
          id?: string
          target_id?: string | null
          target_name?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_name?: string | null
          created_at?: string
          details?: Json | null
          entity_type?: string
          id?: string
          target_id?: string | null
          target_name?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          agency_user_id: string
          auto_generated_password: string | null
          brand_color: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          instagram_handle: string | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          portal_slug: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          agency_user_id: string
          auto_generated_password?: string | null
          brand_color?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          portal_slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          agency_user_id?: string
          auto_generated_password?: string | null
          brand_color?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          portal_slug?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      content_plans: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          approved_at: string | null
          approved_by_client: boolean | null
          caption: string | null
          content_plan_id: string
          created_at: string
          creator_id: string | null
          engagement_comments: number | null
          engagement_likes: number | null
          engagement_reach: number | null
          id: string
          media_url: string | null
          notes: string | null
          platform: string | null
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_client?: boolean | null
          caption?: string | null
          content_plan_id: string
          created_at?: string
          creator_id?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_reach?: number | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string | null
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by_client?: boolean | null
          caption?: string | null
          content_plan_id?: string
          created_at?: string
          creator_id?: string | null
          engagement_comments?: number | null
          engagement_likes?: number | null
          engagement_reach?: number | null
          id?: string
          media_url?: string | null
          notes?: string | null
          platform?: string | null
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_content_plan_id_fkey"
            columns: ["content_plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          avatar_url: string | null
          category: string | null
          created_at: string
          email: string | null
          followers: number | null
          handle: string | null
          id: string
          name: string
          notes: string | null
          platform: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          name: string
          notes?: string | null
          platform?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          followers?: number | null
          handle?: string | null
          id?: string
          name?: string
          notes?: string | null
          platform?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_requests: {
        Row: {
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_signatures: {
        Row: {
          document_id: string
          id: string
          ip_address: string | null
          signature_image_url: string | null
          signed_at: string
          signer_email: string | null
          signer_name: string
          typed_signature: string | null
        }
        Insert: {
          document_id: string
          id?: string
          ip_address?: string | null
          signature_image_url?: string | null
          signed_at?: string
          signer_email?: string | null
          signer_name: string
          typed_signature?: string | null
        }
        Update: {
          document_id?: string
          id?: string
          ip_address?: string | null
          signature_image_url?: string | null
          signed_at?: string
          signer_email?: string | null
          signer_name?: string
          typed_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by: string
          doc_type: Database["public"]["Enums"]["doc_type"]
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          doc_type?: Database["public"]["Enums"]["doc_type"]
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_fillable: boolean
          client_id: string
          content: Json
          created_at: string
          created_by: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_name: string | null
          file_url: string | null
          id: string
          status: Database["public"]["Enums"]["doc_status"]
          submitted_at: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          client_fillable?: boolean
          client_id: string
          content?: Json
          created_at?: string
          created_by?: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          submitted_at?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          client_fillable?: boolean
          client_id?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          file_name?: string | null
          file_url?: string | null
          id?: string
          status?: Database["public"]["Enums"]["doc_status"]
          submitted_at?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          advance_payment_due: number | null
          amount: number
          bank_details: Json | null
          client_id: string
          created_at: string
          created_by: string
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string | null
          line_items: Json
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          project_id: string | null
          recurring_interval: string | null
          remaining_balance: number | null
          status: string | null
          subtotal: number | null
          terms_text: string | null
          updated_at: string
        }
        Insert: {
          advance_payment_due?: number | null
          amount?: number
          bank_details?: Json | null
          client_id: string
          created_at?: string
          created_by: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string | null
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          recurring_interval?: string | null
          remaining_balance?: number | null
          status?: string | null
          subtotal?: number | null
          terms_text?: string | null
          updated_at?: string
        }
        Update: {
          advance_payment_due?: number | null
          amount?: number
          bank_details?: Json | null
          client_id?: string
          created_at?: string
          created_by?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string | null
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string | null
          recurring_interval?: string | null
          remaining_balance?: number | null
          status?: string | null
          subtotal?: number | null
          terms_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          id: string
          points: number
          reason: string
          type: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          id?: string
          points?: number
          reason: string
          type?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          id?: string
          points?: number
          reason?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      member_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          invited_by: string
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          invited_by: string
          role?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          invited_by?: string
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_onboarding: {
        Row: {
          created_at: string
          dismissed: boolean
          first_upload_completed: boolean
          id: string
          profile_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed?: boolean
          first_upload_completed?: boolean
          id?: string
          profile_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed?: boolean
          first_upload_completed?: boolean
          id?: string
          profile_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          priority: string | null
          service_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          priority?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_client_id: string | null
          created_at: string
          created_by: string
          id: string
          points_awarded: number | null
          referred_email: string | null
          referred_name: string
          referred_phone: string | null
          referrer_client_id: string
          status: string
          updated_at: string
        }
        Insert: {
          converted_client_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          points_awarded?: number | null
          referred_email?: string | null
          referred_name: string
          referred_phone?: string | null
          referrer_client_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          converted_client_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          points_awarded?: number | null
          referred_email?: string | null
          referred_name?: string
          referred_phone?: string | null
          referrer_client_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_converted_client_id_fkey"
            columns: ["converted_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_client_id_fkey"
            columns: ["referrer_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          name: string
          price: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          name: string
          price?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      work_items: {
        Row: {
          created_at: string
          deliverable_name: string | null
          deliverable_url: string | null
          description: string | null
          id: string
          member_id: string
          project_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliverable_name?: string | null
          deliverable_url?: string | null
          description?: string | null
          id?: string
          member_id: string
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliverable_name?: string | null
          deliverable_url?: string | null
          description?: string | null
          id?: string
          member_id?: string
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_agency_staff: { Args: never; Returns: boolean }
      is_client_owner: { Args: { _client_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "worker" | "client"
      doc_status:
        | "draft"
        | "sent"
        | "awaiting_signature"
        | "signed"
        | "paid"
        | "completed"
      doc_type:
        | "inquiry_form"
        | "agreement"
        | "invoice"
        | "welcome_document"
        | "welcome_email"
        | "questionnaire"
        | "client_portal_summary"
        | "proposal"
        | "strategy_kpi"
        | "content_calendar"
        | "content_creation_notes"
        | "monthly_analytics"
        | "feedback_form"
        | "file_attachment"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "worker", "client"],
      doc_status: [
        "draft",
        "sent",
        "awaiting_signature",
        "signed",
        "paid",
        "completed",
      ],
      doc_type: [
        "inquiry_form",
        "agreement",
        "invoice",
        "welcome_document",
        "welcome_email",
        "questionnaire",
        "client_portal_summary",
        "proposal",
        "strategy_kpi",
        "content_calendar",
        "content_creation_notes",
        "monthly_analytics",
        "feedback_form",
        "file_attachment",
      ],
    },
  },
} as const
