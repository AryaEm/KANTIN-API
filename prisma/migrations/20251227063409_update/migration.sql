/*
  Warnings:

  - Made the column `id_stan` on table `diskon` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `diskon` DROP FOREIGN KEY `Diskon_id_stan_fkey`;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT,
    MODIFY `id_stan` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Diskon` ADD CONSTRAINT `Diskon_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
