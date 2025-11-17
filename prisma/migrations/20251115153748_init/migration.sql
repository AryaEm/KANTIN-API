/*
  Warnings:

  - You are about to drop the column `uuid` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `siswa` DROP FOREIGN KEY `Siswa_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `stan` DROP FOREIGN KEY `Stan_id_user_fkey`;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `uuid`;

-- AddForeignKey
ALTER TABLE `Siswa` ADD CONSTRAINT `Siswa_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stan` ADD CONSTRAINT `Stan_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
