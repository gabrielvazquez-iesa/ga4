-- ==========================================
-- USER PROFILES & AUTH
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  department TEXT, -- 'Administración', 'Mercadeo', 'Comunicaciones', etc.
  has_vault_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VAULT CREDENTIALS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.vault_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL, -- Stored as plain text by request
  url TEXT,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SYSTEM NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SOCIAL MEDIA DUTY PLANNER
-- ==========================================

CREATE TABLE IF NOT EXISTS public.duty_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    shift_type TEXT CHECK (shift_type IN ('day', 'week', 'weekend')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.duty_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shift_id UUID REFERENCES public.duty_shifts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(user_id), -- who made the change
    action TEXT, -- 'create', 'update', 'delete'
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS POLICIES
-- ==========================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duty_audit_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public profiles are visible to authenticated users" ON public.user_profiles FOR SELECT USING (auth.uid() IS NOT NULL);

-- Vault Credentials
CREATE POLICY "Authorized departments can view credentials" 
    ON public.vault_credentials FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE public.user_profiles.user_id = auth.uid() 
            AND (
                public.user_profiles.department IN ('Mercadeo', 'Comunicaciones') 
                OR public.user_profiles.has_vault_access = TRUE 
                OR public.user_profiles.email IN ('gabriel.vazquez@iesa.edu.ve', 'admin@iesa.edu.ve')
            )
        )
    );

CREATE POLICY "Admins can manage all credentials" 
    ON public.vault_credentials FOR ALL 
    USING (
        auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
    );

-- Notifications
CREATE POLICY "Admins can manage notifications" ON public.system_notifications FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
);

-- Duty Shifts
CREATE POLICY IF NOT EXISTS "Everyone can view shifts" ON public.duty_shifts FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Auth users can insert shifts" ON public.duty_shifts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Auth users can update shifts" ON public.duty_shifts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Auth users can delete shifts" ON public.duty_shifts FOR DELETE USING (auth.uid() IS NOT NULL);

-- Audit Logs
CREATE POLICY "Everyone can view audit logs" ON public.duty_audit_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.duty_audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
