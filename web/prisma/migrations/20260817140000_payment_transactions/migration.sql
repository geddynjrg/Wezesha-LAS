-- CreateTable
CREATE TABLE `payment_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `individualApplicationId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `billRefNumber` VARCHAR(191) NOT NULL,
    `amountExpected` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'KES',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `clientName` VARCHAR(191) NOT NULL,
    `clientMSISDN` VARCHAR(191) NOT NULL,
    `clientIDNumber` VARCHAR(191) NOT NULL,
    `clientEmail` VARCHAR(191) NOT NULL,
    `checkoutPayload` JSON NOT NULL,
    `pesaflowPaymentRef` VARCHAR(191) NULL,
    `pesaflowInvoiceNumber` VARCHAR(191) NULL,
    `paymentChannel` VARCHAR(191) NULL,
    `amountPaid` DOUBLE NULL,
    `ipnPayload` JSON NULL,
    `smsSentAt` DATETIME(3) NULL,
    `lastReminderAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payment_transactions_billRefNumber_key`(`billRefNumber`),
    INDEX `payment_transactions_individualApplicationId_idx`(`individualApplicationId`),
    INDEX `payment_transactions_memberId_idx`(`memberId`),
    INDEX `payment_transactions_status_idx`(`status`),
    INDEX `payment_transactions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_transactions` ADD CONSTRAINT `payment_transactions_individualApplicationId_fkey` FOREIGN KEY (`individualApplicationId`) REFERENCES `individual_applications`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
