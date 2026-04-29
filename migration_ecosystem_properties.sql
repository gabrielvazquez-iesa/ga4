-- ==========================================
-- TABLE: GA4 PROPERTIES FOR ECOSYSTEM
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ga4_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Friendly name (e.g. Panama, Blog, etc)
    property_id TEXT NOT NULL, -- GA4 Property ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Properties are visible to all" 
ON public.ga4_properties FOR SELECT USING (true);

CREATE POLICY "Admins can manage properties" 
ON public.ga4_properties FOR ALL USING (
    auth.jwt() ->> 'email' IN ('admin@iesa.edu.ve', 'gabriel.vazquez@iesa.edu.ve')
);
