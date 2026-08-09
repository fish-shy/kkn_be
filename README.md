# Backend — API Kelurahan Landasan Ulin Tengah

Express 5 + Prisma + Supabase. Menyediakan isi situs (berita, galeri, data
statistik) dan panel admin yang ada di frontend `../kkn`.

Satu proyek Supabase dipakai untuk dua hal: **basis data PostgreSQL** dan
**penyimpanan gambar** (Supabase Storage). Backend ini tidak menyimpan berkas
apa pun ke disk, jadi bisa ditaruh di hosting mana saja — termasuk yang
filesystem-nya sementara seperti Railway, Render, atau Fly.io.

> Status: basis data sudah dimigrasi dan diisi, bucket `gambar` sudah aktif.

---

## 1. Konfigurasi

Semua nilai ada di `.env` (jangan pernah di-commit — berisi service role key).
Contohnya di `.env.example`.

| Variabel                    | Dari mana                                                     |
| --------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`              | Supabase → Connect → ORM → Prisma. Dipakai aplikasi berjalan   |
| `DIRECT_URL`                | Koneksi langsung port 5432. **Wajib** — `prisma migrate` gagal lewat pooler |
| `SUPABASE_URL`              | Settings → API → Project URL                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role`. **Rahasia**, hanya di backend |
| `SUPABASE_BUCKET`           | Nama bucket, bawaan `gambar`                                   |
| `JWT_SECRET`                | String acak panjang; sudah dibangkitkan otomatis               |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Akun masuk panel admin                                 |
| `CORS_ORIGIN`               | Origin frontend; beberapa origin dipisah koma                  |
| `PORT`, `UPLOAD_MAX_MB`     | Port API (4000) dan batas ukuran gambar (5 MB)                 |

**Bucket-nya harus publik.** Supabase → Storage → New bucket, nama `gambar`,
centang *Public bucket*. Tanpa itu gambar tidak akan tampil di situs.

Kenapa `service_role` dan bukan `anon`: unggahan hanya boleh dilakukan admin
yang sudah lolos JWT di backend ini, jadi kuncinya tidak perlu dibagikan ke
browser dan tidak perlu menyiapkan RLS policy khusus untuk penulisan.

## 2. Jalankan

```powershell
cd c:\web_kkn\backend
npm install
npm run setup     # migrasi tabel + isi data awal (sudah dijalankan sekali)
npm run dev       # http://localhost:4000
```

Frontend di terminal terpisah:

```powershell
cd c:\web_kkn\kkn
npm run dev       # http://localhost:5173
```

Panel admin: <http://localhost:5173/admin>, masuk dengan `ADMIN_USERNAME` /
`ADMIN_PASSWORD` dari `.env`.

### Perintah lain

| Perintah                     | Fungsi                                              |
| ---------------------------- | --------------------------------------------------- |
| `npm run db:seed`            | Isi data awal; isi yang sudah ada dilewati           |
| `npm run db:seed -- --reset` | Kosongkan lalu isi ulang dari `prisma/data-awal.ts`  |
| `npm run db:studio`          | Prisma Studio — lihat/ubah isi tabel langsung        |
| `npm run db:migrate`         | Buat migrasi baru setelah `schema.prisma` diubah     |
| `npm run build` / `start`    | Build ke `dist/` lalu jalankan tanpa tsx             |

Lupa kata sandi admin? Ubah `ADMIN_PASSWORD` di `.env`, jalankan
`npm run db:seed` — akun admin selalu di-upsert mengikuti `.env`.

---

## Endpoint

Yang bertanda 🔒 memerlukan header `Authorization: Bearer <token>`.

| Metode   | Jalur                        | Keterangan                              |
| -------- | ---------------------------- | --------------------------------------- |
| `GET`    | `/api/health`                | Cek server hidup                        |
| `POST`   | `/api/auth/login`            | `{ username, password }` → `{ token }`  |
| `GET`    | `/api/auth/me` 🔒            | Data admin yang sedang masuk            |
| `POST`   | `/api/auth/password` 🔒      | Ganti kata sandi                        |
| `GET`    | `/api/berita`                | Daftar berita (`?kategori=`, `?q=`)     |
| `GET`    | `/api/berita/:slugAtauId`    | Satu berita + 4 berita terkait          |
| `POST`   | `/api/berita` 🔒             | Tambah berita                           |
| `PATCH`  | `/api/berita/:id` 🔒         | Ubah berita                             |
| `DELETE` | `/api/berita/:id` 🔒         | Hapus berita beserta gambarnya          |
| `GET`    | `/api/galeri`                | Daftar foto (`?album=`)                 |
| `POST`   | `/api/galeri` 🔒             | Tambah foto                             |
| `PATCH`  | `/api/galeri/:id` 🔒         | Ubah foto                               |
| `DELETE` | `/api/galeri/:id` 🔒         | Hapus foto                              |
| `GET`    | `/api/statistik`             | Seluruh data halaman Data sekaligus     |
| `PUT`    | `/api/statistik/<bagian>` 🔒 | Simpan satu bagian (lihat di bawah)     |
| `POST`   | `/api/upload` 🔒             | `multipart/form-data`, field `gambar` → `{ url }` |

Bagian statistik: `gambaran-umum`, `statistik-kampung`, `penduduk-rt`,
`pendidikan`, `kepesertaan-kb`, `sarana`, `posyandu`, `lembaga`.

Dua yang pertama dikirim sebagai objek; sisanya sebagai **larik utuh** — isi
lama diganti seluruhnya, sesuai cara panel admin menyunting satu tabel penuh
lalu menyimpannya.

Galat selalu berbentuk `{ pesan, detail? }`, jadi frontend cukup menampilkan
`pesan`.

---

## Catatan

**Gambar.** Unggahan admin masuk ke Supabase Storage pada jalur
`tahun/bulan/nama-timestamp-acak.ext`, dan yang tersimpan di basis data adalah
URL publik lengkapnya. Foto bawaan tetap berupa path relatif (`/berita/…`) yang
dilayani frontend dari `kkn/public/` — keduanya bisa dipakai langsung sebagai
`<img src>`. Menghapus berita atau foto ikut menghapus berkasnya dari bucket,
tetapi tidak menyentuh berkas di `kkn/public/`.

Karena tiap unggahan memakai nama unik, berkasnya disajikan dengan cache satu
tahun. Konsekuensinya: gambar yang dihapus masih bisa dibuka lewat URL lamanya
sampai cache CDN Supabase kedaluwarsa. Isi bucket-nya sendiri sudah terhapus
saat itu juga.

**Tanggal** disimpan sebagai hari kalender (`DATE`) dan dipertukarkan sebagai
`YYYY-MM-DD`, supaya zona waktu server tidak pernah menggeser tanggalnya.

**Selisih data statistik dibiarkan apa adanya.** Jumlah baris tabel per RT
memang berbeda dari total resmi yang dipublikasikan sumber, karena itu keduanya
disimpan terpisah (`totalResmiKk` / `totalResmiJiwa`) dan halaman Data
menampilkan catatan selisihnya. Jangan "dirapikan" diam-diam di basis data.

**Keamanan.** Hanya ada satu peran, yaitu admin, dengan kata sandi ter-hash
bcrypt dan token JWT berumur 12 jam. Sebelum situs dipublikasikan: ganti
`ADMIN_PASSWORD`, pastikan `.env` tidak pernah ikut ter-commit (service role
key di dalamnya memberi akses penuh ke proyek Supabase), dan sesuaikan
`CORS_ORIGIN` dengan domain sebenarnya.
