-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `uuid` VARCHAR(191) NOT NULL DEFAULT '';
