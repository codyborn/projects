-- Add message permalink column to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS message_permalink TEXT;

-- Create index for future discoverability/querying
CREATE INDEX IF NOT EXISTS idx_photos_message_permalink ON photos(message_permalink) WHERE message_permalink IS NOT NULL;

