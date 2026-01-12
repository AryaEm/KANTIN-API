-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin_stan', 'siswa');

-- CreateEnum
CREATE TYPE "JenisMenu" AS ENUM ('makanan', 'minuman');

-- CreateEnum
CREATE TYPE "StatusMenu" AS ENUM ('tersedia', 'habis');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('belum_dikonfirmasi', 'proses', 'selesai', 'ditolak');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('laki_laki', 'perempuan');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" SERIAL NOT NULL,
    "nama_siswa" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL DEFAULT 'laki_laki',
    "foto" TEXT,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stan" (
    "id" SERIAL NOT NULL,
    "nama_stan" TEXT NOT NULL,
    "nama_pemilik" TEXT NOT NULL,
    "telp" TEXT NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "Stan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "nama_menu" TEXT NOT NULL,
    "harga" INTEGER NOT NULL DEFAULT 0,
    "jenis" "JenisMenu" NOT NULL DEFAULT 'makanan',
    "foto" TEXT,
    "deskripsi" TEXT,
    "status" "StatusMenu" NOT NULL DEFAULT 'tersedia',
    "id_stan" INTEGER NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "id" SERIAL NOT NULL,
    "kode_transaksi" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'belum_dikonfirmasi',
    "id_stan" INTEGER NOT NULL,
    "id_siswa" INTEGER NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTransaksi" (
    "id" SERIAL NOT NULL,
    "id_transaksi" INTEGER NOT NULL,
    "id_menu" INTEGER,
    "nama_menu" TEXT NOT NULL,
    "harga_asli" INTEGER NOT NULL,
    "persentase_diskon" INTEGER NOT NULL DEFAULT 0,
    "harga_setelah_diskon" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "DetailTransaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diskon" (
    "id" SERIAL NOT NULL,
    "nama_diskon" TEXT NOT NULL,
    "persentase_diskon" INTEGER NOT NULL DEFAULT 0,
    "tanggal_awal" TIMESTAMP(3) NOT NULL,
    "tanggal_akhir" TIMESTAMP(3) NOT NULL,
    "id_stan" INTEGER NOT NULL,

    CONSTRAINT "Diskon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuDiskon" (
    "id" SERIAL NOT NULL,
    "id_menu" INTEGER NOT NULL,
    "id_diskon" INTEGER NOT NULL,

    CONSTRAINT "MenuDiskon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Siswa_id_user_key" ON "Siswa"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Stan_id_user_key" ON "Stan"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Transaksi_kode_transaksi_key" ON "Transaksi"("kode_transaksi");

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stan" ADD CONSTRAINT "Stan_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_id_stan_fkey" FOREIGN KEY ("id_stan") REFERENCES "Stan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_stan_fkey" FOREIGN KEY ("id_stan") REFERENCES "Stan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_id_siswa_fkey" FOREIGN KEY ("id_siswa") REFERENCES "Siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "Transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksi" ADD CONSTRAINT "DetailTransaksi_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diskon" ADD CONSTRAINT "Diskon_id_stan_fkey" FOREIGN KEY ("id_stan") REFERENCES "Stan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuDiskon" ADD CONSTRAINT "MenuDiskon_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuDiskon" ADD CONSTRAINT "MenuDiskon_id_diskon_fkey" FOREIGN KEY ("id_diskon") REFERENCES "Diskon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
