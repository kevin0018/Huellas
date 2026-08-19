CREATE TABLE `HealthDocument` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `pet_id` INTEGER NOT NULL,
  `health_event_id` INTEGER NULL,
  `file_name` VARCHAR(191) NOT NULL,
  `mime_type` VARCHAR(191) NOT NULL,
  `size_bytes` INTEGER NOT NULL,
  `content` LONGBLOB NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `HealthDocument_pet_id_idx`(`pet_id`),
  INDEX `HealthDocument_health_event_id_idx`(`health_event_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `HealthDocument` ADD CONSTRAINT `HealthDocument_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
-- Deleting an event deliberately deletes its attachments; pet-level documents remain.
ALTER TABLE `HealthDocument` ADD CONSTRAINT `HealthDocument_health_event_id_fkey` FOREIGN KEY (`health_event_id`) REFERENCES `HealthEvent`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
