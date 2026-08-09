-- Store the staff member responsible for the property source.
-- Safe to re-run and preserves all existing property data.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS assigned_staff_id text;

ALTER TABLE public.properties
  ALTER COLUMN assigned_staff_id SET DEFAULT '';

UPDATE public.properties
SET assigned_staff_id = ''
WHERE assigned_staff_id IS NULL;

ALTER TABLE public.properties
  ALTER COLUMN assigned_staff_id SET NOT NULL;