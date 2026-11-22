
CREATE SCHEMA IF NOT EXISTS ledgercore_security;

CREATE TABLE IF NOT EXISTS ledgercore_security.user_roles (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    role VARCHAR(32) NOT NULL
        CHECK (
            role IN (
                'SUPER_ADMIN',
                'FINANCE_ADMIN',
                'ACCOUNTANT',
                'FINANCE_MANAGER',
                'AP_OFFICER',
                'AR_OFFICER',
                'AUDITOR'
            )
        ),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledgercore_user_roles_role
ON ledgercore_security.user_roles(role);

ALTER TABLE ledgercore_security.user_roles
ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON SCHEMA ledgercore_security
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON TABLE ledgercore_security.user_roles
FROM PUBLIC, anon, authenticated;
