<#
.SYNOPSIS
  Deploy API kelurahan ke Google Cloud Run. Seluruh variabel dikirim lewat
  --set-env-vars, diambil dari backend/.env - tidak ada yang perlu diketik
  ulang.

.DESCRIPTION
  --set-env-vars memisahkan pasangan dengan koma. Bila ada nilai yang
  mengandung koma (kata sandi basis data, misalnya), skrip beralih ke bentuk
  pemisah alternatif "^X^" dan memilih X yang tidak muncul di nilai mana pun.
  Perhatikan bahwa "@" tidak pernah bisa dipakai sebagai pemisah di sini:
  connection string Supabase selalu memuatnya (user:sandi@host).

  Docker tidak diperlukan - sumbernya dibangun Cloud Build di sisi Google.

  Catatan: nilai yang lewat argumen ikut tercatat di riwayat shell dan
  terlihat pada daftar proses. Untuk menghindarinya, pakai -PakaiBerkas yang
  mengirimnya lewat --env-vars-file lalu menghapus berkasnya.

.EXAMPLE
  .\deploy-cloudrun.ps1 -ProjectId kelurahan-lut

.EXAMPLE
  # Lihat perintah lengkapnya tanpa men-deploy; disimpan juga ke berkas
  .\deploy-cloudrun.ps1 -ProjectId kelurahan-lut -DryRun

.EXAMPLE
  # Sesudah frontend punya domain, daftarkan supaya lolos CORS
  .\deploy-cloudrun.ps1 -ProjectId kelurahan-lut -CorsOrigin "https://kelurahan.vercel.app"
#>
[CmdletBinding()]
param(
  # ID project Google Cloud. Kosongkan untuk memakai project aktif gcloud.
  [string]$ProjectId,

  # Jakarta - paling dekat dengan Banjarbaru.
  [string]$Region = 'asia-southeast2',

  [string]$Service = 'kkn-api',

  # Menimpa CORS_ORIGIN dari .env. Beberapa origin dipisah koma.
  [string]$CorsOrigin,

  # Batas jumlah instance. Menahan agar koneksi ke Supabase tidak meledak
  # saat trafik naik, sekaligus membatasi biaya.
  [int]$MaxInstances = 3,

  # Kirim lewat --env-vars-file, bukan --set-env-vars.
  [switch]$PakaiBerkas,

  # Tampilkan perintahnya saja, tanpa benar-benar men-deploy.
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# PORT disediakan Cloud Run sendiri dan ditolak bila ikut dikirim.
$Reserved = @('PORT', 'K_SERVICE', 'K_REVISION', 'K_CONFIGURATION')

# --------------------------------------------------------------- Baca .env
if (-not (Test-Path '.env')) { throw "backend/.env tidak ditemukan." }

$vars = [ordered]@{}
foreach ($baris in Get-Content '.env') {
  $t = $baris.Trim()
  if ($t -eq '' -or $t.StartsWith('#')) { continue }
  $i = $t.IndexOf('=')
  if ($i -lt 1) { continue }

  $k = $t.Substring(0, $i).Trim()
  $v = $t.Substring($i + 1).Trim()
  if ($v.Length -ge 2 -and $v.StartsWith('"') -and $v.EndsWith('"')) {
    $v = $v.Substring(1, $v.Length - 2)
  }
  if ($Reserved -contains $k) { continue }
  $vars[$k] = $v
}

if ($CorsOrigin) { $vars['CORS_ORIGIN'] = $CorsOrigin }
$vars['NODE_ENV'] = 'production'

# Cegah deploy dengan konfigurasi yang jelas belum diisi.
foreach ($w in 'DATABASE_URL', 'DIRECT_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET') {
  if (-not $vars[$w]) { throw "$w kosong di .env" }
  if ($vars[$w] -match 'xxxxxxxx|ganti-dengan|YOUR-PASSWORD') { throw "$w di .env masih berisi contoh, belum diisi." }
}
if ($vars['ADMIN_PASSWORD'] -eq 'ubah-password-ini') {
  throw "ADMIN_PASSWORD masih nilai contoh. Ganti dulu di .env, lalu jalankan 'npm run db:seed'."
}
if ($vars['DATABASE_URL'] -notmatch ':6543') {
  Write-Warning "DATABASE_URL tidak memakai pooler port 6543. Cloud Run membuat koneksi baru tiap instance; koneksi langsung Supabase bisa habis saat trafik naik."
}

$pasangan = @(foreach ($k in $vars.Keys) { "$k=$($vars[$k])" })

# ------------------------------------------------------- Rakit argumen env
$yaml = 'env.cloudrun.yaml'

if ($PakaiBerkas) {
  $isi = foreach ($k in $vars.Keys) {
    # Kutip tunggal aman untuk YAML; apostrof di dalam nilai digandakan.
    "{0}: '{1}'" -f $k, ($vars[$k] -replace "'", "''")
  }
  Set-Content -Path $yaml -Value $isi -Encoding utf8
  $argEnv = @('--env-vars-file', $yaml)
}
else {
  # Pemisah bawaan --set-env-vars adalah koma. Kalau ada nilai yang memuat
  # koma, gcloud menerima bentuk "^X^a=1Xb=2" dengan X sebagai pemisah.
  $adaKoma = @($vars.Values | Where-Object { $_ -like '*,*' }).Count -gt 0

  if (-not $adaKoma) {
    $argEnv = @('--set-env-vars', ($pasangan -join ','))
  }
  else {
    $kandidat = @('|', '#', '~', ';', '?', '!')
    $pemisah = $null
    foreach ($d in $kandidat) {
      $bentrok = @($vars.Values | Where-Object { $_.Contains($d) }).Count
      if ($bentrok -eq 0) { $pemisah = $d; break }
    }
    if (-not $pemisah) {
      throw "Semua kandidat pemisah muncul di dalam nilai env. Jalankan ulang dengan -PakaiBerkas."
    }
    Write-Host "Ada nilai bertanda koma; memakai pemisah alternatif '$pemisah'." -ForegroundColor DarkGray
    $argEnv = @('--set-env-vars', ("^$pemisah^" + ($pasangan -join $pemisah)))
  }
}

$daftar = ($vars.Keys | ForEach-Object {
    if ($_ -match 'KEY|SECRET|PASSWORD|URL') { "$_ (disamarkan)" } else { "$_=$($vars[$_])" }
  }) -join ', '
Write-Host "Variabel yang dikirim: $daftar" -ForegroundColor DarkGray

# --------------------------------------------------------------- Deploy
$argumen = @(
  'run', 'deploy', $Service,
  '--source', '.',
  '--region', $Region,
  '--platform', 'managed',
  '--allow-unauthenticated'
) + $argEnv + @(
  '--memory', '512Mi',
  '--cpu', '1',
  '--concurrency', '60',
  '--timeout', '60s',
  '--min-instances', '0',
  '--max-instances', "$MaxInstances"
)
if ($ProjectId) { $argumen += @('--project', $ProjectId) }

try {
  if ($DryRun) {
    # Perintah lengkap beserta nilainya ditulis ke berkas, bukan ke layar:
    # isinya termasuk service role key Supabase.
    $literal = 'gcloud ' + (($argumen | ForEach-Object {
          if ($_ -match '[\s\^]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ }
        }) -join ' ')

    $keluaran = 'perintah-deploy.txt'
    Set-Content -Path $keluaran -Value $literal -Encoding utf8

    Write-Host ""
    Write-Host "DryRun - tidak ada yang di-deploy." -ForegroundColor Yellow
    Write-Host "Perintah lengkapnya (berisi rahasia) ada di: $PSScriptRoot\$keluaran"
    Write-Host "Hapus berkas itu setelah dipakai." -ForegroundColor Yellow
    Write-Host ""
    return
  }

  Write-Host ""
  Write-Host "Menjalankan gcloud run deploy $Service ..." -ForegroundColor Cyan
  & gcloud @argumen
  if ($LASTEXITCODE -ne 0) { throw "gcloud keluar dengan kode $LASTEXITCODE" }

  $urlArgs = @('run', 'services', 'describe', $Service, '--region', $Region, '--format', 'value(status.url)')
  if ($ProjectId) { $urlArgs += @('--project', $ProjectId) }
  $url = (& gcloud @urlArgs).Trim()

  Write-Host ""
  Write-Host "Berhasil. URL layanan: $url" -ForegroundColor Green
  Write-Host "Cek       : $url/api/health"
  Write-Host ""
  Write-Host "Dua langkah lanjutan:" -ForegroundColor Yellow
  Write-Host "  1. Build frontend dengan VITE_API_URL=$url"
  Write-Host "  2. Deploy ulang dengan -CorsOrigin '<domain-frontend>' agar lolos CORS"
}
finally {
  if ($PakaiBerkas -and (Test-Path $yaml)) { Remove-Item $yaml -Force }
}
