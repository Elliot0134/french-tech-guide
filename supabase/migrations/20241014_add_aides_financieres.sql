-- Add aides_financieres column to form-responses table
ALTER TABLE "form-responses"
ADD COLUMN IF NOT EXISTS aides_financieres jsonb;

-- Add comment for documentation
COMMENT ON COLUMN "form-responses".aides_financieres IS 'Financial aids available to the user (e.g., Pôle emploi, UpCo) stored as JSON array';
