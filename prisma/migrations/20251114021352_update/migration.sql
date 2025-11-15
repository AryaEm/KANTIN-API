-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `jenis_kelamin` ENUM('laki_laki', 'perempuan') NOT NULL DEFAULT 'laki_laki',
    ADD COLUMN `nomor_telp` VARCHAR(191) NOT NULL DEFAULT '';
