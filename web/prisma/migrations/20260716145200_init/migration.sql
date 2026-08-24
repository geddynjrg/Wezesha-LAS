-- CreateTable
CREATE TABLE `group_applications` (
    `id` VARCHAR(191) NOT NULL,
    `acknowledgmentNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'GROUP_SUBMITTED', 'INDIVIDUAL_IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `phase` ENUM('GROUP', 'INDIVIDUAL') NOT NULL DEFAULT 'GROUP',
    `progress` INTEGER NOT NULL DEFAULT 1,
    `submittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `termsAccepted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `group_applications_acknowledgmentNumber_key`(`acknowledgmentNumber`),
    INDEX `group_applications_status_idx`(`status`),
    INDEX `group_applications_acknowledgmentNumber_idx`(`acknowledgmentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `groupName` VARCHAR(191) NOT NULL,
    `registrationDate` DATETIME(3) NULL,
    `registrationNumber` VARCHAR(191) NOT NULL,
    `county` VARCHAR(191) NOT NULL,
    `constituency` VARCHAR(191) NOT NULL,
    `ward` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `subLocation` VARCHAR(191) NULL,
    `clusterCategory` VARCHAR(191) NULL,
    `clusterCounty` VARCHAR(191) NULL,
    `clusterConstituency` VARCHAR(191) NULL,
    `destinationRegion` VARCHAR(191) NULL,
    `destinationCountry` VARCHAR(191) NULL,
    `agency` VARCHAR(191) NULL,
    `agentNumber` VARCHAR(191) NULL,
    `localAgentName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `group_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_membership` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `totalMales` INTEGER NOT NULL DEFAULT 0,
    `totalFemales` INTEGER NOT NULL DEFAULT 0,
    `totalDisabledMales` INTEGER NOT NULL DEFAULT 0,
    `totalDisabledFemales` INTEGER NOT NULL DEFAULT 0,
    `totalMembers` INTEGER NOT NULL DEFAULT 0,
    `totalDisabled` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `group_membership_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_background` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `purpose` TEXT NOT NULL,
    `proposedActivities` TEXT NOT NULL,

    UNIQUE INDEX `group_background_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `idNo` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `dob` DATETIME(3) NULL,
    `passportNo` VARCHAR(191) NULL,
    `kraPin` VARCHAR(191) NULL,
    `educationLevel` VARCHAR(191) NULL,
    `poBox` VARCHAR(191) NULL,
    `postalCode` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `dependants` INTEGER NULL,
    `mobile` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `subLocation` VARCHAR(191) NULL,
    `purpose` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NULL,
    `loanStatus` ENUM('PENDING', 'INDIVIDUAL_DRAFT', 'INDIVIDUAL_SUBMITTED', 'DISBURSED') NOT NULL DEFAULT 'PENDING',
    `signature` TEXT NULL,
    `amountRepaid` DECIMAL(12, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `group_members_applicationId_idx`(`applicationId`),
    INDEX `group_members_idNo_idx`(`idNo`),
    UNIQUE INDEX `group_members_applicationId_idNo_key`(`applicationId`, `idNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_bank_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `branchName` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `group_bank_accounts_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `individual_applications` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `acknowledgmentNumber` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'GROUP_SUBMITTED', 'INDIVIDUAL_IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `progress` INTEGER NOT NULL DEFAULT 1,
    `submittedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `tripartiteAccepted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `individual_applications_memberId_key`(`memberId`),
    UNIQUE INDEX `individual_applications_acknowledgmentNumber_key`(`acknowledgmentNumber`),
    INDEX `individual_applications_acknowledgmentNumber_idx`(`acknowledgmentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `county` VARCHAR(191) NOT NULL,
    `constituency` VARCHAR(191) NOT NULL,
    `ward` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `subLocation` VARCHAR(191) NULL,

    UNIQUE INDEX `location_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `next_of_kin_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `mobilePhone` VARCHAR(191) NOT NULL,
    `idNumber` VARCHAR(191) NULL,
    `physicalAddress` VARCHAR(191) NULL,
    `postalAddress` VARCHAR(191) NULL,
    `town` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `kraPin` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,

    UNIQUE INDEX `next_of_kin_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recruitment_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `localAgentName` VARCHAR(191) NULL,
    `agentNumber` VARCHAR(191) NULL,
    `employerAbroad` VARCHAR(191) NULL,
    `recruiterCode` VARCHAR(191) NULL,
    `countryOfDestination` VARCHAR(191) NULL,
    `natureOfWork` VARCHAR(191) NULL,
    `durationType` VARCHAR(191) NULL,
    `workDuration` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NULL,
    `monthlyRemuneration` DECIMAL(12, 2) NULL,
    `convertedKesAmount` DECIMAL(12, 2) NULL,

    UNIQUE INDEX `recruitment_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budget_items` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `cost` DECIMAL(12, 2) NOT NULL,

    INDEX `budget_items_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `individual_bank_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `branchName` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `individual_bank_accounts_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credit_history_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `lender` VARCHAR(191) NULL,
    `amount` DECIMAL(12, 2) NULL,
    `outstandingAmount` DECIMAL(12, 2) NULL,
    `monthlyInstallment` DECIMAL(12, 2) NULL,
    `loanDate` DATETIME(3) NULL,
    `duration` VARCHAR(191) NULL,

    UNIQUE INDEX `credit_history_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `signature_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `digitalSignature` LONGTEXT NOT NULL,

    UNIQUE INDEX `signature_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_documents` (
    `id` VARCHAR(191) NOT NULL,
    `groupApplicationId` VARCHAR(191) NULL,
    `individualApplicationId` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `storagePath` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `application_documents_groupApplicationId_idx`(`groupApplicationId`),
    INDEX `application_documents_individualApplicationId_idx`(`individualApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `counties_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constituencies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `countyId` INTEGER NOT NULL,

    UNIQUE INDEX `constituencies_countyId_name_key`(`countyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `constituencyId` INTEGER NOT NULL,

    UNIQUE INDEX `wards_constituencyId_name_key`(`constituencyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `group_data` ADD CONSTRAINT `group_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_membership` ADD CONSTRAINT `group_membership_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_background` ADD CONSTRAINT `group_background_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_bank_accounts` ADD CONSTRAINT `group_bank_accounts_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `individual_applications` ADD CONSTRAINT `individual_applications_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `group_members`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_data` ADD CONSTRAINT `location_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `next_of_kin_data` ADD CONSTRAINT `next_of_kin_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recruitment_data` ADD CONSTRAINT `recruitment_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budget_items` ADD CONSTRAINT `budget_items_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `individual_bank_accounts` ADD CONSTRAINT `individual_bank_accounts_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credit_history_data` ADD CONSTRAINT `credit_history_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signature_data` ADD CONSTRAINT `signature_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_documents` ADD CONSTRAINT `application_documents_groupApplicationId_fkey` FOREIGN KEY (`groupApplicationId`) REFERENCES `group_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `application_documents` ADD CONSTRAINT `application_documents_individualApplicationId_fkey` FOREIGN KEY (`individualApplicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `constituencies` ADD CONSTRAINT `constituencies_countyId_fkey` FOREIGN KEY (`countyId`) REFERENCES `counties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wards` ADD CONSTRAINT `wards_constituencyId_fkey` FOREIGN KEY (`constituencyId`) REFERENCES `constituencies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

