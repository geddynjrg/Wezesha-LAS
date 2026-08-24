-- CreateTable
CREATE TABLE `tripartite_data` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `migrantName` VARCHAR(191) NOT NULL,
    `idNumber` VARCHAR(191) NOT NULL,
    `passportNumber` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `tripartite_data_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tripartite_data` ADD CONSTRAINT `tripartite_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
