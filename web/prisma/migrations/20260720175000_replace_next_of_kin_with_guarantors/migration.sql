-- DropTable
DROP TABLE IF EXISTS `next_of_kin_data`;

-- CreateTable
CREATE TABLE `guarantor_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `guarantorNumber` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `kraPin` VARCHAR(191) NOT NULL,
    `county` VARCHAR(191) NOT NULL,
    `constituency` VARCHAR(191) NOT NULL,
    `ward` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `subLocation` VARCHAR(191) NULL,
    `nationalId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `otpCode` VARCHAR(191) NULL,
    `otpStatus` ENUM('PENDING', 'SENT', 'VERIFIED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `otpVerified` BOOLEAN NOT NULL DEFAULT false,
    `otpSentAt` DATETIME(3) NULL,
    `otpVerifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `guarantor_data_applicationId_idx`(`applicationId`),
    UNIQUE INDEX `guarantor_data_applicationId_guarantorNumber_key`(`applicationId`, `guarantorNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guarantor_data` ADD CONSTRAINT `guarantor_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
