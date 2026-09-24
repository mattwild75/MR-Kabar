/** Komponen 30 Formulir Kendali Mutu (KMA 1–30). Tiap komponen menerima data
 * ternormalisasi (ArepData) dan mengembalikan isi satu halaman formulir. */
import { Fragment, type ReactNode } from 'react';
import { type ArepData, type AwBaris } from '@/pages/erpika/arep/forms/bagian';
import { Baris, GridKosong, JudulKm, KopKm, KotakTtd, TtdDua } from '@/pages/erpika/arep/forms/km-bagian';

export interface KmMeta {
    no: number;
    kode: string;
    nama: string;
    tahapan: string;
    autofill: boolean;
    orientasi: string;
}

/** Sel tabel kecil bergaris. */
const td = 'border border-black px-1';

/** Baris KM 6: nomor, huruf, label, titik dua, isi. */
function L6({ n, h, label, v }: { n?: string; h?: string; label: string; v: ReactNode }) {
    return (
        <div className="flex gap-1 py-[1px]">
            <div className="w-[6mm] shrink-0">{n}</div>
            <div className="w-[5mm] shrink-0">{h}</div>
            <div className="w-[74mm] shrink-0">{label}</div>
            <div className="shrink-0">:</div>
            <div className="flex-1">{v}</div>
        </div>
    );
}

/** KM 6 — Kartu Penugasan (tata letak persis berkas KM Inspektorat). */
function Km6({ d }: { d: ArepData }) {
    const kk = d.jenis.kata_kerja;
    const titik = '............................';
    const anggota = d.anggota.filter((a) => a.nama);
    return (
        <div className="text-[9.5pt] leading-tight">
            <KopKm d={d} kode="KM 6" />
            <JudulKm sub={`NOMOR : ${d.nomor.kp ?? '-'}`}>Kartu Penugasan</JudulKm>
            <div className="mt-2">
                <L6 n="1." h="a." label="Nama objek penugasan" v={d.objek} />
                <L6
                    h="b."
                    label="Alamat dan Nomor Telepon"
                    v={
                        <>
                            Kabupaten Aceh Barat
                            <br />
                            Telepon :
                        </>
                    }
                />
                <L6 n="2." label={`Rencana ${kk} Nomor`} v={`${d.nomor.rpp ?? '-'}${d.rpp.tanggal_rpp ? ' tanggal ' + d.rpp.tanggal_rpp : ''}`} />
                <L6 n="3." h="a." label={`Program yang di ${kk}`} v={titik} />
                <L6 h="b." label="Sasaran Pemeriksaan" v={titik} />
                <L6 h="c." label="Tujuan Pemeriksaan" v={titik} />
                <L6 n="4." label="Laporan dikirim kepada" v={d.laporan_kepada} />
                {d.dalnis_rangkap ? (
                    <L6 n="5." h="a." label="PPJ / Pengendali Teknis" v={d.wpj.nama || '-'} />
                ) : (
                    <>
                        <L6 n="5." h="a." label="Wakil Penanggung Jawab" v={d.wpj.nama || '-'} />
                        <L6 h="b." label="Pengendali Teknis" v={d.dalnis.nama || '-'} />
                    </>
                )}
                <L6 h={d.dalnis_rangkap ? 'b.' : 'c.'} label="Ketua Tim" v={d.kt.nama || '-'} />
                <L6
                    h={d.dalnis_rangkap ? 'c.' : 'd.'}
                    label="Anggota Tim"
                    v={
                        anggota.length
                            ? anggota.map((a, i) => (
                                  <div key={i}>
                                      {i + 1}. {a.nama}
                                  </div>
                              ))
                            : '-'
                    }
                />
                <L6 n="6." label={`${kk} dilakukan dengan Surat Tugas`} v="" />
                <L6 h="a." label="Nomor" v={d.nomor.st} />
                <L6 h="b." label="Tanggal" v={d.tanggal.st} />
                <L6 h="c." label="Dimulai pada tanggal" v={d.tanggal.st} />
                <L6 h="d." label="Direncanakan selesai pada tanggal" v={d.jangka.selesai} />
                <L6 h="e." label="Selesai pada tanggal" v={d.jangka.selesai} />
                <L6 n="7." label="Kunjungan PPJ ke lapangan dan reviu PPJ" v="" />
                <div className="ml-[11mm] grid grid-cols-2">
                    <div>
                        Dilaksanakan pada :<br />- Tanggal ....................
                    </div>
                    <div>
                        Direalisasikan pada tanggal :<br />- Tanggal ....................
                    </div>
                </div>
                <L6 n="8." label={`Anggaran waktu hari produktif Tim ${kk}`} v="" />
                <table className="mt-0.5 ml-[11mm] w-[calc(100%-11mm)] border-collapse">
                    <thead>
                        <tr className="text-center">
                            <td className="w-[32mm] text-left whitespace-nowrap">Dilaksanakan oleh</td>
                            <td />
                            <td className="w-[34mm]">Anggaran Waktu</td>
                            <td className="w-[34mm]">Realisasi</td>
                        </tr>
                    </thead>
                    <tbody>
                        {d.anggaran_waktu.orang.map((o, i) => (
                            <tr key={i}>
                                <td>{o.label}</td>
                                <td>: {o.nama}</td>
                                <td className="text-center">
                                    {num(o.hp)} Hari/ {num(o.jam)} Jam
                                </td>
                                <td className="text-center">
                                    {num(o.hp)} Hari/ {num(o.jam)} Jam
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-1 flex gap-1">
                    <div className="w-[6mm] shrink-0">9</div>
                    <div className="grid flex-1 grid-cols-2">
                        <div>
                            Rencana Mulai Pemeriksaan (RMP)
                            <br />
                            bulan {d.jangka.bulan_mulai}
                            <br />
                            Realisasi RMP bulan {d.jangka.bulan_mulai}
                        </div>
                        <div>
                            Rencana Penerbitan Laporan (RPL)
                            <br />
                            bulan {d.jangka.bulan_selesai}
                            <br />
                            Realisasi RPL bulan {d.jangka.bulan_selesai}
                        </div>
                    </div>
                </div>
                <div className="mt-1 flex gap-1">
                    <div className="w-[6mm] shrink-0">10.</div>
                    <div>
                        Konsep laporan direncanakan selesai selambat-lambatnya pada bulan {d.jangka.bulan_selesai_tahun}
                        <br />
                        Realisasi konsep laporan diselesaikan pada tanggal : {d.jangka.selesai}
                    </div>
                </div>
            </div>
            <div className="mt-3 text-right">Meulaboh, {d.tanggal.st}</div>
            <div className={`grid gap-2 ${d.dalnis_rangkap ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <KotakTtd jabatan="Inspektur Kabupaten Aceh Barat" nama={d.inspektur.nama} nip={d.inspektur.nip_spasi} />
                {!d.dalnis_rangkap && <KotakTtd jabatan="Pengendali Teknis" nama={d.dalnis.nama} nip={d.dalnis.nip_spasi} />}
                <KotakTtd
                    jabatan={d.dalnis_rangkap ? 'PPJ / Pengendali Teknis' : 'Wakil Penanggung Jawab'}
                    nama={d.wpj.nama}
                    nip={d.wpj.nip_spasi}
                />
            </div>
        </div>
    );
}

/** Angka gaya Indonesia: 32.5 → 32,5. */
const num = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','));

function SelHpJam({ s }: { s: { hp: number | null; jam: number | null } }) {
    return (
        <>
            <td className={`${td} text-center`}>{num(s.hp)}</td>
            <td className={`${td} text-center`}>{num(s.jam)}</td>
        </>
    );
}

/** KM 7 — Anggaran Waktu Penugasan (tata letak & rumus persis berkas KM). */
function Km7({ d }: { d: ArepData }) {
    const aw = d.anggaran_waktu;
    const pk = d.jenis.kata_kerja === 'Reviu' ? 'Menyusun PKR' : 'Menyusun PKA';
    const items: Record<string, string[]> = {
        I: ['Penyusunan rencana penugasan', 'Pembicaraan pendahuluan', 'Pengumpulan informasi umum', 'Penelaahan peraturan perUUan', pk],
        II: [
            'Pemeriksaan (pengembangan) pemeriksaan bukti/dokumen tambahan)',
            'Pembicaraan dengan pejabat obrik (interview dan penjelasan)',
            'Pemeriksaan fisik/konfirmasi',
            'Penyusunan kesimpulan',
        ],
        III: ['Pembahasan intern tim dan PPJ', 'Menyusun konsep laporan/daftar lampiran', 'Pembahasan konsep LHP'],
    };
    const grup = [d.dalnis_rangkap ? 'PPJ/Dalnis' : 'WPJ', 'Dalnis', 'KT', 'AT', 'Jumlah'];
    const barisAngka = (b: AwBaris) => (
        <>
            <SelHpJam s={b.wpj} />
            <SelHpJam s={b.dalnis} />
            <SelHpJam s={b.kt} />
            <SelHpJam s={b.at} />
            <SelHpJam s={b.jumlah} />
        </>
    );
    return (
        <div className="text-[9.5pt] leading-snug">
            <KopKm d={d} kode="KM 7" />
            <JudulKm>Anggaran Waktu Penugasan</JudulKm>
            <div className="mt-2">
                <Baris label="Nama Objek Penugasan" value={d.objek} />
                <Baris label="Nomor Kartu Penugasan" value={d.nomor.kp ?? '-'} />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                    Persiapan Penugasan dari
                    <br />
                    {aw.tahap.persiapan}
                </div>
                <div>
                    Pelaksanaan Penugasan dari
                    <br />
                    {aw.tahap.pelaksanaan}
                </div>
                <div>
                    Penyelesaian Penugasan
                    <br />
                    {aw.tahap.penyelesaian}
                </div>
            </div>
            <table className="mt-2 w-full border-collapse">
                <thead className="text-center font-bold">
                    <tr>
                        <td className={td} rowSpan={2} colSpan={2}></td>
                        {grup.map((g) => (
                            <td key={g} className={td} colSpan={2}>
                                {g}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        {grup.flatMap((g) => [
                            <td key={g + 'h'} className={td}>
                                HP
                            </td>,
                            <td key={g + 'j'} className={td}>
                                Jam
                            </td>,
                        ])}
                    </tr>
                </thead>
                <tbody>
                    {aw.baris.map((b) => (
                        <Fragment key={b.rom}>
                            <tr className="font-bold">
                                <td className={`${td} text-center`}>{b.rom}</td>
                                <td className={td}>{b.judul}</td>
                                {barisAngka(b)}
                            </tr>
                            {items[b.rom].map((it, i) => (
                                <tr key={b.rom + i}>
                                    <td className={`${td} text-center`}>{i + 1}</td>
                                    <td className={td}>{it}</td>
                                    {Array.from({ length: 10 }).map((_, c) => (
                                        <td key={c} className={td} />
                                    ))}
                                </tr>
                            ))}
                            <tr className="font-semibold">
                                <td className={td} colSpan={2}>
                                    Jumlah HP/Jam Penugasan {b.rom}
                                </td>
                                {barisAngka(b)}
                            </tr>
                        </Fragment>
                    ))}
                    <tr className="font-bold">
                        <td className={td} colSpan={2}>
                            Jumlah HP/Jam Penugasan yang dianggarkan
                        </td>
                        <SelHpJam s={aw.total.wpj} />
                        <SelHpJam s={aw.total.dalnis} />
                        <SelHpJam s={aw.total.kt} />
                        <SelHpJam s={aw.total.at} />
                        <SelHpJam s={aw.total.jumlah} />
                    </tr>
                </tbody>
            </table>
            <div className="mt-2 text-right">Meulaboh, {d.tanggal.st}</div>
            <div className={`grid gap-2 ${d.dalnis_rangkap ? 'grid-cols-2' : 'grid-cols-3'}`}>
                <KotakTtd
                    pra="Disetujui oleh,"
                    jabatan={d.dalnis_rangkap ? 'PPJ / Pengendali Teknis' : 'Wakil Penanggungjawab'}
                    nama={d.wpj.nama}
                    nip={d.wpj.nip_spasi}
                />
                {!d.dalnis_rangkap && <KotakTtd pra={' '} jabatan="Pengendali Teknis" nama={d.dalnis.nama} nip={d.dalnis.nip_spasi} />}
                <KotakTtd pra="Disusun oleh," jabatan="Ketua Tim," nama={d.kt.nama} nip={d.kt.nip_spasi} />
            </div>
            <div className="mx-auto mt-1 w-[70mm]">
                <KotakTtd pra="Mengetahui/Menyetujui :" jabatan="Inspektur Kabupaten Aceh Barat," nama={d.inspektur.nama} nip={d.inspektur.nip_spasi} />
            </div>
        </div>
    );
}

/** KM 9 — Program Kerja Audit. */
function Km9({ d }: { d: ArepData }) {
    return (
        <>
            <KopKm d={d} kode="KM 9" />
            <div className="mt-3">
                <Baris label="Nama Auditi" value={d.objek} w="34mm" />
                <Baris label="Sasaran" value={d.sifat || ''} w="34mm" />
                <Baris label="Surat Tugas" value={`${d.nomor.st} tanggal ${d.tanggal.st}`} w="34mm" />
            </div>
            <JudulKm>Program Kerja Audit</JudulKm>
            <GridKosong
                kolom={['No', 'Langkah Kerja Audit', 'Dilaksanakan oleh', 'Waktu (Renc.)', 'Waktu (Real.)', 'Ref. KKA']}
                baris={11}
            />
            <TtdDua kiriJab="Pengendali Teknis" kiri={d.dalnis} kananJab="Ketua Tim" kanan={d.kt} tanggal={d.tanggal.st} />
        </>
    );
}

/** KM 27 — Surat Tugas (ringkas; paket lengkap ada di menu Surat Tugas). */
function Km27({ d }: { d: ArepData }) {
    return (
        <>
            <KopKm d={d} kode="KM 27" />
            <JudulKm sub={`Nomor : ${d.nomor.st}`}>Surat Tugas</JudulKm>
            <p className="mt-3">Inspektur Kabupaten Aceh Barat dengan ini menugaskan kepada:</p>
            <table className="mt-2 w-full border-collapse text-[10.5pt]">
                <thead>
                    <tr className="text-center font-bold">
                        <td className="border border-black px-1 py-1">NO</td>
                        <td className="border border-black px-2 py-1">NAMA / NIP</td>
                        <td className="border border-black px-2 py-1">JABATAN</td>
                        <td className="border border-black px-2 py-1">PERAN</td>
                    </tr>
                </thead>
                <tbody className="align-top">
                    {d.tim.map((m) => (
                        <tr key={m.no}>
                            <td className="border border-black px-1 py-1 text-center">{m.no}.</td>
                            <td className="border border-black px-2 py-1">
                                {m.nama}
                                <div className="text-[8.5pt]">NIP. {m.nip_spasi}</div>
                            </td>
                            <td className="border border-black px-2 py-1">{m.jabatan}</td>
                            <td className="border border-black px-2 py-1">{m.peran}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-3 text-justify">
                Untuk melakukan penugasan {d.frasa}, terhitung mulai tanggal {d.jangka.rentang} ({d.jangka.hari_kerja} hari
                kerja).
            </p>
            <div className="mt-6 ml-auto w-[78mm]">
                <KotakTtd pra={`Meulaboh, ${d.tanggal.st}`} jabatan="Inspektur Kabupaten Aceh Barat" nama={d.inspektur.nama} nip={d.inspektur.nip_spasi} />
            </div>
        </>
    );
}

/**
 * Formulir umum: kop + judul + identitas penugasan (autofill sebisanya) +
 * area isian kosong + blok tanda tangan. Dipakai formulir yang belum dibuat
 * khusus dan formulir tak-autofill (dari Renstra/PKPT/penilaian pegawai).
 */
function KmUmum({ d, meta }: { d: ArepData; meta: KmMeta }) {
    const land = meta.orientasi === 'landscape';
    const kolom = land
        ? ['No', 'Uraian', 'Keterangan', 'Waktu', 'Realisasi', 'Ref.']
        : ['No', 'Uraian', 'Keterangan', 'Ref.'];
    return (
        <>
            <KopKm d={d} kode={meta.kode} />
            <JudulKm>{meta.nama}</JudulKm>
            <div className="mt-3">
                {meta.autofill ? (
                    <>
                        <Baris label="Objek Penugasan" value={d.objek} />
                        <Baris label="Jenis Penugasan" value={d.jenis.nama ?? '-'} />
                        <Baris label="Nomor Surat Tugas" value={`${d.nomor.st} tanggal ${d.tanggal.st}`} />
                    </>
                ) : (
                    <>
                        <Baris label="Unit / Objek" value="" />
                        <Baris label="Tahun" value={String(d.rpp.tahun ?? '')} />
                    </>
                )}
            </div>
            <GridKosong kolom={kolom} baris={land ? 9 : 13} />
            <div className="mt-4 grid grid-cols-2 gap-4">
                <KotakTtd pra="Mengetahui/Menyetujui," jabatan={meta.autofill ? 'Pengendali Teknis' : 'Inspektur Kabupaten Aceh Barat'} nama={meta.autofill ? d.dalnis.nama : d.inspektur.nama} nip={meta.autofill ? d.dalnis.nip_spasi : d.inspektur.nip_spasi} />
                <KotakTtd pra="Disusun oleh," jabatan={meta.autofill ? 'Ketua Tim' : ''} nama={meta.autofill ? d.kt.nama : ''} nip={meta.autofill ? d.kt.nip_spasi : ''} />
            </div>
        </>
    );
}

/** Pilih komponen formulir menurut nomor. */
export function FormulirKm({ d, meta }: { d: ArepData; meta: KmMeta }) {
    switch (meta.no) {
        case 6:
            return <Km6 d={d} />;
        case 7:
            return <Km7 d={d} />;
        case 9:
            return <Km9 d={d} />;
        case 27:
            return <Km27 d={d} />;
        default:
            return <KmUmum d={d} meta={meta} />;
    }
}
