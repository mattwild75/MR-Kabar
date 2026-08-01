"""Perkakas penyusun berkas .docx untuk naskah peraturan perundang-undangan.

Tata letak mengikuti Lampiran II Undang-Undang Nomor 12 Tahun 2011
sebagaimana telah diubah dengan Undang-Undang Nomor 13 Tahun 2022:
kepala peraturan simetris, konsiderans "Menimbang", dasar hukum
"Mengingat", diktum "MEMUTUSKAN", batang tubuh berjenjang BAB - Bagian -
Pasal - ayat, penutup pengesahan dan pengundangan, serta lampiran.

Huruf Bookman Old Style 12 pt, kertas A4, dan nomor halaman "- n -" di
tengah atas mulai halaman kedua.
"""
import zipfile
from pathlib import Path

FONT = '<w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style" w:cs="Bookman Old Style"/>'


def sz(p=24):
    return f'<w:sz w:val="{p}"/><w:szCs w:val="{p}"/>'


def esc(t):
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def R(t, b=False, i=False, u=False, p=24, warna=None):
    """`warna` diisi kode heksadesimal tanpa pagar, misalnya "FF0000".

    Dipakai menandai isian yang sengaja dikosongkan untuk Bagian Hukum, supaya
    siapa pun yang membuka naskah langsung melihat mana yang masih menunggu
    diisi tanpa perlu membaca catatan terpisah.
    """
    r = f"<w:rPr>{FONT}{'<w:b/>' if b else ''}{'<w:i/>' if i else ''}"
    r += '<w:u w:val="single"/>' if u else ""
    r += f'<w:color w:val="{warna}"/>' if warna else ""
    r += sz(p) + "</w:rPr>"
    return f'<w:r>{r}<w:t xml:space="preserve">{esc(t)}</w:t></w:r>'


def P(t="", rata="both", b=False, i=False, u=False, after=0, before=0,
      kiri=0, gantung=0, line=240, tab=None, p=24, potong=False, jaga=False,
      gaya=None, warna=None):
    pr = "<w:pPr>"
    if gaya:
        pr += f'<w:pStyle w:val="{gaya}"/>'

    if jaga:
        pr += "<w:keepNext/><w:keepLines/>"
    if potong:
        pr += "<w:pageBreakBefore/>"
    if tab:
        pr += "<w:tabs>" + "".join(
            f'<w:tab w:val="left" w:pos="{x}"/>' for x in (tab if isinstance(tab, (list, tuple)) else [tab])) + "</w:tabs>"
    pr += f'<w:spacing w:before="{before}" w:after="{after}" w:line="{line}" w:lineRule="auto"/>'
    if kiri or gantung:
        pr += f'<w:ind w:left="{kiri}"' + (f' w:hanging="{gantung}"' if gantung else "") + "/>"
    pr += f'<w:jc w:val="{rata}"/><w:rPr>{FONT}{sz(p)}</w:rPr></w:pPr>'
    return "<w:p>" + pr + (R(t, b, i, u, p, warna) if t != "" else "") + "</w:p>"


def PM(bag, rata="both", after=0, kiri=0, gantung=0, line=240, tab=None, p=24, jaga=False):
    pr = "<w:pPr>"
    if jaga:
        pr += "<w:keepNext/><w:keepLines/>"
    if tab:
        pr += "<w:tabs>" + "".join(
            f'<w:tab w:val="left" w:pos="{x}"/>' for x in (tab if isinstance(tab, (list, tuple)) else [tab])) + "</w:tabs>"
    pr += f'<w:spacing w:after="{after}" w:line="{line}" w:lineRule="auto"/>'
    if kiri or gantung:
        pr += f'<w:ind w:left="{kiri}"' + (f' w:hanging="{gantung}"' if gantung else "") + "/>"
    pr += f'<w:jc w:val="{rata}"/><w:rPr>{FONT}{sz(p)}</w:rPr></w:pPr>'
    return "<w:p>" + pr + "".join(R(x, bb, p=p) for x, bb in bag) + "</w:p>"


# ── unsur naskah peraturan ────────────────────────────────────────────
def bab(nomor, judul):
    return (P(f"BAB {nomor}", rata="center", b=True, before=240, after=0, jaga=True)
            + P(judul, rata="center", b=True, after=200, jaga=True, gaya="Heading1"))


def bagian(urut, judul):
    return (P(f"Bagian {urut}", rata="center", b=True, before=160, after=0, jaga=True)
            + P(judul, rata="center", b=True, after=180, jaga=True, gaya="Heading2"))


def pasal(n):
    return P(f"Pasal {n}", rata="center", b=True, before=160, after=160, jaga=True,
             gaya="Heading3")


def ayat(n, teks):
    return PM([(f"({n})", False), ("\t", False), (teks, False)],
              kiri=567, gantung=567, after=120, tab=567, line=264)


def huruf(h, teks, kiri=1021, gantung=454):
    return PM([(f"{h}.", False), ("\t", False), (teks, False)],
              kiri=kiri, gantung=gantung, after=100, tab=kiri, line=264)


def angka(n, teks, kiri=1474, gantung=453):
    return PM([(f"{n}.", False), ("\t", False), (teks, False)],
              kiri=kiri, gantung=gantung, after=100, tab=kiri, line=264)


def par(teks, after=120):
    return P(teks, after=after, line=264)


def definisi(n, teks):
    return PM([(f"{n}.", False), ("\t", False), (teks, False)],
              kiri=680, gantung=680, after=100, tab=680, line=264)


def blok_label(label, isi, lebar=1560):
    """Baris 'Menimbang : a. ...' dengan kolom lurus."""
    return PM([(label, False), ("\t", False), (":" if label else "", False), ("\t", False),
               (isi, False)], kiri=2410, gantung=2410, after=100,
              tab=[lebar, lebar + 280, 2410], line=264)


def blok_konsiderans(label, butir):
    out = []
    for n, (tanda, teks) in enumerate(butir):
        out.append(PM([(label if n == 0 else "", False), ("\t", False),
                       (":" if n == 0 else "", False), ("\t", False),
                       (tanda, False), ("\t", False), (teks, False)],
                      kiri=2977, gantung=2977, after=100,
                      tab=[1560, 1840, 2410, 2977], line=264))
    return "".join(out)


def tabel(kolom_lebar, baris, kepala=True, p=20, rata_sel=None):
    """Tabel bergaris. `baris` = list of list-of-str (baris pertama = kepala)."""
    rata_sel = rata_sel or ["left"] * len(kolom_lebar)
    out = ('<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>'
           + "".join(f'<w:{s} w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
                     for s in ("top", "left", "bottom", "right", "insideH", "insideV"))
           + '</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar>'
             '<w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>'
             '<w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/>'
             "</w:tblCellMar></w:tblPr><w:tblGrid>"
           + "".join(f'<w:gridCol w:w="{w}"/>' for w in kolom_lebar) + "</w:tblGrid>")
    for idx, brs in enumerate(baris):
        tebal = kepala and idx == 0
        trpr = "<w:trPr><w:cantSplit/>" + ("<w:tblHeader/>" if tebal else "") + "</w:trPr>"
        out += "<w:tr>" + trpr
        for j, sel in enumerate(brs):
            isi = "".join(
                P(x, rata="center" if tebal else rata_sel[j], b=tebal, after=0, p=p, line=240)
                for x in str(sel).split("\n"))
            out += (f'<w:tc><w:tcPr><w:tcW w:w="{kolom_lebar[j]}" w:type="dxa"/>'
                    + ('<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>' if tebal else "")
                    + f"</w:tcPr>{isi}</w:tc>")
        out += "</w:tr>"
    return out + "</w:tbl>"


def ukuran_jpeg(path):
    """Lebar dan tinggi JPEG dibaca dari penanda SOF-nya, tanpa pustaka luar."""
    data = Path(path).read_bytes()
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        m = data[i + 1]
        if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            return (int.from_bytes(data[i + 7:i + 9], "big"),
                    int.from_bytes(data[i + 5:i + 7], "big"))
        i += 2 + int.from_bytes(data[i + 2:i + 4], "big")
    raise ValueError(f"ukuran JPEG tidak terbaca: {path}")


_gambar_ke = [0]


def keterangan_gambar(teks):
    return keterangan("Gambar", teks)


def keterangan_tabel(teks):
    return keterangan("Tabel", teks)


def gambar(rid, path, keterangan="", lebar_inci=6.0):
    """Gambar sebaris penuh beserta keterangan di bawahnya."""
    lb, tg = ukuran_jpeg(path)
    lebar = int(lebar_inci * 914400)
    tinggi = int(lebar * tg / lb)
    _gambar_ke[0] += 1
    n = _gambar_ke[0]
    dr = (f'<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="60" w:line="240" '
          f'w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>'
          f'<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">'
          f'<wp:extent cx="{lebar}" cy="{tinggi}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>'
          f'<wp:docPr id="{700 + n}" name="Gambar {n}"/>'
          f'<wp:cNvGraphicFramePr><a:graphicFrameLocks '
          f'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>'
          f'</wp:cNvGraphicFramePr>'
          f'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
          f'<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          f'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          f'<pic:nvPicPr><pic:cNvPr id="{700 + n}" name="Gambar {n}"/><pic:cNvPicPr/></pic:nvPicPr>'
          f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
          f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{lebar}" cy="{tinggi}"/></a:xfrm>'
          f'<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
          f"</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>")
    ket = keterangan_gambar(keterangan) if keterangan else ""
    return dr + ket


def keterangan(jenis, teks):
    """Keterangan bergaya Caption dengan nomor otomatis lewat medan SEQ.

    Nomornya dihitung Word sendiri, sehingga menyisipkan gambar atau tabel
    baru di tengah naskah tidak membuat penomoran berikutnya salah, dan
    keterangan ini bisa dirujuk silang serta dikumpulkan menjadi daftar
    gambar atau daftar tabel lewat fitur bawaan Word.
    """
    return (f'<w:p><w:pPr><w:pStyle w:val="Caption"/></w:pPr>'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr>'
            f'<w:t xml:space="preserve">{esc(jenis)} </w:t></w:r>'
            f'<w:fldSimple w:instr=" SEQ {esc(jenis)} \\* ARABIC ">'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr><w:t>1</w:t></w:r></w:fldSimple>'
            f'<w:r><w:rPr>{FONT}<w:i/>{sz(20)}</w:rPr>'
            f'<w:t xml:space="preserve">. {esc(teks)}</w:t></w:r></w:p>')


def ttd_kanan(jabatan, nama, jarak=900):
    return (PM([(jabatan, True)], kiri=4990, after=jarak, rata="left")
            + PM([(nama, True)], kiri=4990, after=0, rata="left"))


# ── pengemasan berkas ─────────────────────────────────────────────────
NS = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"')

HEADER = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          f'<w:hdr {NS}><w:p><w:pPr><w:jc w:val="center"/>'
          f'<w:rPr>{FONT}{sz(24)}</w:rPr></w:pPr>'
          f'<w:r><w:rPr>{FONT}{sz(24)}</w:rPr><w:t>-</w:t></w:r>'
          f'<w:fldSimple w:instr=" PAGE "><w:r><w:rPr>{FONT}{sz(24)}</w:rPr>'
          '<w:t>2</w:t></w:r></w:fldSimple>'
          f'<w:r><w:rPr>{FONT}{sz(24)}</w:rPr><w:t>-</w:t></w:r>'
          "</w:p></w:hdr>")

HEADER_KOSONG = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                 f'<w:hdr {NS}><w:p><w:pPr><w:jc w:val="center"/>'
                 f'<w:rPr>{FONT}{sz(24)}</w:rPr></w:pPr></w:p></w:hdr>')

def sectpr(lanskap=False, halaman_pertama_beda=True):
    """Sifat bagian dokumen.

    Lampiran yang berisi formulir lebar dicetak lanskap — pada halaman
    potret, tabel 11 sampai 12 kolom memaksa Word memenggal judul kolom di
    tengah kata sehingga naskahnya tidak layak sebagai lampiran peraturan.
    """
    if lanskap:
        ukuran = '<w:pgSz w:w="18709" w:h="12246" w:orient="landscape"/>'
        marjin = ('<w:pgMar w:top="1247" w:right="1134" w:bottom="1247" w:left="1417" '
                  'w:header="709" w:footer="709" w:gutter="0"/>')
    else:
        ukuran = '<w:pgSz w:w="12246" w:h="18709"/>'
        marjin = ('<w:pgMar w:top="1247" w:right="1077" w:bottom="1247" w:left="1417" '
                  'w:header="709" w:footer="709" w:gutter="0"/>')
    return ('<w:sectPr>'
            '<w:headerReference w:type="default" r:id="rIdHdr"/>'
            + ('<w:headerReference w:type="first" r:id="rIdHdr0"/>' if halaman_pertama_beda else "")
            + ukuran + marjin + '<w:cols w:space="708"/>'
            + ('<w:titlePg/>' if halaman_pertama_beda else "")
            + '<w:docGrid w:linePitch="360"/></w:sectPr>')


SECT = sectpr()


def paragraf_pemisah_bagian(sect):
    """Paragraf kosong pembawa sifat bagian yang BERAKHIR di sini.

    Dalam OOXML, sifat sebuah bagian disimpan pada paragraf terakhir bagian
    itu, bukan pada paragraf pertama bagian berikutnya.
    """
    return (f'<w:p><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/>'
            f"<w:rPr>{FONT}{sz(24)}</w:rPr>{sect}</w:pPr></w:p>")

STYLES = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          f'<w:styles {NS}><w:docDefaults><w:rPrDefault><w:rPr>'
          '<w:rFonts w:ascii="Bookman Old Style" w:eastAsia="Bookman Old Style" '
          'w:hAnsi="Bookman Old Style" w:cs="Bookman Old Style"/>'
          '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/>'
          '</w:rPr></w:rPrDefault><w:pPrDefault/></w:docDefaults>'
          '<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
          '<w:name w:val="Normal"/><w:qFormat/></w:style>'
          + "".join(
              '<w:style w:type="paragraph" w:styleId="Heading%d">'
              '<w:name w:val="heading %d"/><w:basedOn w:val="Normal"/><w:qFormat/>'
              '<w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="%d"/>'
              '<w:jc w:val="center"/></w:pPr>'
              '<w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style"/>'
              '<w:b/><w:color w:val="000000"/><w:sz w:val="24"/></w:rPr></w:style>'
              % (n, n, n - 1) for n in (1, 2, 3))
          + '<w:style w:type="paragraph" w:styleId="Caption">'
            '<w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:qFormat/>'
            '<w:pPr><w:keepNext/><w:spacing w:after="200"/><w:jc w:val="center"/></w:pPr>'
            '<w:rPr><w:rFonts w:ascii="Bookman Old Style" w:hAnsi="Bookman Old Style"/>'
            '<w:i/><w:color w:val="000000"/><w:sz w:val="20"/></w:rPr></w:style>'
          + "</w:styles>")

CT = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      '<Default Extension="xml" ContentType="application/xml"/>'
      '<Default Extension="jpeg" ContentType="image/jpeg"/>'
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
      '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
      '<Override PartName="/word/header2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
      "</Types>")

RELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        "</Relationships>")

DRELS = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
         '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
         '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
         '<Relationship Id="rIdHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
         '<Relationship Id="rIdHdr0" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header2.xml"/>'
         "</Relationships>")


def tulis(path, isi_body, sect_akhir=None, daftar_gambar=None):
    doc = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
           f"<w:document {NS}><w:body>" + isi_body + (sect_akhir or SECT) + "</w:body></w:document>")
    if path.exists():
        path.unlink()
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CT)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/document.xml", doc)
        rels = DRELS
        if daftar_gambar:
            tambah = "".join(
                f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/'
                f'officeDocument/2006/relationships/image" Target="media/{Path(p).name}"/>'
                for rid, p in daftar_gambar)
            rels = rels.replace("</Relationships>", tambah + "</Relationships>")
        z.writestr("word/_rels/document.xml.rels", rels)
        z.writestr("word/styles.xml", STYLES)
        z.writestr("word/header1.xml", HEADER)
        z.writestr("word/header2.xml", HEADER_KOSONG)
        for _rid, p in (daftar_gambar or []):
            z.write(p, f"word/media/{Path(p).name}")
