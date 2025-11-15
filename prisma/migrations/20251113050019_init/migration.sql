/*
  Warnings:

  - You are about to drop the column `persentase` on the `diskon` table. All the data in the column will be lost.
  - You are about to alter the column `harga` on the `menu` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to drop the column `Telp` on the `stan` table. All the data in the column will be lost.
  - You are about to drop the `detail_transaksi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menu_diskon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `persentase_diskon` to the `Diskon` table without a default value. This is not possible if the table is not empty.
  - Made the column `deskripsi` on table `menu` required. This step will fail if there are existing NULL values in that column.
  - Made the column `foto` on table `menu` required. This step will fail if there are existing NULL values in that column.
  - Made the column `foto` on table `siswa` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `telp` to the `Stan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `detail_transaksi` DROP FOREIGN KEY `detail_transaksi_id_menu_fkey`;

-- DropForeignKey
ALTER TABLE `detail_transaksi` DROP FOREIGN KEY `detail_transaksi_id_transaksi_fkey`;

-- DropForeignKey
ALTER TABLE `menu` DROP FOREIGN KEY `menu_id_stan_fkey`;

-- DropForeignKey
ALTER TABLE `menu_diskon` DROP FOREIGN KEY `menu_diskon_id_diskon_fkey`;

-- DropForeignKey
ALTER TABLE `menu_diskon` DROP FOREIGN KEY `menu_diskon_id_menu_fkey`;

-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `siswa_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `stan` DROP FOREIGN KEY `stan_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_siswa_fkey`;

-- DropForeignKey
ALTER TABLE `transaksi` DROP FOREIGN KEY `transaksi_id_stan_fkey`;

-- AlterTable
ALTER TABLE `diskon` DROP COLUMN `persentase`,
    ADD COLUMN `persentase_diskon` DOUBLE NOT NULL,
    ALTER COLUMN `nama_diskon` DROP DEFAULT,
    ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `menu` MODIFY `deskripsi` VARCHAR(191) NOT NULL,
    MODIFY `foto` VARCHAR(191) NOT NULL,
    MODIFY `harga` DOUBLE NOT NULL,
    ALTER COLUMN `id_stan` DROP DEFAULT,
    ALTER COLUMN `jenis` DROP DEFAULT,
    ALTER COLUMN `nama_makanan` DROP DEFAULT;

-- AlterTable
ALTER TABLE `siswa` ALTER COLUMN `nama_siswa` DROP DEFAULT,
    ALTER COLUMN `alamat` DROP DEFAULT,
    ALTER COLUMN `telp` DROP DEFAULT,
    MODIFY `foto` VARCHAR(191) NOT NULL,
    ALTER COLUMN `id_user` DROP DEFAULT;

-- AlterTable
ALTER TABLE `stan` DROP COLUMN `Telp`,
    ADD COLUMN `telp` VARCHAR(191) NOT NULL,
    ALTER COLUMN `nama_stan` DROP DEFAULT,
    ALTER COLUMN `nama_pemilik` DROP DEFAULT,
    ALTER COLUMN `id_user` DROP DEFAULT;

-- AlterTable
ALTER TABLE `transaksi` ALTER COLUMN `tanggal` DROP DEFAULT,
    ALTER COLUMN `id_stan` DROP DEFAULT,
    ALTER COLUMN `id_siswa` DROP DEFAULT;

-- DropTable
DROP TABLE `detail_transaksi`;

-- DropTable
DROP TABLE `menu_diskon`;

-- DropTable
DROP TABLE `users`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('admin_stan', 'siswa') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DetailTransaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_menu` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `harga_beli` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MenuDiskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_menu` INTEGER NOT NULL,
    `id_diskon` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Siswa` ADD CONSTRAINT `Siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stan` ADD CONSTRAINT `Stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuDiskon` ADD CONSTRAINT `MenuDiskon_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MenuDiskon` ADD CONSTRAINT `MenuDiskon_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `Diskon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
