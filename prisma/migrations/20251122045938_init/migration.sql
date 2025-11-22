/*
  Warnings:

  - You are about to drop the column `nama_makanan` on the `menu` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `nama_makanan`,
    ADD COLUMN `nama_menu` VARCHAR(191) NOT NULL DEFAULT '';
