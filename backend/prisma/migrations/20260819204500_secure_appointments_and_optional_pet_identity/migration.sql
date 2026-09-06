-- Appointment timestamps are stored in UTC by the API. Existing DATE values
-- are preserved as midnight because their original time was never persisted.
ALTER TABLE `Appointment`
  MODIFY `date` DATETIME(3) NOT NULL,
  ADD COLUMN `status` ENUM('scheduled', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled';

-- MySQL unique indexes permit multiple NULL values, so real microchip values
-- remain unique while pets without a known chip can coexist.
ALTER TABLE `Pet`
  MODIFY `race` VARCHAR(191) NULL,
  MODIFY `microchip_code` VARCHAR(191) NULL;
