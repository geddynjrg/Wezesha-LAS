-- Align member OTP columns with Prisma camelCase (matches init schema / guarantor_data).
ALTER TABLE `group_members`
    CHANGE COLUMN `otp_code` `otpCode` VARCHAR(191) NULL,
    CHANGE COLUMN `otp_status` `otpStatus` ENUM('PENDING', 'SENT', 'VERIFIED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    CHANGE COLUMN `otp_verified` `otpVerified` BOOLEAN NOT NULL DEFAULT false,
    CHANGE COLUMN `otp_sent_at` `otpSentAt` DATETIME(3) NULL,
    CHANGE COLUMN `otp_verified_at` `otpVerifiedAt` DATETIME(3) NULL,
    CHANGE COLUMN `consent_amount` `consentAmount` DECIMAL(12, 2) NULL;

ALTER TABLE `member_consent_otp_sends` DROP FOREIGN KEY `member_consent_otp_sends_member_id_fkey`;

ALTER TABLE `member_consent_otp_sends`
    CHANGE COLUMN `member_id` `memberId` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `phone_number` `phoneNumber` VARCHAR(191) NOT NULL,
    CHANGE COLUMN `created_at` `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

DROP INDEX `member_consent_otp_sends_member_id_created_at_idx` ON `member_consent_otp_sends`;
DROP INDEX `member_consent_otp_sends_phone_number_created_at_idx` ON `member_consent_otp_sends`;

CREATE INDEX `member_consent_otp_sends_memberId_createdAt_idx` ON `member_consent_otp_sends`(`memberId`, `createdAt`);
CREATE INDEX `member_consent_otp_sends_phoneNumber_createdAt_idx` ON `member_consent_otp_sends`(`phoneNumber`, `createdAt`);

ALTER TABLE `member_consent_otp_sends`
    ADD CONSTRAINT `member_consent_otp_sends_memberId_fkey`
    FOREIGN KEY (`memberId`) REFERENCES `group_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
