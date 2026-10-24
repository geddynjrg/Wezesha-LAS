ALTER TABLE `individual_applications`
  ADD COLUMN `exitedCountry` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `airTicketAmount` DECIMAL(12, 2) NULL,
  ADD COLUMN `visaApplicationAmount` DECIMAL(12, 2) NULL,
  ADD COLUMN `upkeepTradeAmount` DECIMAL(12, 2) NULL,
  ADD COLUMN `offerLetterSignature` LONGTEXT NULL,
  ADD COLUMN `offerLetterSignedAt` DATETIME(3) NULL;
