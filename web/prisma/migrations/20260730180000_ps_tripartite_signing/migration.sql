-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('APPLICANT', 'PS_LABOUR', 'PS_MSME') NOT NULL DEFAULT 'APPLICANT';

-- AlterTable
ALTER TABLE `tripartite_data`
    ADD COLUMN `labourPsSignature` LONGTEXT NULL,
    ADD COLUMN `labourPsSignedAt` DATETIME(3) NULL,
    ADD COLUMN `labourPsSignedBy` VARCHAR(191) NULL,
    ADD COLUMN `msmePsSignature` LONGTEXT NULL,
    ADD COLUMN `msmePsSignedAt` DATETIME(3) NULL,
    ADD COLUMN `msmePsSignedBy` VARCHAR(191) NULL;

-- Seed Principal Secretary accounts (password bcrypt-hashed, never plaintext)
INSERT INTO `users` (`id`, `email`, `passwordHash`, `name`, `identifierType`, `role`, `createdAt`, `updatedAt`)
VALUES
    (
        'ps_labour_seed001',
        'ps@labour.go.ke',
        '$2b$12$zKNHc8qSaeA..cStqeVrauSRZNerLB0IJr2Cq/qBY33qW8ZQaz056',
        'Principal Secretary – Labour and Skills Development',
        'EMAIL',
        'PS_LABOUR',
        NOW(3),
        NOW(3)
    ),
    (
        'ps_msme_seed001',
        'ps@msme.go.ke',
        '$2b$12$zKNHc8qSaeA..cStqeVrauSRZNerLB0IJr2Cq/qBY33qW8ZQaz056',
        'Principal Secretary – MSME Development',
        'EMAIL',
        'PS_MSME',
        NOW(3),
        NOW(3)
    )
ON DUPLICATE KEY UPDATE
    `passwordHash` = VALUES(`passwordHash`),
    `name` = VALUES(`name`),
    `role` = VALUES(`role`),
    `updatedAt` = NOW(3);
