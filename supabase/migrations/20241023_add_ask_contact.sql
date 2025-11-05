-- Add ask_contact column to form-responses table
ALTER TABLE "form-responses"
ADD COLUMN IF NOT EXISTS ask_contact boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN "form-responses".ask_contact IS 'Indicates if the user wishes to be contacted (true) or not (false)';
