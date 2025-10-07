-- Database Optimization: Indexes for Herb Queries
-- This migration adds composite indexes for frequently filtered fields

-- Herbs table indexes
CREATE INDEX IF NOT EXISTS idx_herbs_status ON herbs(status);
CREATE INDEX IF NOT EXISTS idx_herbs_slug ON herbs(slug);
CREATE INDEX IF NOT EXISTS idx_herbs_published ON herbs(published_at);

-- Composite index for TCM property filtering
CREATE INDEX IF NOT EXISTS idx_herbs_tcm_properties ON herbs
  USING gin ((tcm_properties::jsonb));

-- Index for searching by scientific name
CREATE INDEX IF NOT EXISTS idx_herbs_scientific_name ON herbs(scientific_name);

-- Composite index for common queries (status + published)
CREATE INDEX IF NOT EXISTS idx_herbs_status_published ON herbs(status, published_at DESC);

-- Full-text search index on name and description
CREATE INDEX IF NOT EXISTS idx_herbs_search_name ON herbs
  USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_herbs_search_description ON herbs
  USING gin(to_tsvector('english', description));

-- Composite full-text search index
CREATE INDEX IF NOT EXISTS idx_herbs_full_text ON herbs
  USING gin(to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(scientific_name, '') || ' ' ||
    coalesce(description, '')
  ));

-- Index for active constituents (stored as JSONB array)
CREATE INDEX IF NOT EXISTS idx_herbs_constituents ON herbs
  USING gin ((active_constituents::jsonb));

-- Index for safety information queries
CREATE INDEX IF NOT EXISTS idx_herbs_safety ON herbs
  USING gin ((safety_info::jsonb));

-- Formulas table indexes
CREATE INDEX IF NOT EXISTS idx_formulas_status ON formulas(status);
CREATE INDEX IF NOT EXISTS idx_formulas_slug ON formulas(slug);
CREATE INDEX IF NOT EXISTS idx_formulas_tradition ON formulas(tradition);

-- Index for formula ingredients (many-to-many relationship)
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_formula ON formula_ingredients(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_herb ON formula_ingredients(herb_id);
CREATE INDEX IF NOT EXISTS idx_formula_ingredients_role ON formula_ingredients(tcm_role);

-- Conditions table indexes
CREATE INDEX IF NOT EXISTS idx_conditions_status ON conditions(status);
CREATE INDEX IF NOT EXISTS idx_conditions_slug ON conditions(slug);
CREATE INDEX IF NOT EXISTS idx_conditions_severity ON conditions(severity);

-- Composite index for affected systems
CREATE INDEX IF NOT EXISTS idx_conditions_systems ON conditions
  USING gin ((affected_systems::jsonb));

-- Practitioners table indexes
CREATE INDEX IF NOT EXISTS idx_practitioners_status ON practitioners(status);
CREATE INDEX IF NOT EXISTS idx_practitioners_slug ON practitioners(slug);
CREATE INDEX IF NOT EXISTS idx_practitioners_verified ON practitioners(verified);
CREATE INDEX IF NOT EXISTS idx_practitioners_accepting ON practitioners(accepting_patients);

-- Geospatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_practitioners_location ON practitioners
  USING gist(
    ll_to_earth(
      coalesce(latitude, 0)::double precision,
      coalesce(longitude, 0)::double precision
    )
  );

-- Index for practitioner specialties
CREATE INDEX IF NOT EXISTS idx_practitioners_specialties ON practitioners
  USING gin ((specialties::jsonb));

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_practitioner ON reviews(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Users table indexes for authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at DESC);

-- Audit logs indexes for security queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- Composite index for audit log queries by user and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON audit_logs(user_id, created_at DESC);

-- Composite index for resource-specific audit queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource, resource_id);

-- Performance optimization: Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_herbs_active ON herbs(id, name)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_practitioners_active ON practitioners(id, name)
  WHERE status = 'published' AND accepting_patients = true;

-- Add database statistics for query planner
ANALYZE herbs;
ANALYZE formulas;
ANALYZE conditions;
ANALYZE practitioners;
ANALYZE reviews;
ANALYZE users;
ANALYZE audit_logs;

-- Create a function to refresh materialized views (if any)
CREATE OR REPLACE FUNCTION refresh_search_cache()
RETURNS void AS $$
BEGIN
  -- Refresh any materialized views used for search
  -- Add specific refresh commands as needed
  RAISE NOTICE 'Search cache refreshed at %', now();
END;
$$ LANGUAGE plpgsql;

COMMENT ON INDEX idx_herbs_full_text IS 'Full-text search index for herbs';
COMMENT ON INDEX idx_practitioners_location IS 'Geospatial index for practitioner location queries';
COMMENT ON INDEX idx_audit_logs_user_time IS 'Composite index for user audit history queries';
