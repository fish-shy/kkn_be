-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL DEFAULT 'Administrator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "lokasi" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "ringkas" TEXT NOT NULL,
    "foto" TEXT,
    "sumber" TEXT,
    "isi" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foto" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkas" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "foto" TEXT NOT NULL,
    "sumber" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gambaran_umum" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "penduduk" INTEGER NOT NULL,
    "kk" INTEGER NOT NULL,
    "pus" INTEGER NOT NULL,
    "ibuHamil" INTEGER NOT NULL,
    "balitaStunting" INTEGER NOT NULL,
    "remaja" INTEGER NOT NULL,
    "lansia" INTEGER NOT NULL,
    "totalResmiKk" INTEGER NOT NULL,
    "totalResmiJiwa" INTEGER NOT NULL,
    "luasWilayah" TEXT NOT NULL,
    "rtRw" TEXT NOT NULL,
    "jarakPusatKota" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gambaran_umum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statistik_kampung" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "jiwa" INTEGER NOT NULL,
    "kk" INTEGER NOT NULL,
    "pus" INTEGER NOT NULL,
    "keluargaBalita" INTEGER NOT NULL,
    "keluargaRemaja" INTEGER NOT NULL,
    "keluargaLansia" INTEGER NOT NULL,
    "remaja" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statistik_kampung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penduduk_rt" (
    "id" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "kk" INTEGER NOT NULL,
    "jiwa" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "penduduk_rt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendidikan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "l" INTEGER NOT NULL,
    "p" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kepesertaan_kb" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jml" INTEGER NOT NULL,
    "warna" TEXT NOT NULL DEFAULT 'var(--leaf-600)',
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "kepesertaan_kb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sarana_grup" (
    "id" TEXT NOT NULL,
    "grup" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'layers',
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sarana_grup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sarana_item" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "ket" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "grupId" TEXT NOT NULL,

    CONSTRAINT "sarana_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posyandu" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lembaga" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jml" INTEGER NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lembaga_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

-- CreateIndex
CREATE INDEX "berita_tanggal_idx" ON "berita"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "foto_tanggal_idx" ON "foto"("tanggal" DESC);

-- CreateIndex
CREATE INDEX "sarana_item_grupId_idx" ON "sarana_item"("grupId");

-- AddForeignKey
ALTER TABLE "sarana_item" ADD CONSTRAINT "sarana_item_grupId_fkey" FOREIGN KEY ("grupId") REFERENCES "sarana_grup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
