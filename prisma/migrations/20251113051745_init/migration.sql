/*
  Warnings:

  - You are about to drop the column `foto` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `foto`,
    ADD COLUMN `profile` VARCHAR(191) NULL DEFAULT '';
