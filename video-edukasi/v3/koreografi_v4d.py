"""
Perbaikan tata letak lanjutan: sepuluh pasangan yang masih beririsan setelah
koreografi_v4c.py dijalankan.

Sebagian besar bukan soal jarak, melainkan soal WAKTU: item yang sudah selesai
tugasnya tidak pernah diperintahkan pergi, sehingga masih terpampang saat
kalimat berikutnya memasang isi baru di tempat yang sama.

Satu di antaranya bawaan v3, bukan akibat perubahan v4: tangkapan layar pada
scene s10 masuk dengan efek naik dari bawah sehingga sesaat melintasi barisan
chip hierarki di bawahnya.
"""
import io
F='scenes.js'
s=io.open(F,encoding='utf-8').read()
n=0
def g(a,b):
    global s,n
    assert a in s and s.count(a)==1, a[:120]
    s=s.replace(a,b,1); n+=1

# s14: penjelasan peringkat matriks selesai tugasnya sebelum Selera Risiko masuk
g("text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(65,0.7), a:'right', idle:'bob'}",
  "text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(65,0.7), a:'right', idle:'bob', out:L(157,0.2)}")

# s16: pertanyaan pembuka keluar begitu kelima kriterianya mulai disebut
g("text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(162,0.6), a:'up', idle:'pulse', out:L(79,0.0)}",
  "text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(162,0.6), a:'up', idle:'pulse', out:L(163,0.2)}")

# s15: keterangan penutup diberi jarak dari chip dua jenis RTP
g("{k:'cap', x:960,y:790, c:'neutral', at:L(161,0.9),",
  "{k:'cap', x:960,y:770, c:'neutral', at:L(161,0.9),")

# s9: judul naik supaya tidak menyenggol kotak di bawahnya
g("{k:'lbl', x:960,y:700, text:'KALAU DUA SUMBERNYA BERTENTANGAN'",
  "{k:'lbl', x:960,y:668, text:'KALAU DUA SUMBERNYA BERTENTANGAN'")

# s10 (bawaan v3): tangkapan layar masuk dengan naik dari bawah, sehingga
# sesaat melintasi barisan chip hierarki. Diganti masuk memudar di tempat.
g("{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(48,4.2), a:'rise'}",
  "{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(48,4.2), a:'fade'}")

io.open(F,'w',encoding='utf-8').write(s)
print('perbaikan lanjutan:',n)
import io
F='scenes.js'
s=io.open(F,encoding='utf-8').read()
n=0
def g(a,b):
    global s,n
    assert a in s and s.count(a)==1, a[:120]
    s=s.replace(a,b,1); n+=1

# s14: penjelasan peringkat matriks selesai tugasnya sebelum Selera Risiko masuk
g("text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(65,0.7), a:'right', idle:'bob'}",
  "text:'Peringkat 1 – 25, BUKAN perkalian', c:'risk', at:L(65,0.7), a:'right', idle:'bob', out:L(157,0.2)}")

# s16: pertanyaan pembuka keluar begitu kelima kriterianya mulai disebut
g("text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(162,0.6), a:'up', idle:'pulse', out:L(79,0.0)}",
  "text:'Tidak Efektif / Kurang Efektif → celahnya sebenarnya di mana?', c:'risk', at:L(162,0.6), a:'up', idle:'pulse', out:L(163,0.2)}")

# s15: keterangan penutup diberi jarak dari chip dua jenis RTP
g("{k:'cap', x:960,y:790, c:'neutral', at:L(161,0.9),",
  "{k:'cap', x:960,y:770, c:'neutral', at:L(161,0.9),")

# s9: judul naik supaya tidak menyenggol kotak di bawahnya
g("{k:'lbl', x:960,y:700, text:'KALAU DUA SUMBERNYA BERTENTANGAN'",
  "{k:'lbl', x:960,y:668, text:'KALAU DUA SUMBERNYA BERTENTANGAN'")

# s10 (bawaan v3): tangkapan layar masuk dengan naik dari bawah, sehingga
# sesaat melintasi barisan chip hierarki. Diganti masuk memudar di tempat.
g("{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(48,4.2), a:'rise'}",
  "{k:'shot', x:960,y:545, src:'krs-pemda', url:'mrkabar.test/krs_irs_pemda', w:1120, h:380, shift:110, at:L(48,4.2), a:'fade'}")

io.open(F,'w',encoding='utf-8').write(s)
print('perbaikan lanjutan:',n)
