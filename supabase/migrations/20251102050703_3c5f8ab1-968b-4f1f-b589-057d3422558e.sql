-- Adicionar coluna de notificações na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notificacoes JSONB DEFAULT '{"lembretes_estudo": true, "revisoes_pendentes": true, "relatorios_semanais": false}'::jsonb;