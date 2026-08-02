/**
 * Menyediakan kredensial akun perekam untuk skrip Node.
 *
 * Tidak ada satu pun sandi yang ditulis di dalam berkas skrip.
 *
 *  - Akun yang DIPINJAM (mis. PIC_INSPEKTORAT, mrkabarvip) sandinya dibuat
 *    acak oleh akun.php dan hanya hidup di `.sandi-lama`, yang di-gitignore
 *    dan dihapus sendiri begitu sandi aslinya dipulihkan.
 *  - Akun bersama LAPOR tidak dipinjam sama sekali. Sandinya memang sudah ada
 *    di `.env` sebagai LAPOR_ACCOUNT_PASSWORD, karena akun itu dipakai publik
 *    lewat kode QR. Dibaca langsung dari sana daripada memanggil PHP: di
 *    Windows `php` adalah berkas .bat yang tidak bisa dipanggil execFileSync
 *    tanpa shell, dan menambah ketergantungan itu hanya untuk membaca satu
 *    baris tidak sepadan.
 */
const fs = require('fs');
const path = require('path');

const AKAR = path.join(__dirname, '..');
const SIMPANAN = path.join(__dirname, '.sandi-lama');

function dariEnv(kunci) {
  const berkas = path.join(AKAR, '.env');
  if (!fs.existsSync(berkas)) throw new Error('.env tidak ditemukan');
  for (const baris of fs.readFileSync(berkas, 'utf8').split(/\r?\n/)) {
    const cocok = baris.match(new RegExp(`^\\s*${kunci}\\s*=\\s*(.*)$`));
    if (cocok) return cocok[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error(`${kunci} tidak ada di .env`);
}

function sandiPinjaman(username) {
  if (!fs.existsSync(SIMPANAN)) {
    throw new Error(`sandi sementara belum dipasang. Jalankan:  php akun.php pasang ${username}`);
  }
  const isi = JSON.parse(fs.readFileSync(SIMPANAN, 'utf8'));
  // Bentuk lama menyimpan satu akun tanpa kunci username.
  const peta = isi.hash ? { PIC_INSPEKTORAT: isi } : isi;
  if (!peta[username]?.sandi) {
    throw new Error(`akun ${username} belum dipinjam. Jalankan:  php akun.php pasang ${username}`);
  }
  return peta[username].sandi;
}

module.exports = function kredensial(username = 'PIC_INSPEKTORAT') {
  return {
    user: username,
    sandi: username === 'LAPOR' ? dariEnv('LAPOR_ACCOUNT_PASSWORD') : sandiPinjaman(username),
  };
};
