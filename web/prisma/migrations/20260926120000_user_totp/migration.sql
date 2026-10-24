ALTER TABLE `users` ADD COLUMN `totp_secret` VARCHAR(64) NULL,
    ADD COLUMN `totp_enrolled_at` DATETIME(3) NULL;
