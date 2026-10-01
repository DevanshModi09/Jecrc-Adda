-- Existing players retain their assigned color and skip onboarding.
-- Registration explicitly sets character_setup_complete = false for new accounts.
ALTER TABLE "users"
  ADD COLUMN "shirt_color" TEXT,
  ADD COLUMN "hair_style" TEXT NOT NULL DEFAULT 'hair01',
  ADD COLUMN "character_setup_complete" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "users"
  ADD CONSTRAINT "users_shirt_color_check" CHECK ("shirt_color" IS NULL OR "shirt_color" IN ('green', 'cyan', 'pink', 'yellow', 'purple', 'orange')),
  ADD CONSTRAINT "users_hair_style_check" CHECK ("hair_style" IN ('hair01', 'hair02'));
