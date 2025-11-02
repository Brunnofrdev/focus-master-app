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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bancas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          sigla: string
          site_oficial: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          sigla: string
          site_oficial?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          sigla?: string
          site_oficial?: string | null
        }
        Relationships: []
      }
      disciplinas: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          peso: number | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          peso?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          peso?: number | null
        }
        Relationships: []
      }
      planos_estudo: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          concurso: string | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          meta_horas_semanais: number | null
          nome: string
          orgao: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          concurso?: string | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          meta_horas_semanais?: number | null
          nome: string
          orgao?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          concurso?: string | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          meta_horas_semanais?: number | null
          nome?: string
          orgao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo_alvo: string | null
          concurso_alvo: string | null
          cpf: string | null
          created_at: string | null
          dias_ate_prova: number | null
          foto_url: string | null
          id: string
          meta_horas_semanais: number | null
          nome_completo: string
          notificacoes: Json | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cargo_alvo?: string | null
          concurso_alvo?: string | null
          cpf?: string | null
          created_at?: string | null
          dias_ate_prova?: number | null
          foto_url?: string | null
          id: string
          meta_horas_semanais?: number | null
          nome_completo: string
          notificacoes?: Json | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo_alvo?: string | null
          concurso_alvo?: string | null
          cpf?: string | null
          created_at?: string | null
          dias_ate_prova?: number | null
          foto_url?: string | null
          id?: string
          meta_horas_semanais?: number | null
          nome_completo?: string
          notificacoes?: Json | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questoes: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e: string | null
          banca_id: string | null
          created_at: string | null
          created_by: string | null
          dificuldade: Database["public"]["Enums"]["difficulty_level"] | null
          disciplina_id: string | null
          enunciado: string
          explicacao: string | null
          gabarito: string
          id: string
          status: Database["public"]["Enums"]["question_status"] | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_d: string
          alternativa_e?: string | null
          banca_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dificuldade?: Database["public"]["Enums"]["difficulty_level"] | null
          disciplina_id?: string | null
          enunciado: string
          explicacao?: string | null
          gabarito: string
          id?: string
          status?: Database["public"]["Enums"]["question_status"] | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_d?: string
          alternativa_e?: string | null
          banca_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dificuldade?: Database["public"]["Enums"]["difficulty_level"] | null
          disciplina_id?: string | null
          enunciado?: string
          explicacao?: string | null
          gabarito?: string
          id?: string
          status?: Database["public"]["Enums"]["question_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "questoes_banca_id_fkey"
            columns: ["banca_id"]
            isOneToOne: false
            referencedRelation: "bancas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
        ]
      }
      revisoes: {
        Row: {
          acertos_consecutivos: number | null
          created_at: string | null
          facilidade: number | null
          id: string
          intervalo_dias: number | null
          proxima_revisao: string
          questao_id: string
          ultima_resposta: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acertos_consecutivos?: number | null
          created_at?: string | null
          facilidade?: number | null
          id?: string
          intervalo_dias?: number | null
          proxima_revisao: string
          questao_id: string
          ultima_resposta?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acertos_consecutivos?: number | null
          created_at?: string | null
          facilidade?: number | null
          id?: string
          intervalo_dias?: number | null
          proxima_revisao?: string
          questao_id?: string
          ultima_resposta?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_estudo: {
        Row: {
          created_at: string | null
          data: string
          disciplina_id: string | null
          duracao_minutos: number
          id: string
          notas: string | null
          plano_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: string
          disciplina_id?: string | null
          duracao_minutos: number
          id?: string
          notas?: string | null
          plano_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          disciplina_id?: string | null
          duracao_minutos?: number
          id?: string
          notas?: string | null
          plano_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_estudo_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_estudo_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_estudo"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_questoes: {
        Row: {
          correto: boolean | null
          id: string
          marcada_revisao: boolean | null
          ordem: number
          questao_id: string
          resposta_usuario: string | null
          simulado_id: string
          tempo_resposta_segundos: number | null
        }
        Insert: {
          correto?: boolean | null
          id?: string
          marcada_revisao?: boolean | null
          ordem: number
          questao_id: string
          resposta_usuario?: string | null
          simulado_id: string
          tempo_resposta_segundos?: number | null
        }
        Update: {
          correto?: boolean | null
          id?: string
          marcada_revisao?: boolean | null
          ordem?: number
          questao_id?: string
          resposta_usuario?: string | null
          simulado_id?: string
          tempo_resposta_segundos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulado_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulado_questoes_simulado_id_fkey"
            columns: ["simulado_id"]
            isOneToOne: false
            referencedRelation: "simulados"
            referencedColumns: ["id"]
          },
        ]
      }
      simulados: {
        Row: {
          acertos: number | null
          banca_id: string | null
          concluido_em: string | null
          created_at: string | null
          descricao: string | null
          id: string
          iniciado_em: string | null
          nota_final: number | null
          status: Database["public"]["Enums"]["simulado_status"] | null
          tempo_limite_minutos: number | null
          titulo: string
          total_questoes: number | null
          user_id: string
        }
        Insert: {
          acertos?: number | null
          banca_id?: string | null
          concluido_em?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          iniciado_em?: string | null
          nota_final?: number | null
          status?: Database["public"]["Enums"]["simulado_status"] | null
          tempo_limite_minutos?: number | null
          titulo: string
          total_questoes?: number | null
          user_id: string
        }
        Update: {
          acertos?: number | null
          banca_id?: string | null
          concluido_em?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          iniciado_em?: string | null
          nota_final?: number | null
          status?: Database["public"]["Enums"]["simulado_status"] | null
          tempo_limite_minutos?: number | null
          titulo?: string
          total_questoes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulados_banca_id_fkey"
            columns: ["banca_id"]
            isOneToOne: false
            referencedRelation: "bancas"
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
      app_role: "admin" | "moderator" | "user"
      difficulty_level: "facil" | "medio" | "dificil"
      question_status: "ativo" | "inativo" | "em_revisao"
      simulado_status: "nao_iniciado" | "em_andamento" | "concluido"
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
      app_role: ["admin", "moderator", "user"],
      difficulty_level: ["facil", "medio", "dificil"],
      question_status: ["ativo", "inativo", "em_revisao"],
      simulado_status: ["nao_iniciado", "em_andamento", "concluido"],
    },
  },
} as const
