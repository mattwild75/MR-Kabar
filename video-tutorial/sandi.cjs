/**
 * Membaca sandi sementara akun perekam dari berkas simpanan.
 *
 * Sandinya TIDAK ditulis di dalam skrip mana pun. Ia dibuat acak oleh
 * akun.php saat dipasang dan hanya hidup di `.sandi-lama`, yang di-gitignore
 * dan dihapus sendiri begitu sandi aslinya dipulihkan.
 */
const fs = require('fs');
const path = require('path');

const SIMPANAN = path.join(__dirname, '.sandi-lama');

module.exports = function sandiSementara() {
  if (!fs.existsSync(SIMPANAN)) {
    throw new Error(
      'sandi sementara belum dipasang. Jalankan dulu:  php akun.php pasang',
    );
  }
  const s = JSON.parse(fs.readFileSync(SIMPANAN, 'utf8'));
  if (!s.sandi) throw new Error('berkas simpanan tidak memuat sandi sementara');
  return s.sandi;
};
