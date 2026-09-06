CREATE TABLE `HealthEvent` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `pet_id` INTEGER NOT NULL,
  `type` ENUM('VACCINATION', 'GENERAL_CHECKUP', 'MEDICATION', 'TREATMENT', 'TEST', 'SURGERY', 'WEIGHT', 'OTHER') NOT NULL,
  `occurred_at` DATETIME(3) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `notes` TEXT NULL,
  `provider` VARCHAR(191) NULL,
  `result` TEXT NULL,
  `dose` VARCHAR(191) NULL,
  `lot_number` VARCHAR(191) NULL,
  `expires_at` DATETIME(3) NULL,
  `entered_by` INTEGER NOT NULL,
  `verified_by` INTEGER NULL,
  `source` ENUM('OWNER', 'LEGACY_CHECKUP', 'APPOINTMENT') NOT NULL DEFAULT 'OWNER',
  `source_appointment_id` INTEGER NULL,
  `legacy_checkup_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `HealthEvent_legacy_checkup_id_key`(`legacy_checkup_id`),
  INDEX `HealthEvent_pet_id_occurred_at_idx`(`pet_id`, `occurred_at`),
  INDEX `HealthEvent_type_idx`(`type`),
  INDEX `HealthEvent_expires_at_idx`(`expires_at`),
  INDEX `HealthEvent_source_appointment_id_idx`(`source_appointment_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `HealthEvent` ADD CONSTRAINT `HealthEvent_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `HealthEvent` ADD CONSTRAINT `HealthEvent_entered_by_fkey` FOREIGN KEY (`entered_by`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE `HealthEvent` ADD CONSTRAINT `HealthEvent_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;
ALTER TABLE `HealthEvent` ADD CONSTRAINT `HealthEvent_source_appointment_id_fkey` FOREIGN KEY (`source_appointment_id`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- Preserve every historical checkup as a first-class health event while the
-- legacy endpoints remain available during the frontend transition.
INSERT INTO `HealthEvent` (`pet_id`, `type`, `occurred_at`, `title`, `notes`, `entered_by`, `source`, `legacy_checkup_id`, `created_at`, `updated_at`)
SELECT c.`pet_id`,
  CASE
    WHEN LOWER(p.`procedure_name`) LIKE '%vacun%' THEN 'VACCINATION'
    WHEN LOWER(p.`procedure_name`) LIKE '%test%' THEN 'TEST'
    WHEN LOWER(p.`procedure_name`) LIKE '%chequeo%' OR LOWER(p.`procedure_name`) LIKE '%revisi%' THEN 'GENERAL_CHECKUP'
    WHEN LOWER(p.`procedure_name`) LIKE '%paras%' THEN 'TREATMENT'
    ELSE 'OTHER'
  END,
  c.`date`, p.`procedure_name`, c.`notes`, pet.`owner_id`, 'LEGACY_CHECKUP', c.`id`, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)
FROM `Checkup` c
JOIN `ProcedureSchedule` p ON p.`id` = c.`procedure_id`
JOIN `Pet` pet ON pet.`id` = c.`pet_id`;
