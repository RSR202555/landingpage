-- AlterTable
ALTER TABLE `Setting` ADD COLUMN `workshopsEmptyText` TEXT NULL,
    ADD COLUMN `workshopsIntroText` TEXT NULL,
    MODIFY `aboutMe` TEXT NULL;

-- AlterTable
ALTER TABLE `Workshop` ADD COLUMN `imageUrl` VARCHAR(191) NULL;
