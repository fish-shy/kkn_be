<#
.SYNOPSIS
  Deploy API kelurahan ke Google Cloud Run, dengan seluruh variabel diambil
  dari backend/.env — tidak ada rahasia yang perlu diketik ulang.

.DESCRIPTION
  Nilai dikirim lewat --env-vars-file, bukan --set-env-vars, karena dua alasan:
  connection string dan kunci Supabase mengandung karakter yang mengacaukan
  pemisah koma, dan nilai yang lewat argumen ikut tercatat di riwayat shell.
  Berkas YAML sementaranya dihapus lagi setelah deploy.

  Docker tidak diperlukan: sumbernya dibangun oleh Cloud Build di sisi Google.

.EXAMPLE
  .\deploy-cloudrun.ps1 -ProjectId kelurahan-lut

.EXAMPLE
  # Sesudah frontend punya domain, daftarkan supaya lolos CORS
  .\deploy-cloudrun.ps1 -ProjectId kelurahan-lut -CorsOrigin "https://kelurahan.vercel.app"
#>
[CmdletBinding()]
param(
  # ID project Google Cloud. Kosongkan untuk memakai project aktif gcloud.
  [string]$ProjectId,

  # Jakarta — paling dekat dengan Banjarbaru.
  [string]$Region = 'asia-southeast2',

  [string]$Service = 'kkn-api',

  # Menimpa CORS_ORIGIN dari .env. Beberapa origin dipisah koma.
  [string]$CorsOrigin,

  # Batas jumlah instance. Menahan agar koneksi ke Supabase tidak meledak
  # saat trafik naik, sekaligus membatasi biaya.
  [int]$MaxInstances = 3,

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

# ------------------------------------------------------------ Tulis YAML
$yaml = 'env.cloudrun.yaml'
$isi = foreach ($k in $vars.Keys) {
  # Kutip tunggal aman untuk YAML; apostrof di dalam nilai digandakan.
  "{0}: '{1}'" -f $k, ($vars[$k] -replace "'", "''")
}
Set-Content -Path $yaml -Value $isi -Encoding utf8

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
  '--allow-unauthenticated',
  '--env-vars-file', $yaml,
  '--memory', '512Mi',
  '--cpu', '1',
  '--concurrency', '60',
  '--timeout', '60s',
  '--min-instances', '0',
  '--max-instances', "$MaxInstances"
)
if ($ProjectId) { $argumen += @('--project', $ProjectId) }

try {
  Write-Host "`ngcloud $($argumen -join ' ')`n" -ForegroundColor Cyan
  if ($DryRun) {
    Write-Host "DryRun: tidak dijalankan. YAML ada di $yaml — hapus setelah dilihat." -ForegroundColor Yellow
    return
  }

  & gcloud @argumen
  if ($LASTEXITCODE -ne 0) { throw "gcloud keluar dengan kode $LASTEXITCODE" }

  $urlArgs = @('run', 'services', 'describe', $Service, '--region', $Region, '--format', 'value(status.url)')
  if ($ProjectId) { $urlArgs += @('--project', $ProjectId) }
  $url = (& gcloud @urlArgs).Trim()

  Write-Host "`nBerhasil. URL layanan: $url" -ForegroundColor Green
  Write-Host "Cek       : $url/api/health"
  Write-Host ""
  Write-Host "Dua langkah lanjutan:" -ForegroundColor Yellow
  Write-Host "  1. Build frontend dengan VITE_API_URL=$url"
  Write-Host "  2. Deploy ulang dengan -CorsOrigin `"<domain-frontend>`" agar lolos CORS"
}
finally {
  # Berisi service role key — jangan ditinggal di disk.
  if (-not $DryRun -and (Test-Path $yaml)) { Remove-Item $yaml -Force }
}
