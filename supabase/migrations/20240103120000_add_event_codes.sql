-- Add event_code column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_code TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_event_code ON events(event_code);

-- Function to generate random 6-character alphanumeric code
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude similar looking chars (I, O, 0, 1)
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing events with codes
DO $$
DECLARE
  event_record RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR event_record IN SELECT id FROM events WHERE event_code IS NULL LOOP
    LOOP
      new_code := generate_event_code();
      SELECT EXISTS(SELECT 1 FROM events WHERE event_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    UPDATE events SET event_code = new_code WHERE id = event_record.id;
  END LOOP;
END $$;
