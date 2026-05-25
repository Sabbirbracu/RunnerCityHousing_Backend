/*
  Warnings:

  - You are about to drop the column `assigned_to` on the `Plot` table. All the data in the column will be lost.
  - You are about to drop the column `is_assigned` on the `Plot` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Plot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Users` DROP FOREIGN KEY `Users_plot_no_fkey`;

-- DropIndex
DROP INDEX `Plot_assigned_to_key` ON `Plot`;

-- DropIndex
DROP INDEX `Users_plot_no_key` ON `Users`;

-- AlterTable
ALTER TABLE `Plot` DROP COLUMN `assigned_to`,
    DROP COLUMN `is_assigned`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `dispute_notes` TEXT NULL,
    ADD COLUMN `dispute_resolved_at` DATETIME(3) NULL,
    ADD COLUMN `is_disputed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `plot_type` VARCHAR(191) NOT NULL DEFAULT 'single_unit',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `owner_name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Users` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `flat_count` INTEGER NULL,
    ADD COLUMN `rejection_reason` VARCHAR(500) NULL,
    ADD COLUMN `relationship_type` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'pending_review';

-- CreateTable
CREATE TABLE `Flat` (
    `flat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `flat_no` VARCHAR(191) NOT NULL,
    `floor` INTEGER NOT NULL,
    `plot_no` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Flat_plot_no_idx`(`plot_no`),
    UNIQUE INDEX `Flat_plot_no_flat_no_key`(`plot_no`, `flat_no`),
    PRIMARY KEY (`flat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ownership` (
    `ownership_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `plot_no` VARCHAR(191) NOT NULL,
    `flat_id` INTEGER NULL,
    `ownership_type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Ownership_user_id_idx`(`user_id`),
    INDEX `Ownership_plot_no_idx`(`plot_no`),
    INDEX `Ownership_flat_id_idx`(`flat_id`),
    PRIMARY KEY (`ownership_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OwnershipTransfer` (
    `transfer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_user_id` INTEGER NOT NULL,
    `to_user_id` INTEGER NOT NULL,
    `plot_no` VARCHAR(191) NOT NULL,
    `flat_id` INTEGER NULL,
    `reason` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(500) NULL,
    `transfer_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OwnershipTransfer_from_idx`(`from_user_id`),
    INDEX `OwnershipTransfer_to_idx`(`to_user_id`),
    PRIMARY KEY (`transfer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Users_plot_no_idx` ON `Users`(`plot_no`);

-- CreateIndex
CREATE INDEX `Users_status_idx` ON `Users`(`status`);

-- AddForeignKey
ALTER TABLE `Flat` ADD CONSTRAINT `Flat_plot_no_fkey` FOREIGN KEY (`plot_no`) REFERENCES `Plot`(`plot_no`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ownership` ADD CONSTRAINT `Ownership_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ownership` ADD CONSTRAINT `Ownership_plot_no_fkey` FOREIGN KEY (`plot_no`) REFERENCES `Plot`(`plot_no`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ownership` ADD CONSTRAINT `Ownership_flat_id_fkey` FOREIGN KEY (`flat_id`) REFERENCES `Flat`(`flat_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnershipTransfer` ADD CONSTRAINT `OwnershipTransfer_from_user_id_fkey` FOREIGN KEY (`from_user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OwnershipTransfer` ADD CONSTRAINT `OwnershipTransfer_to_user_id_fkey` FOREIGN KEY (`to_user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
