-- Migration 005: Tabela homenagens às famílias
-- Criada em: 2026-05-02
-- Autor: Dr. Edson Barroso

CREATE TABLE IF NOT EXISTS public.homenagens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  autor_nome text NOT NULL,
  autor_instagram text,
  autor_legendario_numero text,
  homenageado_nome text NOT NULL,
  homenageado_parentesco text NOT NULL,
  homenageado_instagram text,
  homenageado_legendario boolean DEFAULT false,
  texto text NOT NULL,
  foto_capa_url text,
  foto2_url text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.homenagens ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode visualizar homenagens
CREATE POLICY IF NOT EXISTS homenagens_select_all
  ON public.homenagens FOR SELECT USING (true);

-- Apenas usuários autenticados podem criar homenagens
CREATE POLICY IF NOT EXISTS homenagens_insert_auth
  ON public.homenagens FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Admin pode deletar/atualizar
CREATE POLICY IF NOT EXISTS homenagens_admin_all
  ON public.homenagens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
