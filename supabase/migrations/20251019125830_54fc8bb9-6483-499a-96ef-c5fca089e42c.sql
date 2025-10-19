-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.difficulty_level AS ENUM ('facil', 'medio', 'dificil');
CREATE TYPE public.question_status AS ENUM ('ativo', 'inativo', 'em_revisao');
CREATE TYPE public.simulado_status AS ENUM ('nao_iniciado', 'em_andamento', 'concluido');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  foto_url TEXT,
  meta_horas_semanais INTEGER DEFAULT 20,
  dias_ate_prova INTEGER,
  concurso_alvo TEXT,
  cargo_alvo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Bancas table
CREATE TABLE public.bancas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL UNIQUE,
  descricao TEXT,
  site_oficial TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disciplinas table
CREATE TABLE public.disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  peso INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questoes table
CREATE TABLE public.questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enunciado TEXT NOT NULL,
  alternativa_a TEXT NOT NULL,
  alternativa_b TEXT NOT NULL,
  alternativa_c TEXT NOT NULL,
  alternativa_d TEXT NOT NULL,
  alternativa_e TEXT,
  gabarito CHAR(1) NOT NULL CHECK (gabarito IN ('A', 'B', 'C', 'D', 'E')),
  explicacao TEXT,
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  banca_id UUID REFERENCES public.bancas(id) ON DELETE SET NULL,
  dificuldade difficulty_level DEFAULT 'medio',
  status question_status DEFAULT 'ativo',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulados table
CREATE TABLE public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  banca_id UUID REFERENCES public.bancas(id) ON DELETE SET NULL,
  tempo_limite_minutos INTEGER,
  status simulado_status DEFAULT 'nao_iniciado',
  nota_final DECIMAL(5,2),
  acertos INTEGER DEFAULT 0,
  total_questoes INTEGER DEFAULT 0,
  iniciado_em TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulado questoes (junction table)
CREATE TABLE public.simulado_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE CASCADE NOT NULL,
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE NOT NULL,
  resposta_usuario CHAR(1) CHECK (resposta_usuario IN ('A', 'B', 'C', 'D', 'E')),
  correto BOOLEAN,
  tempo_resposta_segundos INTEGER,
  marcada_revisao BOOLEAN DEFAULT FALSE,
  ordem INTEGER NOT NULL,
  UNIQUE(simulado_id, questao_id)
);

-- Planos de estudo table
CREATE TABLE public.planos_estudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  concurso TEXT,
  orgao TEXT,
  cargo TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  meta_horas_semanais INTEGER DEFAULT 20,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessoes de estudo table
CREATE TABLE public.sessoes_estudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plano_id UUID REFERENCES public.planos_estudo(id) ON DELETE SET NULL,
  disciplina_id UUID REFERENCES public.disciplinas(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  duracao_minutos INTEGER NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revisoes table (spaced repetition)
CREATE TABLE public.revisoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE NOT NULL,
  proxima_revisao DATE NOT NULL,
  intervalo_dias INTEGER DEFAULT 1,
  facilidade DECIMAL(3,2) DEFAULT 2.5,
  acertos_consecutivos INTEGER DEFAULT 0,
  ultima_resposta BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulado_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisoes ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bancas (public read, admin write)
CREATE POLICY "Anyone can view active bancas" ON public.bancas FOR SELECT USING (ativo = TRUE);
CREATE POLICY "Admins can manage bancas" ON public.bancas FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for disciplinas (public read, admin write)
CREATE POLICY "Anyone can view disciplinas" ON public.disciplinas FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage disciplinas" ON public.disciplinas FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questoes (public read active, admin write)
CREATE POLICY "Anyone can view active questoes" ON public.questoes FOR SELECT USING (status = 'ativo');
CREATE POLICY "Admins can manage questoes" ON public.questoes FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for simulados
CREATE POLICY "Users can view own simulados" ON public.simulados FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own simulados" ON public.simulados FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulados" ON public.simulados FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulados" ON public.simulados FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for simulado_questoes
CREATE POLICY "Users can view own simulado questoes" ON public.simulado_questoes FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.simulados WHERE id = simulado_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own simulado questoes" ON public.simulado_questoes FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.simulados WHERE id = simulado_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own simulado questoes" ON public.simulado_questoes FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.simulados WHERE id = simulado_id AND user_id = auth.uid()));

-- RLS Policies for planos_estudo
CREATE POLICY "Users can view own planos" ON public.planos_estudo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own planos" ON public.planos_estudo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own planos" ON public.planos_estudo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own planos" ON public.planos_estudo FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sessoes_estudo
CREATE POLICY "Users can view own sessoes" ON public.sessoes_estudo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessoes" ON public.sessoes_estudo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessoes" ON public.sessoes_estudo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessoes" ON public.sessoes_estudo FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for revisoes
CREATE POLICY "Users can view own revisoes" ON public.revisoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own revisoes" ON public.revisoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revisoes" ON public.revisoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revisoes" ON public.revisoes FOR DELETE USING (auth.uid() = user_id);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Usuário')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revisoes_updated_at BEFORE UPDATE ON public.revisoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert bancas
INSERT INTO public.bancas (nome, sigla, descricao, site_oficial) VALUES
  ('Centro de Seleção e de Promoção de Eventos', 'CESPE', 'Banca da UnB, reconhecida por questões dissertativas e interpretativas', 'https://www.cebraspe.org.br'),
  ('Fundação Getúlio Vargas', 'FGV', 'Banca conhecida por questões objetivas elaboradas', 'https://www.fgv.br'),
  ('Fundação Carlos Chagas', 'FCC', 'Uma das mais tradicionais bancas de concursos do Brasil', 'https://www.fcc.org.br'),
  ('Instituto Brasileiro de Formação e Capacitação', 'IBFC', 'Banca com crescimento expressivo nos últimos anos', 'https://www.ibfc.org.br'),
  ('Assessoria em Organização de Concursos Públicos', 'AOCP', 'Banca presente em diversos concursos regionais', 'https://www.aocp.com.br'),
  ('Instituto de Desenvolvimento Educacional, Cultural e Assistencial Nacional', 'IDECAN', 'Banca forte em concursos militares e policiais', 'https://www.idecan.org.br'),
  ('Instituto Americano de Desenvolvimento', 'IADES', 'Banca atuante principalmente no DF e região', 'https://www.iades.com.br'),
  ('Fundação Ricardo Franco', 'FUNRIO', 'Banca do Rio de Janeiro com diversos concursos', 'https://www.funrio.org.br'),
  ('Fundação para o Vestibular da Universidade Estadual Paulista', 'VUNESP', 'Principal banca de São Paulo', 'https://www.vunesp.com.br'),
  ('Faculdade de Tecnologia de Cotia', 'COTEC', 'Banca regional de Minas Gerais', NULL),
  ('Consulplan Consultoria', 'CONSULPLAN', 'Banca atuante em todo o Brasil', 'https://www.consulplan.net'),
  ('Fundação Cesgranrio', 'CESGRANRIO', 'Banca tradicional, realiza concursos de grandes empresas', 'https://www.cesgranrio.org.br'),
  ('Instituto Quadrix de Tecnologia e Desenvolvimento Social', 'QUADRIX', 'Banca moderna com foco em tecnologia', 'https://www.quadrix.org.br'),
  ('Instituto Nacional de Avaliação e Zootecnia', 'INAZ', 'Banca de concursos regionais', NULL),
  ('Núcleo de Concursos UFPR', 'UFPR', 'Banca da Universidade Federal do Paraná', 'https://www.nc.ufpr.br'),
  ('Fundação de Apoio à Universidade Estadual de Londrina', 'FAUEL', 'Banca do Paraná', NULL),
  ('Fundação Educacional da Paraíba', 'EDUCAPB', 'Banca regional da Paraíba', NULL);

-- Insert disciplinas comuns
INSERT INTO public.disciplinas (nome, descricao, peso) VALUES
  ('Português', 'Língua Portuguesa e Interpretação de Textos', 9),
  ('Raciocínio Lógico', 'Raciocínio Lógico-Matemático', 8),
  ('Direito Constitucional', 'Direito Constitucional', 9),
  ('Direito Administrativo', 'Direito Administrativo', 8),
  ('Direito Civil', 'Direito Civil', 7),
  ('Direito Penal', 'Direito Penal', 7),
  ('Direito Processual Civil', 'Direito Processual Civil', 6),
  ('Direito Processual Penal', 'Direito Processual Penal', 6),
  ('Informática', 'Noções de Informática', 7),
  ('Atualidades', 'Atualidades e Conhecimentos Gerais', 5),
  ('Administração Pública', 'Administração Pública', 6),
  ('Contabilidade', 'Contabilidade Geral e Pública', 7),
  ('Economia', 'Economia', 6),
  ('Estatística', 'Estatística', 6),
  ('Matemática', 'Matemática', 7),
  ('Inglês', 'Língua Inglesa', 5),
  ('Legislação Específica', 'Legislação Específica do Cargo', 8);