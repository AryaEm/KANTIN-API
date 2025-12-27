-- AlterTable
ALTER TABLE `diskon` ADD COLUMN `id_stan` INTEGER NULL,
    ALTER COLUMN `tanggal_awal` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Diskon` ADD CONSTRAINT `Diskon_id_stan_fkey` FOREIGN KEY (`id_stan`) REFERENCES `Stan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
