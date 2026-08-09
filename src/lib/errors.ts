/** Galat yang memang dimaksudkan tampil ke klien dengan status tertentu. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly detail?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const badRequest = (pesan: string, detail?: unknown) =>
  new ApiError(400, pesan, detail)

export const unauthorized = (pesan = 'Sesi tidak valid. Silakan masuk lagi.') =>
  new ApiError(401, pesan)

export const notFound = (pesan = 'Data tidak ditemukan.') =>
  new ApiError(404, pesan)

export const conflict = (pesan: string) => new ApiError(409, pesan)
