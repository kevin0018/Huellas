CREATE TABLE `HealthShare` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `pet_id` INTEGER NOT NULL,
  `token_hash` VARCHAR(191) NOT NULL,
  `sections` JSON NOT NULL,
  `period_from` DATETIME(3) NULL,
  `period_to` DATETIME(3) NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `revoked_at` DATETIME(3) NULL,
  `created_by` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `HealthShare_token_hash_key`(`token_hash`),
  INDEX `HealthShare_pet_id_expires_at_idx`(`pet_id`, `expires_at`),
  INDEX `HealthShare_created_by_idx`(`created_by`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `HealthShare` ADD CONSTRAINT `HealthShare_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE `HealthShare` ADD CONSTRAINT `HealthShare_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
