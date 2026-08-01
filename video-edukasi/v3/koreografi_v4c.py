"""
Perbaikan tata letak sesudah cek_tumpang.cjs melaporkan 39 pasangan beririsan.

Tiga sebab, dan semuanya khas:

1. LUPA MEMBERI `out`. Kartu lama tetap terpampang saat kalimat berikutnya
   memasang kartu baru di bawahnya. Ini penyebab terbanyak.
2. KARTU JAUH LEBIH TINGGI DARIPADA DUGAAN. Satu `card` ber-`sm` dua baris
   setinggi ~250-290 piksel, bukan ~150. Jarak antar-baris disetel ulang
   memakai angka hasil ukur, bukan kira-kira.
3. EFEK `stamp` MEMBESAR DULU. Skalanya berangkat dari 2,3 sehingga sesaat
   menutupi tetangganya. Dipakai hanya di tempat yang sekelilingnya lapang.
"""
import io
import os

D = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(D, "scenes.js")


def main():
    s = io.open(F, encoding="utf-8").read()
    if "y:812" in s:
        print("perbaikan tata letak sudah diterapkan")
        return
    n = [0]

    def ganti(lama, baru):
        nonlocal s
        assert lama in s, "jangkar tidak ketemu:\n" + lama[:170]
        assert s.count(lama) == 1, "jangkar tidak unik:\n" + lama[:170]
        s = s.replace(lama, baru, 1)
        n[0] += 1

    # ── s2: kotak atap bocor turun ke bawah kartu tiga kata kunci ──────
    for lama, baru in [
        ("{k:'icon', sym:'umbrella', x:220,y:720, s:112,",
         "{k:'icon', sym:'umbrella', x:220,y:812, s:112,"),
        ("{k:'box', x:600,y:720, w:680, t:'MUNGKIN BOCOR MUSIM HUJAN NANTI'",
         "{k:'box', x:600,y:812, w:680, t:'MUNGKIN BOCOR MUSIM HUJAN NANTI'"),
        ("{k:'box', x:1330,y:720, w:680, t:'SUDAH BOCOR SEKARANG'",
         "{k:'box', x:1330,y:812, w:680, t:'SUDAH BOCOR SEKARANG'"),
        ("{k:'icon', sym:'flood', x:1740,y:720, s:112,",
         "{k:'icon', sym:'flood', x:1740,y:812, s:112,"),
    ]:
        ganti(lama, baru)

    # ── s6: tiga lini keluar dulu, baru keempat kartu akun masuk ───────
    ganti("""  {k:'card', x:420,y:470, sym:'shield', cap:'Lini 1 — UPR', sm:'Kelola risiko sehari-hari', w:380, c:'sys', at:L(25,0.5), a:'rise'},
  {k:'rule', x:700,y:470, w:130, h:6, c:'neutral', at:L(25,2.2), a:'grow'},
  {k:'card', x:960,y:470, sym:'shield-check', cap:'Lini 2 — Unit Kepatuhan', sm:'Asisten Sekda · pantau seluruh UPR', w:400, c:'warn', at:L(25,2.8), a:'rise'},
  {k:'rule', x:1240,y:470, w:130, h:6, c:'neutral', at:L(25,5.0), a:'grow'},
  {k:'card', x:1500,y:470, sym:'eye', cap:'Lini 3 — Inspektorat', sm:'Evaluasi independen', w:380, c:'ok', at:L(25,5.6), a:'rise'},
  {k:'icon', sym:'binocular', x:1790,y:470,s:110,c:'ok', at:L(25,7.0), a:'pop'},""",
          """  {k:'card', x:420,y:470, sym:'shield', cap:'Lini 1 — UPR', sm:'Kelola risiko sehari-hari', w:380, c:'sys', at:L(25,0.5), a:'rise', out:L(143,0.2)},
  {k:'rule', x:700,y:470, w:130, h:6, c:'neutral', at:L(25,2.2), a:'grow', out:L(143,0.2)},
  {k:'card', x:960,y:470, sym:'shield-check', cap:'Lini 2 — Unit Kepatuhan', sm:'Asisten Sekda · pantau seluruh UPR', w:400, c:'warn', at:L(25,2.8), a:'rise', out:L(143,0.2)},
  {k:'rule', x:1240,y:470, w:130, h:6, c:'neutral', at:L(25,5.0), a:'grow', out:L(143,0.2)},
  {k:'card', x:1500,y:470, sym:'eye', cap:'Lini 3 — Inspektorat', sm:'Evaluasi independen', w:380, c:'ok', at:L(25,5.6), a:'rise', out:L(143,0.2)},
  {k:'icon', sym:'binocular', x:1790,y:470,s:110,c:'ok', at:L(25,7.0), a:'pop', out:L(143,0.2)},""")

    ganti("""  {k:'lbl', x:960,y:620, text:'EMPAT JENIS AKUN DI APLIKASI', c:'gold', at:L(143,0.4), a:'up'},
  {k:'card', x:320,y:775, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD sendiri', w:330, c:'sys', at:L(143,0.9), a:'rise'},
  {k:'card', x:745,y:775, sym:'survey', cap:'CEE Survey', sm:'Khusus kuesioner', w:330, c:'violet', at:L(143,1.4), a:'rise'},
  {k:'card', x:1170,y:775, sym:'eye', cap:'Peninjau', sm:'Lihat seluruh OPD · tidak bisa mengubah', w:330, c:'ok', at:L(143,2.0), a:'stamp', idle:'breathe'},
  {k:'card', x:1595,y:775, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan', w:330, c:'gold', at:L(143,2.6), a:'rise'},
  {k:'chip', x:960,y:895, text:'Semua pintu terbuka — tapi tidak ada satu pun pena di dalamnya', c:'neutral', at:L(143,12.0), a:'up'},""",
          """  {k:'lbl', x:960,y:420, text:'EMPAT JENIS AKUN DI APLIKASI', c:'gold', at:L(143,0.4), a:'up'},
  {k:'card', x:320,y:630, sym:'idcard', cap:'PIC Perangkat Daerah', sm:'Hanya data OPD sendiri', w:330, c:'sys', at:L(143,0.9), a:'rise'},
  {k:'card', x:745,y:630, sym:'survey', cap:'CEE Survey', sm:'Khusus kuesioner', w:330, c:'violet', at:L(143,1.4), a:'rise'},
  {k:'card', x:1170,y:630, sym:'eye', cap:'Peninjau', sm:'Lihat semua, ubah tidak bisa', w:330, c:'ok', at:L(143,2.0), a:'pop', idle:'breathe'},
  {k:'card', x:1595,y:630, sym:'crown', cap:'Admin / Super Admin', sm:'Seluruh OPD + pengaturan', w:330, c:'gold', at:L(143,2.6), a:'rise'},
  {k:'chip', x:960,y:860, text:'Semua pintu terbuka — tapi tidak ada satu pun pena di dalamnya', c:'neutral', at:L(143,12.0), a:'up'},""")

    # ── s7: pin dan kartu siklus keluar sebelum Surat Edaran masuk ─────
    ganti("""  {k:'rule', x:960,y:400, w:1480, h:6, c:'neutral', at:L(27,1.6), a:'grow'},

  {k:'icon', sym:'pin', x:330,y:400,s:64,c:'sys', at:L(28,0.3), a:'down'},
  {k:'card', x:330,y:610, sym:'map', cap:'RPJMD', sm:'5 tahunan · Risiko Strategis Pemda', w:330, c:'sys', at:L(28,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:750,y:400,s:64,c:'ok', at:L(29,0.3), a:'down'},
  {k:'card', x:750,y:610, sym:'flag', cap:'Renstra', sm:'Tahunan · Risiko Strategis OPD', w:330, c:'ok', at:L(29,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:1170,y:400,s:64,c:'warn', at:L(30,0.3), a:'down'},
  {k:'card', x:1170,y:610, sym:'calendar', cap:'Renja / RKA', sm:'Tahunan · Risiko Operasional', w:330, c:'warn', at:L(30,0.6), a:'rise'},
  {k:'icon', sym:'pin', x:1590,y:400,s:64,c:'gold', at:L(31,0.3), a:'down'},
  {k:'card', x:1590,y:610, sym:'quarter', cap:'Triwulan', sm:'Laporan berkala & pemantauan', w:330, c:'gold', at:L(31,0.6), a:'rise'},""",
          """  {k:'rule', x:960,y:400, w:1480, h:6, c:'neutral', at:L(27,1.6), a:'grow', out:L(150,0.2)},

  {k:'icon', sym:'pin', x:330,y:400,s:64,c:'sys', at:L(28,0.3), a:'down', out:L(150,0.2)},
  {k:'card', x:330,y:610, sym:'map', cap:'RPJMD', sm:'5 tahunan · Risiko Strategis Pemda', w:330, c:'sys', at:L(28,0.6), a:'rise', out:L(150,0.2)},
  {k:'icon', sym:'pin', x:750,y:400,s:64,c:'ok', at:L(29,0.3), a:'down', out:L(150,0.2)},
  {k:'card', x:750,y:610, sym:'flag', cap:'Renstra', sm:'Tahunan · Risiko Strategis OPD', w:330, c:'ok', at:L(29,0.6), a:'rise', out:L(150,0.2)},
  {k:'icon', sym:'pin', x:1170,y:400,s:64,c:'warn', at:L(30,0.3), a:'down', out:L(150,0.2)},
  {k:'card', x:1170,y:610, sym:'calendar', cap:'Renja / RKA', sm:'Tahunan · Risiko Operasional', w:330, c:'warn', at:L(30,0.6), a:'rise', out:L(150,0.2)},
  {k:'icon', sym:'pin', x:1590,y:400,s:64,c:'gold', at:L(31,0.3), a:'down', out:L(150,0.2)},
  {k:'card', x:1590,y:610, sym:'quarter', cap:'Triwulan', sm:'Laporan berkala & pemantauan', w:330, c:'gold', at:L(31,0.6), a:'rise', out:L(150,0.2)},""")

    # ── s9: kotak dua sumber naik sedikit agar tidak menyenggol chip ───
    ganti("{k:'box', x:560,y:800, w:640, t:'FORM 1b — REVIU DOKUMEN'",
          "{k:'box', x:560,y:785, w:640, t:'FORM 1b — REVIU DOKUMEN'")
    ganti("{k:'icon', sym:'split', x:960,y:800, s:82,",
          "{k:'icon', sym:'split', x:960,y:785, s:82,")
    ganti("{k:'box', x:1360,y:800, w:640, t:'FORM 1a — SURVEI PERSEPSI'",
          "{k:'box', x:1360,y:785, w:640, t:'FORM 1a — SURVEI PERSEPSI'")

    # ── s15: lima kartu respon keluar sebelum kotak duplikasi masuk ────
    for x, cap in [(300, 'Avoid'), (630, 'Abate'), (960, 'Mitigate'),
                   (1290, 'Share / Transfer'), (1620, 'Accept')]:
        lama = f"cap:'{cap}',"
        i = s.index(lama)
        akhir = s.index("},", i)
        blok = s[i:akhir]
        assert "out:" not in blok, cap
        s = s[:akhir] + ", out:L(160,0.2)" + s[akhir:]
        n[0] += 1

    ganti("{k:'box', x:960,y:665, w:1400, t:'JANGAN DUPLIKATIF'",
          "{k:'box', x:960,y:640, w:1400, t:'JANGAN DUPLIKATIF'")
    ganti("{k:'cap', x:960,y:800, c:'neutral', at:L(161,0.9),",
          "{k:'cap', x:960,y:790, c:'neutral', at:L(161,0.9),")

    # ── s16: kriteria e diberi jarak yang sama dengan a-d ──────────────
    ganti("{k:'chip', x:960,y:690, text:'e · Sudah berjalan namun masih lemah",
          "{k:'chip', x:960,y:712, text:'e · Sudah berjalan namun masih lemah")

    # ── s24: jarak disetel ulang memakai tinggi kartu hasil ukur ───────
    ganti("sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(145,0.5), a:'stamp'},",
          "sm:'Kepala Daerah · tunggal, tidak didelegasikan', w:860, c:'gold', at:L(145,0.5), a:'pop'},")
    ganti("{k:'chip', x:960,y:470, text:'Melekat pada jabatan",
          "{k:'chip', x:960,y:500, text:'Melekat pada jabatan")
    ganti("{k:'card', x:500,y:620, sym:'org', cap:'Pemilik Risiko'",
          "{k:'card', x:500,y:655, sym:'org', cap:'Pemilik Risiko'")
    ganti("{k:'chip', x:500,y:750, text:'Isinya UNIT",
          "{k:'chip', x:500,y:815, text:'Isinya UNIT")
    ganti("{k:'chip', x:500,y:830, text:'Strategis Pemda",
          "{k:'chip', x:500,y:882, text:'Strategis Pemda")
    ganti("{k:'card', x:1420,y:620, sym:'badge', cap:'Penanggung Jawab Pengendalian'",
          "{k:'card', x:1420,y:655, sym:'badge', cap:'Penanggung Jawab Pengendalian'")
    ganti("{k:'chip', x:1420,y:750, text:'Isinya JABATAN'",
          "{k:'chip', x:1420,y:815, text:'Isinya JABATAN'")
    ganti("{k:'chip', x:1420,y:830, text:'Melekat pada kontrolnya",
          "{k:'chip', x:1420,y:882, text:'Melekat pada kontrolnya")

    # ── s25: kartu uji coba tidak lagi membesar dulu ───────────────────
    ganti("sm:'Dicoba dulu dalam lingkup kecil', w:420, c:'warn', at:L(166,1.5), a:'stamp'",
          "sm:'Dicoba dulu dalam lingkup kecil', w:420, c:'warn', at:L(166,1.5), a:'pop'")
    ganti("{k:'chip', x:960,y:670, text:'Baru sesudah itu ditetapkan berlaku'",
          "{k:'chip', x:960,y:700, text:'Baru sesudah itu ditetapkan berlaku'")

    # ── s18: Form 14 tidak membesar dulu di sebelah Form 13 ────────────
    ganti("{k:'chip', x:1795,y:390, text:'Form 14', c:'violet', size:26, at:L(169,0.9), a:'stamp'",
          "{k:'chip', x:1795,y:390, text:'Form 14', c:'violet', size:26, at:L(169,0.9), a:'pop'")

    # ── s19: kartu jadwal tidak membesar dulu ──────────────────────────
    ganti("sm:'Tanda merah bila lewat tenggat', w:330, c:'risk', at:L(90,0.6), a:'stamp'",
          "sm:'Tanda merah bila lewat tenggat', w:330, c:'risk', at:L(90,0.6), a:'pop'")

    io.open(F, "w", encoding="utf-8").write(s)
    print(f"tata letak: {n[0]} perbaikan diterapkan")


if __name__ == "__main__":
    main()
