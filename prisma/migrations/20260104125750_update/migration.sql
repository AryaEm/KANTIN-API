/*
  Warnings:

  - You are about to drop the column `harga_beli` on the `detailtransaksi` table. All the data in the column will be lost.
  - You are about to drop the column `potongan` on the `detailtransaksi` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kode_transaksi]` on the table `Transaksi` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `harga_asli` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harga_setelah_diskon` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_menu` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `DetailTransaksi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode_transaksi` to the `Transaksi` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `detailtransaksi` DROP FOREIGN KEY `DetailTransaksi_id_menu_fkey`;

-- AlterTable
ALTER TABLE `detailtransaksi` DROP COLUMN `harga_beli`,
    DROP COLUMN `potongan`,
    ADD COLUMN `harga_asli` INTEGER NOT NULL,
    ADD COLUMN `harga_setelah_diskon` INTEGER NOT NULL,
    ADD COLUMN `nama_menu` VARCHAR(191) NOT NULL,
    ADD COLUMN `subtotal` INTEGER NOT NULL,
    MODIFY `id_menu` INTEGER NULL,
    ALTER COLUMN `qty` DROP DEFAULT;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `kode_transaksi` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Transaksi_kode_transaksi_key` ON `Transaksi`(`kode_transaksi`);

-- AddForeignKey
ALTER TABLE `DetailTransaksi` ADD CONSTRAINT `DetailTransaksi_id_menu_fkey` FOREIGN KEY (`id_menu`) REFERENCES `Menu`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
