-- Add +2 reactions count column to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS plus2_reactions_count INTEGER DEFAULT 0;

-- Create index for popular posts queries
CREATE INDEX IF NOT EXISTS idx_photos_plus2_reactions_count ON photos(plus2_reactions_count DESC);

