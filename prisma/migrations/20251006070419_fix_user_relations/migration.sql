-- DropForeignKey
ALTER TABLE `ContributionPayments` DROP FOREIGN KEY `ContributionPayments_contribution_id_fkey`;

-- DropForeignKey
ALTER TABLE `ContributionPayments` DROP FOREIGN KEY `ContributionPayments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Expenses` DROP FOREIGN KEY `Expenses_approved_by_fkey`;

-- DropForeignKey
ALTER TABLE `Expenses` DROP FOREIGN KEY `Expenses_linked_contribution_id_fkey`;

-- DropForeignKey
ALTER TABLE `FeePayments` DROP FOREIGN KEY `FeePayments_fee_id_fkey`;

-- DropForeignKey
ALTER TABLE `Fees` DROP FOREIGN KEY `Fees_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `PayrollAdjustments` DROP FOREIGN KEY `PayrollAdjustments_assignment_id_fkey`;

-- DropForeignKey
ALTER TABLE `PayrollAssignments` DROP FOREIGN KEY `PayrollAssignments_staff_id_fkey`;

-- DropForeignKey
ALTER TABLE `PayrollPayments` DROP FOREIGN KEY `PayrollPayments_assignment_id_fkey`;

-- DropIndex
DROP INDEX `ContributionPayments_contribution_id_fkey` ON `ContributionPayments`;

-- DropIndex
DROP INDEX `ContributionPayments_user_id_fkey` ON `ContributionPayments`;

-- DropIndex
DROP INDEX `Expenses_approved_by_fkey` ON `Expenses`;

-- DropIndex
DROP INDEX `Expenses_linked_contribution_id_fkey` ON `Expenses`;

-- DropIndex
DROP INDEX `FeePayments_fee_id_fkey` ON `FeePayments`;

-- DropIndex
DROP INDEX `Fees_user_id_fkey` ON `Fees`;

-- DropIndex
DROP INDEX `PayrollAdjustments_assignment_id_fkey` ON `PayrollAdjustments`;

-- DropIndex
DROP INDEX `PayrollAssignments_staff_id_fkey` ON `PayrollAssignments`;

-- DropIndex
DROP INDEX `PayrollPayments_assignment_id_fkey` ON `PayrollPayments`;

-- AddForeignKey
ALTER TABLE `Fees` ADD CONSTRAINT `Fees_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeePayments` ADD CONSTRAINT `FeePayments_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `Fees`(`fee_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollAssignments` ADD CONSTRAINT `PayrollAssignments_staff_id_fkey` FOREIGN KEY (`staff_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollAdjustments` ADD CONSTRAINT `PayrollAdjustments_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `PayrollAssignments`(`assignment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PayrollPayments` ADD CONSTRAINT `PayrollPayments_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `PayrollAssignments`(`assignment_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContributionPayments` ADD CONSTRAINT `ContributionPayments_contribution_id_fkey` FOREIGN KEY (`contribution_id`) REFERENCES `Contributions`(`contribution_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContributionPayments` ADD CONSTRAINT `ContributionPayments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expenses` ADD CONSTRAINT `Expenses_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `Users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expenses` ADD CONSTRAINT `Expenses_linked_contribution_id_fkey` FOREIGN KEY (`linked_contribution_id`) REFERENCES `Contributions`(`contribution_id`) ON DELETE CASCADE ON UPDATE CASCADE;
