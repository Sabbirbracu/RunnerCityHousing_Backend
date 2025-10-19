-- CreateTable
CREATE TABLE `Users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL,
    `blood_group` VARCHAR(191) NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `holding_no` VARCHAR(191) NULL,
    `plot_no` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_plot_no_key`(`plot_no`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plot` (
    `plot_no` VARCHAR(191) NOT NULL,
    `owner_name` VARCHAR(191) NOT NULL,
    `size` DOUBLE NOT NULL DEFAULT 0.0,
    `is_assigned` BOOLEAN NOT NULL DEFAULT false,
    `assigned_to` INTEGER NULL,

    UNIQUE INDEX `Plot_assigned_to_key`(`assigned_to`),
    PRIMARY KEY (`plot_no`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Fees` (
    `fee_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `amount_due` DECIMAL(65, 30) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `Fees_user_id_fkey`(`user_id`),
    PRIMARY KEY (`fee_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeePayments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `fee_id` INTEGER NOT NULL,
    `amount_paid` DECIMAL(65, 30) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NULL,

    INDEX `FeePayments_fee_id_fkey`(`fee_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollAssignments` (
    `assignment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `staff_id` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `base_amount` DECIMAL(65, 30) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `PayrollAssignments_staff_id_fkey`(`staff_id`),
    PRIMARY KEY (`assignment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollAdjustments` (
    `adjustment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignment_id` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `reason` VARCHAR(191) NULL,

    INDEX `PayrollAdjustments_assignment_id_fkey`(`assignment_id`),
    PRIMARY KEY (`adjustment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayrollPayments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignment_id` INTEGER NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `total_paid` DECIMAL(65, 30) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,

    INDEX `PayrollPayments_assignment_id_fkey`(`assignment_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contributions` (
    `contribution_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `target_amount` DECIMAL(65, 30) NOT NULL,
    `collected_amount` DECIMAL(65, 30) NULL DEFAULT 0.0,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`contribution_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContributionPayments` (
    `payment_id` INTEGER NOT NULL AUTO_INCREMENT,
    `contribution_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `transaction_id` VARCHAR(191) NULL,

    INDEX `ContributionPayments_contribution_id_fkey`(`contribution_id`),
    INDEX `ContributionPayments_user_id_fkey`(`user_id`),
    PRIMARY KEY (`payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expenses` (
    `expense_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `total_amount` DECIMAL(65, 30) NOT NULL,
    `paid_by` VARCHAR(191) NOT NULL,
    `payment_date` DATETIME(3) NOT NULL,
    `approved_by` INTEGER NOT NULL,
    `linked_contribution_id` INTEGER NULL,
    `receipt_path` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `Expenses_approved_by_fkey`(`approved_by`),
    INDEX `Expenses_linked_contribution_id_fkey`(`linked_contribution_id`),
    PRIMARY KEY (`expense_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_plot_no_fkey` FOREIGN KEY (`plot_no`) REFERENCES `Plot`(`plot_no`) ON DELETE SET NULL ON UPDATE CASCADE;

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
