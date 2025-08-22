-- DropForeignKey
ALTER TABLE `Owner` DROP FOREIGN KEY `Owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `Volunteer` DROP FOREIGN KEY `Volunteer_id_fkey`;

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `Owner` ADD CONSTRAINT `Owner_id_fkey` FOREIGN KEY (`id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Volunteer` ADD CONSTRAINT `Volunteer_id_fkey` FOREIGN KEY (`id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
