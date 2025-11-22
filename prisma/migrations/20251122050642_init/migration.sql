-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `menu` ADD COLUMN `status` ENUM('tersedia', 'habis') NOT NULL DEFAULT 'tersedia';
