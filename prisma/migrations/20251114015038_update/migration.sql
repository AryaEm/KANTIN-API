/*
  Warnings:

  - You are about to drop the column `uuid` on the `siswa` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `profile` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_user]` on the table `Siswa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_user]` on the table `Stan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_username_key` ON `user`;

-- AlterTable
ALTER TABLE `diskon` ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AlterTable
ALTER TABLE `menu` MODIFY `deskripsi` TEXT NULL DEFAULT '',
    MODIFY `foto` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `siswa` DROP COLUMN `uuid`,
    MODIFY `foto` VARCHAR(191) NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `profile`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `uuid`,
    MODIFY `username` VARCHAR(191) NOT NULL DEFAULT '',
    ALTER COLUMN `role` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Siswa_id_user_key` ON `Siswa`(`id_user`);

-- CreateIndex
CREATE UNIQUE INDEX `Stan_id_user_key` ON `Stan`(`id_user`);
