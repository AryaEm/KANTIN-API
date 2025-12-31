-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `transaksi` MODIFY `status` ENUM('belum_dikonfirmasi', 'proses', 'selesai') NOT NULL DEFAULT 'belum_dikonfirmasi';
