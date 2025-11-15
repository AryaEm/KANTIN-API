-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `siswa` MODIFY `foto` VARCHAR(191) NULL DEFAULT '';
