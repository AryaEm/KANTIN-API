-- AlterTable
ALTER TABLE `detailtransaksi` MODIFY `qty` INTEGER NOT NULL DEFAULT 0,
    MODIFY `harga_beli` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `diskon` MODIFY `nama_diskon` VARCHAR(191) NOT NULL DEFAULT '',
    ALTER COLUMN `tanggal_awal` DROP DEFAULT,
    MODIFY `persentase_diskon` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `menu` MODIFY `deskripsi` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `foto` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `harga` INTEGER NOT NULL DEFAULT 0,
    MODIFY `jenis` ENUM('makanan', 'minuman') NOT NULL DEFAULT 'makanan',
    MODIFY `nama_makanan` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `siswa` MODIFY `nama_siswa` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `alamat` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `telp` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `foto` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `stan` MODIFY `nama_stan` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `nama_pemilik` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `telp` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `foto` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `password` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `role` ENUM('admin_stan', 'siswa') NOT NULL DEFAULT 'siswa';
