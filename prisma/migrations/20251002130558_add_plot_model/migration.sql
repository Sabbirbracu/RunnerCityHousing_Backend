/*
  Warnings:

  - You are about to drop the column `building_no` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `flat_no` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `building_no`,
    DROP COLUMN `flat_no`,
    ADD COLUMN `holding_no` VARCHAR(191) NULL,
    ADD COLUMN `plot_no` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE `Plot` (
    `plot_no` VARCHAR(191) NOT NULL,
    `owner_name` VARCHAR(191) NOT NULL,
    `is_assigned` BOOLEAN NOT NULL DEFAULT false,
    `assigned_to` INTEGER NULL,

    UNIQUE INDEX `Plot_assigned_to_key`(`assigned_to`),
    PRIMARY KEY (`plot_no`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Plot` ADD CONSTRAINT `Plot_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `Users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
