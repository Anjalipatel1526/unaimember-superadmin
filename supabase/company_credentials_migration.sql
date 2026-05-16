-- ============================================================
--  UNAI MEMBER — Company Login Credentials (UPDATED)
--  Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS company_credentials (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid        NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  auth_user_id  uuid,
  login_email   text        NOT NULL,
  login_password text       NOT NULL DEFAULT '',   -- stored so super admin can view/share
  role          text        NOT NULL DEFAULT 'company_admin',
  is_active     boolean     NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_credentials_company ON company_credentials(company_id);
CREATE INDEX IF NOT EXISTS idx_company_credentials_email   ON company_credentials(login_email);

DROP TRIGGER IF EXISTS trg_company_credentials_updated_at ON company_credentials;
CREATE TRIGGER trg_company_credentials_updated_at
  BEFORE UPDATE ON company_credentials
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE company_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_company_credentials" ON company_credentials;
CREATE POLICY "allow_all_company_credentials"
  ON company_credentials FOR ALL USING (true) WITH CHECK (true);

-- If table already exists, add the password column safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'company_credentials' AND column_name = 'login_password'
  ) THEN
    ALTER TABLE company_credentials ADD COLUMN login_password text NOT NULL DEFAULT '';
  END IF;
END;
$$;
