/**
 * Row-level ownership check untuk IRS_Pemda, KRS_PD/IRS_PD, KRO_PD/IRO_PD —
 * admin/super-admin selalu boleh mengelola semua baris; PIC (admin-instansi)
 * hanya boleh mengelola baris yang user_id-nya sama dengan dirinya. Baris
 * lama tanpa user_id (NULL) hanya bisa dikelola admin, sama seperti backend
 * (lihat RiskOwnershipPolicy).
 */
export function canManageRow(rowUserId: number | null | undefined, currentUserId: number | null, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  return rowUserId != null && currentUserId != null && rowUserId === currentUserId;
}
