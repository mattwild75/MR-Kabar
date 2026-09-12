# Catatan jaringan VM produksi

## Pin `www.googleapis.com` di `/etc/hosts` (12 September 2026)

Dari jaringan Diskominsa, seluruh blok IP Google `172.217.112.0/21` tidak
terjangkau (timeout), padahal semua DNS publik (Diskominsa, 8.8.8.8, 1.1.1.1,
9.9.9.9) memberi `www.googleapis.com` alamat dari blok itu. Frontend Google
lain (`142.250.4.95`, `64.233.170.95`, `142.251.10.95`) hidup dan melayani
nama yang sama lewat SNI.

Karena unggahan cadangan ke Google Drive bergantung pada nama itu, dipasang
pin sementara (disetujui pengelola 12 September 2026):

```
# /etc/hosts
142.250.4.95 www.googleapis.com
```

Berkas asli: `/etc/hosts.sebelum-googleapis`.

**Gejala kalau pin ini kedaluwarsa** (IP Google berubah): halaman Backup
menampilkan "Gagal ... www.googleapis.com" pada kartu Google Drive, dan
`cadangan:drive` gagal. Perbaikan: cari IP yang hidup —

```bash
for ip in $(dig +short www.google.com A) 142.250.4.95 142.251.10.95 64.233.170.95; do
  printf '%s ' $ip; curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 \
    --resolve www.googleapis.com:443:$ip https://www.googleapis.com/discovery/v1/apis
done
```

lalu ganti baris di `/etc/hosts`. **Solusi sesungguhnya**: minta Diskominsa
memperbaiki rute ke `172.217.112.0/21`; setelah itu hapus baris pin.

`oauth2.googleapis.com` dan `accounts.google.com` tidak terdampak.
