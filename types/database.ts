export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      agent_versions: {
        Row: {
          agent_id: string;
          config: Json;
          created_at: string;
          created_by: string | null;
          id: string;
          notes: string | null;
          published_at: string | null;
          status: Database["public"]["Enums"]["version_status"];
          tenant_id: string;
          version: number;
        };
        Insert: {
          agent_id: string;
          config: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["version_status"];
          tenant_id: string;
          version: number;
        };
        Update: {
          agent_id?: string;
          config?: Json;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          notes?: string | null;
          published_at?: string | null;
          status?: Database["public"]["Enums"]["version_status"];
          tenant_id?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "agent_versions_agent_id_tenant_id_fkey";
            columns: ["agent_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      agents: {
        Row: {
          created_at: string;
          id: string;
          live_version_id: string | null;
          name: string;
          status: Database["public"]["Enums"]["agent_status"];
          template: Database["public"]["Enums"]["agent_template"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          live_version_id?: string | null;
          name: string;
          status?: Database["public"]["Enums"]["agent_status"];
          template: Database["public"]["Enums"]["agent_template"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          live_version_id?: string | null;
          name?: string;
          status?: Database["public"]["Enums"]["agent_status"];
          template?: Database["public"]["Enums"]["agent_template"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_live_version_fk";
            columns: ["live_version_id", "id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id", "agent_id"];
          },
          {
            foreignKeyName: "agents_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          agent_id: string | null;
          agent_version_id: string | null;
          channel: Database["public"]["Enums"]["channel_kind"];
          closed_at: string | null;
          contact_name: string | null;
          contact_phone: string;
          id: string;
          last_message_at: string;
          outcome: Database["public"]["Enums"]["outcome_tag"] | null;
          phone_number_id: string | null;
          started_at: string;
          state: Database["public"]["Enums"]["conversation_state"];
          summary: string | null;
          taken_over_by: string | null;
          tenant_id: string;
          trigger_call_sid: string | null;
        };
        Insert: {
          agent_id?: string | null;
          agent_version_id?: string | null;
          channel: Database["public"]["Enums"]["channel_kind"];
          closed_at?: string | null;
          contact_name?: string | null;
          contact_phone: string;
          id?: string;
          last_message_at?: string;
          outcome?: Database["public"]["Enums"]["outcome_tag"] | null;
          phone_number_id?: string | null;
          started_at?: string;
          state?: Database["public"]["Enums"]["conversation_state"];
          summary?: string | null;
          taken_over_by?: string | null;
          tenant_id: string;
          trigger_call_sid?: string | null;
        };
        Update: {
          agent_id?: string | null;
          agent_version_id?: string | null;
          channel?: Database["public"]["Enums"]["channel_kind"];
          closed_at?: string | null;
          contact_name?: string | null;
          contact_phone?: string;
          id?: string;
          last_message_at?: string;
          outcome?: Database["public"]["Enums"]["outcome_tag"] | null;
          phone_number_id?: string | null;
          started_at?: string;
          state?: Database["public"]["Enums"]["conversation_state"];
          summary?: string | null;
          taken_over_by?: string | null;
          tenant_id?: string;
          trigger_call_sid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_tenant_id_fkey";
            columns: ["agent_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "conversations_agent_version_id_fkey";
            columns: ["agent_version_id"];
            isOneToOne: false;
            referencedRelation: "agent_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_phone_number_id_tenant_id_fkey";
            columns: ["phone_number_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "phone_numbers";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_items: {
        Row: {
          agent_id: string | null;
          content: string;
          created_at: string;
          embedding: string | null;
          enabled: boolean;
          id: string;
          kind: Database["public"]["Enums"]["knowledge_kind"];
          sort_order: number;
          source_url: string | null;
          tenant_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          agent_id?: string | null;
          content: string;
          created_at?: string;
          embedding?: string | null;
          enabled?: boolean;
          id?: string;
          kind: Database["public"]["Enums"]["knowledge_kind"];
          sort_order?: number;
          source_url?: string | null;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          agent_id?: string | null;
          content?: string;
          created_at?: string;
          embedding?: string | null;
          enabled?: boolean;
          id?: string;
          kind?: Database["public"]["Enums"]["knowledge_kind"];
          sort_order?: number;
          source_url?: string | null;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_items_agent_id_tenant_id_fkey";
            columns: ["agent_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "knowledge_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          address: string | null;
          conversation_id: string | null;
          created_at: string;
          email: string | null;
          estimated_value_cents: number | null;
          fields: Json;
          id: string;
          name: string | null;
          phone: string | null;
          service_needed: string | null;
          status: Database["public"]["Enums"]["lead_status"];
          tenant_id: string;
          updated_at: string;
          urgency: string | null;
        };
        Insert: {
          address?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_value_cents?: number | null;
          fields?: Json;
          id?: string;
          name?: string | null;
          phone?: string | null;
          service_needed?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          tenant_id: string;
          updated_at?: string;
          urgency?: string | null;
        };
        Update: {
          address?: string | null;
          conversation_id?: string | null;
          created_at?: string;
          email?: string | null;
          estimated_value_cents?: number | null;
          fields?: Json;
          id?: string;
          name?: string | null;
          phone?: string | null;
          service_needed?: string | null;
          status?: Database["public"]["Enums"]["lead_status"];
          tenant_id?: string;
          updated_at?: string;
          urgency?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_tenant_id_fkey";
            columns: ["conversation_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "leads_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          delivery_status: string | null;
          direction: Database["public"]["Enums"]["msg_direction"];
          error_code: string | null;
          id: string;
          segments: number | null;
          sender: Database["public"]["Enums"]["msg_sender"];
          sent_by_user: string | null;
          tenant_id: string;
          twilio_sid: string | null;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          delivery_status?: string | null;
          direction: Database["public"]["Enums"]["msg_direction"];
          error_code?: string | null;
          id?: string;
          segments?: number | null;
          sender: Database["public"]["Enums"]["msg_sender"];
          sent_by_user?: string | null;
          tenant_id: string;
          twilio_sid?: string | null;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          delivery_status?: string | null;
          direction?: Database["public"]["Enums"]["msg_direction"];
          error_code?: string | null;
          id?: string;
          segments?: number | null;
          sender?: Database["public"]["Enums"]["msg_sender"];
          sent_by_user?: string | null;
          tenant_id?: string;
          twilio_sid?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_tenant_id_fkey";
            columns: ["conversation_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id", "tenant_id"];
          },
        ];
      };
      phone_numbers: {
        Row: {
          a2p_notes: string | null;
          a2p_status: Database["public"]["Enums"]["a2p_status"];
          active: boolean;
          agent_id: string | null;
          created_at: string;
          e164: string;
          forwarded_from_e164: string | null;
          forwarding_verified_at: string | null;
          id: string;
          messaging_service_sid: string | null;
          source: Database["public"]["Enums"]["number_source"];
          tenant_id: string;
          twilio_sid: string | null;
          updated_at: string;
        };
        Insert: {
          a2p_notes?: string | null;
          a2p_status?: Database["public"]["Enums"]["a2p_status"];
          active?: boolean;
          agent_id?: string | null;
          created_at?: string;
          e164: string;
          forwarded_from_e164?: string | null;
          forwarding_verified_at?: string | null;
          id?: string;
          messaging_service_sid?: string | null;
          source?: Database["public"]["Enums"]["number_source"];
          tenant_id: string;
          twilio_sid?: string | null;
          updated_at?: string;
        };
        Update: {
          a2p_notes?: string | null;
          a2p_status?: Database["public"]["Enums"]["a2p_status"];
          active?: boolean;
          agent_id?: string | null;
          created_at?: string;
          e164?: string;
          forwarded_from_e164?: string | null;
          forwarding_verified_at?: string | null;
          id?: string;
          messaging_service_sid?: string | null;
          source?: Database["public"]["Enums"]["number_source"];
          tenant_id?: string;
          twilio_sid?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "phone_numbers_agent_id_tenant_id_fkey";
            columns: ["agent_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "phone_numbers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      sms_opt_outs: {
        Row: {
          contact_phone: string;
          keyword: string | null;
          opted_in_at: string | null;
          opted_out_at: string;
          tenant_id: string;
        };
        Insert: {
          contact_phone: string;
          keyword?: string | null;
          opted_in_at?: string | null;
          opted_out_at?: string;
          tenant_id: string;
        };
        Update: {
          contact_phone?: string;
          keyword?: string | null;
          opted_in_at?: string | null;
          opted_out_at?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sms_opt_outs_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_members: {
        Row: {
          created_at: string;
          role: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role?: Database["public"]["Enums"]["member_role"];
          tenant_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: Database["public"]["Enums"]["member_role"];
          tenant_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          avg_job_value_cents: number | null;
          business_hours: Json;
          created_at: string;
          id: string;
          kind: Database["public"]["Enums"]["tenant_kind"];
          name: string;
          owner_alert_email: string | null;
          owner_alert_phone: string | null;
          parent_tenant_id: string | null;
          settings: Json;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          avg_job_value_cents?: number | null;
          business_hours?: Json;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["tenant_kind"];
          name: string;
          owner_alert_email?: string | null;
          owner_alert_phone?: string | null;
          parent_tenant_id?: string | null;
          settings?: Json;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          avg_job_value_cents?: number | null;
          business_hours?: Json;
          created_at?: string;
          id?: string;
          kind?: Database["public"]["Enums"]["tenant_kind"];
          name?: string;
          owner_alert_email?: string | null;
          owner_alert_phone?: string | null;
          parent_tenant_id?: string | null;
          settings?: Json;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenants_parent_tenant_id_fkey";
            columns: ["parent_tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_events: {
        Row: {
          agent_id: string | null;
          conversation_id: string | null;
          id: number;
          kind: Database["public"]["Enums"]["usage_kind"];
          metadata: Json;
          model: string | null;
          occurred_at: string;
          quantity: number;
          tenant_id: string;
          unit_cost_usd: number | null;
        };
        Insert: {
          agent_id?: string | null;
          conversation_id?: string | null;
          id?: never;
          kind: Database["public"]["Enums"]["usage_kind"];
          metadata?: Json;
          model?: string | null;
          occurred_at?: string;
          quantity: number;
          tenant_id: string;
          unit_cost_usd?: number | null;
        };
        Update: {
          agent_id?: string | null;
          conversation_id?: string | null;
          id?: never;
          kind?: Database["public"]["Enums"]["usage_kind"];
          metadata?: Json;
          model?: string | null;
          occurred_at?: string;
          quantity?: number;
          tenant_id?: string;
          unit_cost_usd?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "usage_events_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "usage_events_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "usage_events_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_business: {
        Args: { p_name: string; p_timezone?: string };
        Returns: string;
      };
    };
    Enums: {
      a2p_status: "not_started" | "pending" | "approved" | "rejected";
      agent_status: "draft" | "active" | "paused" | "archived";
      agent_template: "missed_call_textback" | "receptionist" | "custom";
      channel_kind: "voice" | "sms" | "web_chat";
      conversation_state: "ai_active" | "human_takeover" | "closed";
      knowledge_kind:
        | "faq"
        | "service"
        | "web_page"
        | "document"
        | "pricing"
        | "hours"
        | "service_area"
        | "correction"
        | "other";
      lead_status: "new" | "contacted" | "booked" | "won" | "lost";
      member_role: "agency_admin" | "owner" | "staff";
      msg_direction: "inbound" | "outbound";
      msg_sender: "contact" | "ai" | "human" | "system";
      number_source: "provisioned" | "ported";
      outcome_tag:
        | "booked"
        | "lead"
        | "faq"
        | "spam"
        | "transferred"
        | "no_response"
        | "other";
      tenant_kind: "agency" | "business";
      usage_kind:
        | "sms_out_segment"
        | "sms_in_segment"
        | "voice_minute"
        | "llm_input_tokens"
        | "llm_output_tokens"
        | "phone_number_month";
      version_status: "draft" | "live" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      a2p_status: ["not_started", "pending", "approved", "rejected"],
      agent_status: ["draft", "active", "paused", "archived"],
      agent_template: ["missed_call_textback", "receptionist", "custom"],
      channel_kind: ["voice", "sms", "web_chat"],
      conversation_state: ["ai_active", "human_takeover", "closed"],
      knowledge_kind: [
        "faq",
        "service",
        "web_page",
        "document",
        "pricing",
        "hours",
        "service_area",
        "correction",
        "other",
      ],
      lead_status: ["new", "contacted", "booked", "won", "lost"],
      member_role: ["agency_admin", "owner", "staff"],
      msg_direction: ["inbound", "outbound"],
      msg_sender: ["contact", "ai", "human", "system"],
      number_source: ["provisioned", "ported"],
      outcome_tag: [
        "booked",
        "lead",
        "faq",
        "spam",
        "transferred",
        "no_response",
        "other",
      ],
      tenant_kind: ["agency", "business"],
      usage_kind: [
        "sms_out_segment",
        "sms_in_segment",
        "voice_minute",
        "llm_input_tokens",
        "llm_output_tokens",
        "phone_number_month",
      ],
      version_status: ["draft", "live", "archived"],
    },
  },
} as const;
