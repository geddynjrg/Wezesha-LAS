-- AlterEnum
ALTER TABLE `group_members` MODIFY COLUMN `loanStatus` ENUM('PENDING', 'INDIVIDUAL_DRAFT', 'INDIVIDUAL_SUBMITTED', 'AMOUNT_APPROVED', 'DISBURSED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `individual_applications`
  ADD COLUMN `loanAmountApproved` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `loanAmountApprovedAt` DATETIME(3) NULL,
  ADD COLUMN `predisbursementAccepted` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `predisbursementAcceptedAt` DATETIME(3) NULL;
