-- AlterTable
ALTER TABLE `group_members`
    ADD COLUMN `otpCode` VARCHAR(191) NULL,
    ADD COLUMN `otpStatus` ENUM('PENDING', 'SENT', 'VERIFIED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `otpVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `otpSentAt` DATETIME(3) NULL,
    ADD COLUMN `otpVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `consentAmount` DECIMAL(12, 2) NULL;

-- CreateTable
CREATE TABLE `member_consent_otp_sends` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `member_consent_otp_sends_memberId_createdAt_idx`(`memberId`, `createdAt`),
    INDEX `member_consent_otp_sends_phoneNumber_createdAt_idx`(`phoneNumber`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `member_consent_otp_sends`
    ADD CONSTRAINT `member_consent_otp_sends_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `group_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
