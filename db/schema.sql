CREATE TABLE IF NOT EXISTS users (
 id text PRIMARY KEY, name text NOT NULL, expertise text NOT NULL,
 password_hash text NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id),
 expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS skills (
 id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS versions (
 id text PRIMARY KEY, skill_id text NOT NULL REFERENCES skills(id),
 number integer NOT NULL CHECK(number>0), title text NOT NULL, summary text NOT NULL,
 domain text NOT NULL, price_cents integer NOT NULL CHECK(price_cents>=0),
 content text NOT NULL, validation text NOT NULL DEFAULT 'Expert review pending',
 release_notes text NOT NULL DEFAULT '', published_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(skill_id,number)
);
CREATE TABLE IF NOT EXISTS drafts (
 skill_id text PRIMARY KEY REFERENCES skills(id), title text NOT NULL, summary text NOT NULL,
 domain text NOT NULL, price_cents integer NOT NULL CHECK(price_cents>=0),
 content text NOT NULL, validation text NOT NULL DEFAULT 'Expert review pending',
 release_notes text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS entitlements (
 user_id text NOT NULL REFERENCES users(id), skill_id text NOT NULL REFERENCES skills(id),
 acquired_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,skill_id)
);
CREATE TABLE IF NOT EXISTS api_tokens (
 id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), name text NOT NULL,
 token_hash text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days', revoked_at timestamptz
);
CREATE TABLE IF NOT EXISTS rate_limits (
 key text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_usage (
 id bigserial PRIMARY KEY, user_id text REFERENCES users(id), task text NOT NULL,
 model text NOT NULL, input_tokens integer NOT NULL, output_tokens integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION immutable_version() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'Published versions are immutable; publish a new version'; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS immutable_versions ON versions;
CREATE TRIGGER immutable_versions BEFORE UPDATE OR DELETE ON versions FOR EACH ROW EXECUTE FUNCTION immutable_version();

CREATE TABLE IF NOT EXISTS github_identities (
 github_id text PRIMARY KEY, user_id text NOT NULL UNIQUE REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS oauth_states (
 state_hash text PRIMARY KEY, browser_hash text NOT NULL, verifier text NOT NULL,
 expires_at timestamptz NOT NULL
);
