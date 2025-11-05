-- Migration: Add has_project and user_add_message fields
-- Date: 2025-01-30
-- Description: Adds has_project boolean field and user_add_message text field to form-responses table

ALTER TABLE "form-responses"
ADD COLUMN IF NOT EXISTS has_project BOOLEAN,
ADD COLUMN IF NOT EXISTS user_add_message TEXT,
ADD COLUMN IF NOT EXISTS autre_aide_financiere TEXT;
