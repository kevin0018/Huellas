ALTER TABLE `Owner`
  ADD COLUMN `notifications_enabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `reminder_lead_days` INTEGER NOT NULL DEFAULT 14;

CREATE TABLE `Reminder` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `pet_id` INTEGER NOT NULL,
  `source` ENUM('APPOINTMENT', 'PREVENTIVE_PLAN') NOT NULL,
  `source_key` VARCHAR(191) NOT NULL,
  `preventive_procedure_id` INTEGER NULL,
  `title` VARCHAR(191) NOT NULL,
  `due_at` DATETIME(3) NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `snoozed_until` DATETIME(3) NULL,
  `completed_at` DATETIME(3) NULL,
  `cancelled_at` DATETIME(3) NULL,
  `generated_action_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Reminder_source_key_key`(`source_key`),
  INDEX `Reminder_pet_id_status_due_at_idx`(`pet_id`, `status`, `due_at`),
  INDEX `Reminder_preventive_procedure_id_idx`(`preventive_procedure_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `Reminder` ADD CONSTRAINT `Reminder_preventive_procedure_id_fkey` FOREIGN KEY (`preventive_procedure_id`) REFERENCES `ProcedureSchedule`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
