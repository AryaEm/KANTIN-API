-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `siswa` MODIFY `jenis_kelamin` ENUM('laki_laki', 'perempuan') NOT NULL DEFAULT 'laki_laki';
