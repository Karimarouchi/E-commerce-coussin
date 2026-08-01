-- Fix NULLs in pinned_in_sub_category (added by ddl-auto without default)
UPDATE products SET pinned_in_sub_category = false WHERE pinned_in_sub_category IS NULL;
ALTER TABLE products ALTER COLUMN pinned_in_sub_category SET DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mix_match_enabled boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mix_match_gender varchar(32) DEFAULT 'auto';
ALTER TABLE products ADD COLUMN IF NOT EXISTS mix_match_role varchar(64) DEFAULT 'auto';
ALTER TABLE products ADD COLUMN IF NOT EXISTS mix_match_image_index integer DEFAULT 2;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nouveaute_since TIMESTAMP;
ALTER TABLE products ADD COLUMN IF NOT EXISTS nouveaute_duree_jours INTEGER;
