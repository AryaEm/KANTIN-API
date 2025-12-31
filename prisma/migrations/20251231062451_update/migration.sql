/*
  Warnings:

  - The values [dimasak,diantar,sampai] on the enum `Transaksi_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `transaksi` MODIFY `status` ENUM('belum_dikonfirmasi', 'selesai') NOT NULL DEFAULT 'belum_dikonfirmasi';
