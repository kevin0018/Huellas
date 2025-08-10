-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` ENUM('owner', 'volunteer') NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Owner` (
    `id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Volunteer` (
    `id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `race` VARCHAR(191) NOT NULL,
    `type` ENUM('dog', 'cat', 'ferret') NOT NULL,
    `owner_id` INTEGER NOT NULL,
    `birth_date` DATE NOT NULL,
    `size` ENUM('large', 'medium', 'small') NOT NULL,
    `microchip_code` VARCHAR(191) NOT NULL,
    `sex` ENUM('male', 'female') NOT NULL,
    `has_passport` BOOLEAN NOT NULL,
    `country_of_origin` VARCHAR(191) NULL,
    `passport_number` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `Pet_microchip_code_key`(`microchip_code`),
    INDEX `Pet_owner_id_idx`(`owner_id`),
    INDEX `Pet_type_idx`(`type`),
    INDEX `Pet_size_idx`(`size`),
    INDEX `Pet_sex_idx`(`sex`),
    INDEX `Pet_birth_date_idx`(`birth_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Checkup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pet_id` INTEGER NOT NULL,
    `procedure_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `Checkup_pet_id_idx`(`pet_id`),
    INDEX `Checkup_procedure_id_idx`(`procedure_id`),
    INDEX `Checkup_date_idx`(`date`),
    INDEX `Checkup_pet_id_date_idx`(`pet_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pet_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `reason` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `Appointment_pet_id_idx`(`pet_id`),
    INDEX `Appointment_date_idx`(`date`),
    INDEX `Appointment_pet_id_date_idx`(`pet_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProcedureSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `animal_type` ENUM('dog', 'cat', 'ferret') NOT NULL,
    `procedure_name` VARCHAR(191) NOT NULL,
    `recommended_age_months` INTEGER NOT NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `ProcedureSchedule_animal_type_idx`(`animal_type`),
    INDEX `ProcedureSchedule_procedure_name_idx`(`procedure_name`),
    UNIQUE INDEX `ProcedureSchedule_animal_type_procedure_name_key`(`animal_type`, `procedure_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Owner` ADD CONSTRAINT `Owner_id_fkey` FOREIGN KEY (`id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Volunteer` ADD CONSTRAINT `Volunteer_id_fkey` FOREIGN KEY (`id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Checkup` ADD CONSTRAINT `Checkup_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Checkup` ADD CONSTRAINT `Checkup_procedure_id_fkey` FOREIGN KEY (`procedure_id`) REFERENCES `ProcedureSchedule`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
