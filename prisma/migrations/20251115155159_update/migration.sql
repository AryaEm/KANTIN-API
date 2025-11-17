-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_id_menu_fkey`;

-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_id_transaksi_fkey`;

-- DropForeignKey
ALTER TABLE `menu` DROP FOREIGN KEY `Menu_id_stan_fkey`;

-- DropForeignKey
ALTER TABLE `menudiskon` DROP FOREIGN KEY `MenuDiskon_id_diskon_fkey`;

-- DropForeignKey
ALTER TABLE `menudiskon` DROP FOREIGN KEY `MenuDiskon_id_menu_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `Transaksi_id_stan_fkey`;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuDiskon` ADD CONSTRAINT `MenuDiskon_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuDiskon` ADD CONSTRAINT `MenuDiskon_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `Diskon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
