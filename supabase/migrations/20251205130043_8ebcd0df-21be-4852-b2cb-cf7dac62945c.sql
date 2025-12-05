-- Create flashcards table for automatic flashcard generation
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  questao_id UUID REFERENCES public.questoes(id) ON DELETE SET NULL,
  frente TEXT NOT NULL,
  verso TEXT NOT NULL,
  proxima_revisao DATE NOT NULL DEFAULT CURRENT_DATE,
  intervalo_dias INTEGER DEFAULT 1,
  facilidade NUMERIC DEFAULT 2.5,
  acertos_consecutivos INTEGER DEFAULT 0,
  origem TEXT DEFAULT 'manual', -- 'manual', 'erro_simulado', 'ia'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own flashcards" ON public.flashcards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own flashcards" ON public.flashcards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcards" ON public.flashcards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcards" ON public.flashcards FOR DELETE USING (auth.uid() = user_id);

-- Create content_library table for library of study materials
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- NULL for public content
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'resumo', -- 'resumo', 'mapa_mental', 'lei', 'exemplo'
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public or own content" ON public.content_library FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own content" ON public.content_library FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.content_library FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.content_library FOR DELETE 
  USING (auth.uid() = user_id);

-- Create daily_missions table for AI coach
CREATE TABLE IF NOT EXISTS public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  missoes JSONB NOT NULL DEFAULT '[]',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own missions" ON public.daily_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own missions" ON public.daily_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own missions" ON public.daily_missions FOR UPDATE USING (auth.uid() = user_id);

-- Create pdf_uploads table for imported PDFs
CREATE TABLE IF NOT EXISTS public.pdf_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_arquivo TEXT NOT NULL,
  resumo TEXT,
  flashcards_gerados INTEGER DEFAULT 0,
  questoes_geradas INTEGER DEFAULT 0,
  processado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own uploads" ON public.pdf_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own uploads" ON public.pdf_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.pdf_uploads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.pdf_uploads FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for flashcards updated_at
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for content_library updated_at
CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();