-- AlterTable
ALTER TABLE `detailtransaksi` ADD COLUMN `persentase_diskon` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `potongan` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;
