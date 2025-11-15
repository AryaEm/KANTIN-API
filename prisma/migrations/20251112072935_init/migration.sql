/*
  Warnings:

  - You are about to drop the column `category` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `menu` table. All the data in the column will be lost.
  - You are about to drop the `order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderlist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_menuId_fkey`;

-- DropForeignKey
ALTER TABLE `orderlist` DROP FOREIGN KEY `OrderList_orderId_fkey`;

-- DropIndex
DROP INDEX `Menu_uuid_key` ON `menu`;

-- AlterTable
ALTER TABLE `menu` DROP COLUMN `category`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `name`,
    DROP COLUMN `picture`,
    DROP COLUMN `price`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `uuid`,
    ADD COLUMN `deskripsi` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `foto` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `harga` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `id_stan` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `jenis` ENUM('makanan', 'minuman') NOT NULL DEFAULT 'makanan',
    ADD COLUMN `nama_makanan` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `order`;

-- DropTable
DROP TABLE `orderlist`;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL DEFAULT '',
    `role` ENUM('admin_stan', 'siswa') NOT NULL DEFAULT 'siswa',

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_siswa` VARCHAR(191) NOT NULL DEFAULT '',
    `alamat` VARCHAR(191) NOT NULL DEFAULT '',
    `telp` VARCHAR(191) NOT NULL DEFAULT '',
    `foto` VARCHAR(191) NULL DEFAULT '',
    `id_user` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_stan` VARCHAR(191) NOT NULL DEFAULT '',
    `nama_pemilik` VARCHAR(191) NOT NULL DEFAULT '',
    `Telp` VARCHAR(191) NOT NULL DEFAULT '',
    `id_user` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_stan` INTEGER NOT NULL DEFAULT 0,
    `id_siswa` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('belum_dikonfirmasi', 'dimasak', 'diantar', 'sampai') NOT NULL DEFAULT 'belum_dikonfirmasi',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_menu` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL DEFAULT 0,
    `harga_beli` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(191) NOT NULL DEFAULT '',
    `persentase` INTEGER NOT NULL DEFAULT 0,
    `tanggal_awal` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_akhir` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_menu` INTEGER NOT NULL,
    `id_diskon` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stan` ADD CONSTRAINT `stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu` ADD CONSTRAINT `menu_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `stan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_transaksi` ADD CONSTRAINT `detail_transaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_diskon` ADD CONSTRAINT `menu_diskon_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
