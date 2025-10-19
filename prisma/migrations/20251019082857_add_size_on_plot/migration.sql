/*
  Warnings:

  - You are about to alter the column `size` on the `Plot` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Plot` MODIFY `size` DOUBLE NOT NULL DEFAULT 0.0;
