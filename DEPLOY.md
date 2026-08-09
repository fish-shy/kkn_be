# Deploy backend ke Google Cloud Run

Cloud Run cocok untuk API ini: kontainer biasa (bukan fungsi), jadi tidak ada
batas ukuran body 4,5 MB seperti platform serverless-function, dan gambar sudah
di Supabase sehingga tidak butuh disk permanen. Skala nol saat menganggur, jadi
untuk situs kelurahan biayanya praktis nol.

Docker **tidak** perlu terpasang — sumbernya dibangun Cloud Build di sisi Google.

---

## Sekali saja, di awal

```powershell
gcloud auth login
gcloud config set project NAMA-PROJECT-ANDA
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Billing harus aktif di project tersebut, meskipun pemakaiannya masuk free tier.

## Deploy

```powershell
cd c:\web_kkn\backend
.\deploy-cloudrun.ps1 -ProjectId NAMA-PROJECT-ANDA
```

Skripnya membaca `backend/.env`, mengirim seluruh isinya sebagai environment
variable, lalu menghapus berkas sementaranya. Lihat perintahnya lebih dulu
tanpa men-deploy:

```powershell
.\deploy-cloudrun.ps1 -ProjectId NAMA-PROJECT-ANDA -DryRun
```

Opsi lain: `-Region` (bawaan `asia-southeast2`, Jakarta), `-Service` (bawaan
`kkn-api`), `-MaxInstances` (bawaan 3), `-CorsOrigin`.

## Sesudah deploy pertama

Cloud Run baru memberi URL layanan setelah deploy pertama, jadi dua hal ini
menyusul:

**1. Arahkan frontend ke sana.** Isi `kkn/.env` lalu build ulang — nilainya
ditanam saat build, bukan dibaca saat berjalan:

```
VITE_API_URL=https://kkn-api-xxxxxxxx-et.a.run.app
```

**2. Izinkan domain frontend di CORS.** Deploy ulang dengan origin-nya:

```powershell
.\deploy-cloudrun.ps1 -ProjectId NAMA-PROJECT-ANDA -CorsOrigin "https://situs-kelurahan.vercel.app"
```

Beberapa origin dipisah koma. Tanpa langkah ini, browser akan memblokir semua
permintaan dari situs ke API.

---

## Perintah mentahnya

Bila lebih suka menjalankan sendiri tanpa skrip (ganti nilainya, dan **jangan**
sertakan `PORT` — Cloud Run menolaknya karena variabel itu miliknya):

```powershell
gcloud run deploy kkn-api `
  --source . `
  --region asia-southeast2 `
  --platform managed `
  --allow-unauthenticated `
  --memory 512Mi --cpu 1 --concurrency 60 --timeout 60s `
  --min-instances 0 --max-instances 3 `
  --set-env-vars "^@^NODE_ENV=production@DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true@DIRECT_URL=postgresql://...:5432/postgres@SUPABASE_URL=https://xxxx.supabase.co@SUPABASE_SERVICE_ROLE_KEY=eyJ...@SUPABASE_BUCKET=gambar@JWT_SECRET=...@JWT_EXPIRES_IN=12h@ADMIN_USERNAME=admin@ADMIN_PASSWORD=...@ADMIN_NAMA=Administrator Kelurahan@UPLOAD_MAX_MB=5@CORS_ORIGIN=https://domain-frontend"
```

`^@^` di awal mengganti pemisah koma menjadi `@`, karena connection string
Supabase bisa mengandung koma. Cara ini menaruh seluruh rahasia di riwayat
shell — itulah sebabnya skrip di atas memakai `--env-vars-file`.

## Migrasi basis data

Cloud Run **tidak** menjalankan migrasi. Jalankan dari komputer sendiri setiap
kali `schema.prisma` berubah — `DIRECT_URL` di `.env` sudah menunjuk koneksi
langsung yang dibutuhkan Prisma:

```powershell
npm run db:deploy
```

## Yang perlu diperhatikan

**Pakai pooler untuk `DATABASE_URL`.** Tiap instance Cloud Run membuka pool
koneksinya sendiri. Dengan koneksi langsung (`db.<ref>.supabase.co:5432`),
kuota koneksi Supabase bisa habis saat beberapa instance hidup bersamaan.
Ambil alamat **Transaction pooler port 6543** dari Supabase → Connect → ORM →
Prisma. `DIRECT_URL` tetap koneksi langsung, hanya dipakai migrasi. Skrip akan
memberi peringatan bila ini belum diperbaiki.

**`--max-instances` sengaja rendah.** Tiga instance sudah jauh melebihi
kebutuhan situs kelurahan, sekaligus membatasi jumlah koneksi basis data dan
biaya bila ada lonjakan tak wajar.

**Cold start.** Dengan `--min-instances 0`, permintaan pertama setelah lama
menganggur butuh beberapa detik. Setel `--min-instances 1` bila ingin selalu
hangat — tapi itu ditagih terus-menerus.

**Rahasia di environment variable.** Nilainya hanya terlihat oleh yang punya
akses ke project Google Cloud. Bila ingin lebih ketat, pindahkan yang sensitif
ke Secret Manager:

```powershell
"NILAI-KUNCINYA" | gcloud secrets create supabase-service-role --data-file=-
gcloud run services update kkn-api --region asia-southeast2 `
  --set-secrets "SUPABASE_SERVICE_ROLE_KEY=supabase-service-role:latest"
```

Service account Cloud Run perlu peran `roles/secretmanager.secretAccessor`.
