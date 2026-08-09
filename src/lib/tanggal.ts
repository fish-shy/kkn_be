/**
 * Tanggal di sini selalu berupa hari kalender (tanpa jam), jadi disimpan dan
 * dikirim sebagai `YYYY-MM-DD`. Konversi lewat UTC tengah malam supaya zona
 * waktu server tidak pernah menggeser tanggalnya satu hari.
 */

/** `2025-10-15` → Date (UTC 00:00). */
export function keTanggal(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

/** Date → `2025-10-15`. */
export function dariTanggal(d: Date): string {
  return d.toISOString().slice(0, 10)
}
