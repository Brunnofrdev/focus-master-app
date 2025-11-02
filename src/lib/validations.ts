import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    .max(100, { message: "Senha muito longa" })
});

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Email inválido" })
    .max(255, { message: "Email muito longo" }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres" })
    .max(100, { message: "Senha muito longa" }),
  nomeCompleto: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
    .max(100, { message: "Nome muito longo" })
});

// Profile validations
export const profileSchema = z.object({
  nome_completo: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
    .max(100, { message: "Nome muito longo" }),
  cpf: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), {
      message: "CPF inválido"
    }),
  telefone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^\+?[\d\s()-]{10,}$/.test(val), {
      message: "Telefone inválido"
    }),
  cargo_alvo: z.string().trim().max(200).optional(),
  concurso_alvo: z.string().trim().max(200).optional()
});

// Session validations
export const sessionSchema = z.object({
  duracao_minutos: z
    .number()
    .min(1, { message: "Duração deve ser maior que 0" })
    .max(1440, { message: "Duração não pode exceder 24 horas" }),
  disciplina_id: z
    .string()
    .uuid({ message: "Disciplina inválida" }),
  notas: z
    .string()
    .trim()
    .max(1000, { message: "Notas muito longas" })
    .optional()
});

// Simulado validations
export const simuladoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(3, { message: "Título deve ter no mínimo 3 caracteres" })
    .max(200, { message: "Título muito longo" }),
  descricao: z
    .string()
    .trim()
    .max(1000, { message: "Descrição muito longa" })
    .optional(),
  quantidade_questoes: z
    .number()
    .min(1, { message: "Deve ter no mínimo 1 questão" })
    .max(200, { message: "Máximo de 200 questões" }),
  tempo_limite_minutos: z
    .number()
    .min(1, { message: "Tempo deve ser maior que 0" })
    .max(720, { message: "Tempo não pode exceder 12 horas" })
    .optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type SessionInput = z.infer<typeof sessionSchema>;
export type SimuladoInput = z.infer<typeof simuladoSchema>;
