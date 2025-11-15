/*
  Warnings:

  - You are about to drop the column `jenis_kelamin` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `jenis_kelamin` ENUM('laki_laki', 'perempuan') NOT NULL DEFAULT 'laki_laki';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `jenis_kelamin`;
