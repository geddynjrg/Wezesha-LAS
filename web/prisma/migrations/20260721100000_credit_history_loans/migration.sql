-- AlterTable: replace single-loan columns with hasLoanHistory flag
ALTER TABLE `credit_history_data`
    ADD COLUMN `hasLoanHistory` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `credit_history_loans` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `lender` VARCHAR(191) NOT NULL,
    `loanDate` DATETIME(3) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `monthlyInstallment` DECIMAL(12, 2) NOT NULL,
    `outstandingAmount` DECIMAL(12, 2) NOT NULL,

    INDEX `credit_history_loans_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Migrate existing single-loan rows into credit_history_loans
INSERT INTO `credit_history_loans` (
    `id`,
    `applicationId`,
    `lender`,
    `loanDate`,
    `amount`,
    `duration`,
    `monthlyInstallment`,
    `outstandingAmount`
)
SELECT
    CONCAT('migrated_', `id`),
    `applicationId`,
    COALESCE(`lender`, 'Unknown'),
    `loanDate`,
    COALESCE(`amount`, 0),
    COALESCE(`duration`, 'Unknown'),
    COALESCE(`monthlyInstallment`, 0),
    COALESCE(`outstandingAmount`, 0)
FROM `credit_history_data`
WHERE `lender` IS NOT NULL
   OR `amount` IS NOT NULL
   OR `outstandingAmount` IS NOT NULL
   OR `monthlyInstallment` IS NOT NULL
   OR `loanDate` IS NOT NULL
   OR `duration` IS NOT NULL;

UPDATE `credit_history_data`
SET `hasLoanHistory` = true
WHERE `lender` IS NOT NULL
   OR `amount` IS NOT NULL
   OR `outstandingAmount` IS NOT NULL
   OR `monthlyInstallment` IS NOT NULL
   OR `loanDate` IS NOT NULL
   OR `duration` IS NOT NULL;

ALTER TABLE `credit_history_data`
    DROP COLUMN `lender`,
    DROP COLUMN `amount`,
    DROP COLUMN `outstandingAmount`,
    DROP COLUMN `monthlyInstallment`,
    DROP COLUMN `loanDate`,
    DROP COLUMN `duration`;

-- AddForeignKey
ALTER TABLE `credit_history_loans`
    ADD CONSTRAINT `credit_history_loans_applicationId_fkey`
    FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
