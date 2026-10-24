CREATE TABLE `portal_identities` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone_digits` VARCHAR(20) NULL,
    `majuu_user_id` VARCHAR(191) NULL,
    `loans_linked` BOOLEAN NOT NULL DEFAULT false,
    `phone_status` VARCHAR(32) NOT NULL DEFAULT 'unchecked',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `portal_identities_email_key`(`email`),
    INDEX `portal_identities_phone_digits_idx`(`phone_digits`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
