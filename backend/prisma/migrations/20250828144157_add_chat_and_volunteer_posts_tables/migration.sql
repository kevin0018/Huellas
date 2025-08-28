-- CreateTable
CREATE TABLE `Conversation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by` INTEGER NOT NULL,

    INDEX `Conversation_status_idx`(`status`),
    INDEX `Conversation_created_by_idx`(`created_by`),
    INDEX `Conversation_created_at_idx`(`created_at`),
    INDEX `Conversation_updated_at_idx`(`updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_read_at` DATETIME(3) NULL,

    INDEX `ConversationParticipant_conversation_id_idx`(`conversation_id`),
    INDEX `ConversationParticipant_user_id_idx`(`user_id`),
    INDEX `ConversationParticipant_joined_at_idx`(`joined_at`),
    UNIQUE INDEX `ConversationParticipant_conversation_id_user_id_key`(`conversation_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'FILE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `edited_at` DATETIME(3) NULL,

    INDEX `Message_conversation_id_idx`(`conversation_id`),
    INDEX `Message_sender_id_idx`(`sender_id`),
    INDEX `Message_created_at_idx`(`created_at`),
    INDEX `Message_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VolunteerPost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `author_id` INTEGER NOT NULL,
    `category` ENUM('GENERAL', 'URGENT', 'EVENT', 'VOLUNTEER_NEEDED', 'ANNOUNCEMENT') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `published_at` DATETIME(3) NULL,
    `expires_at` DATETIME(3) NULL,

    INDEX `VolunteerPost_author_id_idx`(`author_id`),
    INDEX `VolunteerPost_category_idx`(`category`),
    INDEX `VolunteerPost_status_idx`(`status`),
    INDEX `VolunteerPost_created_at_idx`(`created_at`),
    INDEX `VolunteerPost_published_at_idx`(`published_at`),
    INDEX `VolunteerPost_expires_at_idx`(`expires_at`),
    INDEX `VolunteerPost_category_status_idx`(`category`, `status`),
    INDEX `VolunteerPost_status_published_at_idx`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `VolunteerPost` ADD CONSTRAINT `VolunteerPost_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
