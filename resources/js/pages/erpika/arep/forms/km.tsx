/** Komponen 30 Formulir Kendali Mutu (KMA 1–30). Tiap komponen menerima data
 * ternormalisasi (ArepData) dan mengembalikan isi satu halaman formulir. */
import { Fragment } from 'react';
import { type ArepData } from '@/pages/erpika/arep/forms/bagian';
import { Baris, GridKosong, JudulKm, KopKm, KotakTtd, TtdDua } from '@/pages/erpika/arep/forms/km-bagian';

export interface KmMeta {
    no: number;
    kode: string;
    nama: string;
    tahapan: string;
    autofill: boolean;
    orientasi: string;
}

/** KM 6 — Kartu Penugasan. */
function Km6({ d }: { d: ArepData }) {
    return (
        <>
            <KopKm d={d} kode="KM 6" />
            <JudulKm sub={`NOMOR : ${d.nomor.kp ?? '-'}`}>Kartu Penugasan</JudulKm>
            <div className="mt-4 space-y-[2px]">
                <div className="flex gap-1">
                    <div className="w-[6mm]">1.</div>
                    <Baris label="Nama objek penugasan" value={d.objek} w="56mm" />
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">2.</div>
                    <Baris
                        label="Rencana Penugasan Nomor"
                        value={`${d.nomor.rpp ?? '-'}${d.rpp.tanggal_rpp ? ' tanggal ' + d.rpp.tanggal_rpp : ''}`}
                        w="56mm"
                    />
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">3.</div>
                    <Baris label="Sifat / Sasaran Penugasan" value={d.sifat || '-'} w="56mm" />
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">4.</div>
                    <Baris label="Laporan dikirim kepada" value={d.laporan_kepada} w="56mm" />
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">5.</div>
                    <div className="flex-1">
                        <Baris label="Wakil Penanggung Jawab" value={d.wpj.nama || '-'} w="50mm" />
                        <Baris label="Pengendali Teknis" value={d.dalnis.nama || '-'} w="50mm" />
                        <Baris label="Ketua Tim" value={d.kt.nama || '-'} w="50mm" />
                        <Baris
                            label="Anggota Tim"
                            value={d.anggota.map((a) => a.nama).filter(Boolean).join(', ') || '-'}
                            w="50mm"
                        />
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">6.</div>
                    <div className="flex-1">
                        <Baris label="Surat Tugas Nomor" value={d.nomor.st} w="50mm" />
                        <Baris label="Tanggal Surat Tugas" value={d.tanggal.st} w="50mm" />
                        <Baris label="Dimulai pada tanggal" value={d.jangka.mulai} w="50mm" />
                        <Baris label="Direncanakan selesai tanggal" value={d.jangka.selesai} w="50mm" />
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="w-[6mm]">7.</div>
                    <Baris label="Jumlah Laporan" value={String(d.jumlah_laporan)} w="56mm" />
                </div>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-2">
                <KotakTtd jabatan="Inspektur Kabupaten Aceh Barat" nama={d.inspektur.nama} nip={d.inspektur.nip_spasi} />
                <KotakTtd jabatan="Pengendali Teknis" nama={d.dalnis.nama} nip={d.dalnis.nip_spasi} />
                <KotakTtd
                    pra={`Meulaboh, ${d.tanggal.st}`}
                    jabatan="Wakil Penanggung Jawab"
                    nama={d.wpj.nama}
                    nip={d.wpj.nip_spasi}
                />
            </div>
        </>
    );
}

const KM7_TAHAP: [string, string, string[]][] = [
    ['I', 'PERSIAPAN PENUGASAN', ['Penyusunan rencana penugasan', 'Pembicaraan pendahuluan', 'Pengumpulan informasi umum', 'Penelaahan peraturan', 'Menyusun program kerja']],
    ['II', 'PELAKSANAAN PENUGASAN', ['Pengujian bukti/dokumen', 'Wawancara dan konfirmasi', 'Pemeriksaan fisik', 'Penyusunan kesimpulan']],
    ['III', 'PENYELESAIAN PENUGASAN', ['Pembahasan intern tim dan PPJ', 'Menyusun konsep laporan', 'Pembahasan konsep laporan']],
];

/** KM 7 — Anggaran Waktu Penugasan. */
function Km7({ d }: { d: ArepData }) {
    const grup = ['WPJ', 'Dalnis', 'Ketua Tim', 'Anggota', 'Jumlah'];
    return (
        <>
            <KopKm d={d} kode="KM 7" />
            <JudulKm>Anggaran Waktu Penugasan</JudulKm>
            <div className="mt-3">
                <Baris label="Nama Objek Penugasan" value={d.objek} />
                <Baris label="Nomor Kartu Penugasan" value={d.nomor.kp ?? '-'} />
            </div>
            <table className="mt-3 w-full border-collapse text-[9.5pt]">
                <thead className="text-center font-bold">
                    <tr>
                        <td className="border border-black px-1" rowSpan={2}>No</td>
                        <td className="border border-black px-1" rowSpan={2}>Tahapan Penugasan</td>
                        {grup.map((g) => (
                            <td key={g} className="border border-black px-1" colSpan={2}>
                                {g}
                            </td>
                        ))}
                    </tr>
                    <tr>
                        {grup.flatMap((g) => [
                            <td key={g + 'h'} className="border border-black px-1">HP</td>,
                            <td key={g + 'j'} className="border border-black px-1">Jam</td>,
                        ])}
                    </tr>
                </thead>
                <tbody>
                    {KM7_TAHAP.map(([rom, judul, items]) => (
                        <Fragment key={rom}>
                            <tr className="font-semibold">
                                <td className="border border-black px-1 text-center">{rom}</td>
                                <td className="border border-black px-1" colSpan={11}>{judul}</td>
                            </tr>
                            {items.map((it, i) => (
                                <tr key={rom + i}>
                                    <td className="border border-black px-1 text-center">{i + 1}</td>
                                    <td className="border border-black px-1">{it}</td>
                                    {Array.from({ length: 10 }).map((_, c) => (
                                        <td key={c} className="h-[18px] border border-black" />
                                    ))}
                                </tr>
                            ))}
                        </Fragment>
                    ))}
                </tbody>
            </table>
            <TtdDua
                tanggal={d.tanggal.st}
                kiriPra="Disetujui,"
                kiriJab="Wakil Penanggung Jawab"
                kiri={d.wpj}
                kananPra="Disusun,"
                kananJab="Ketua Tim"
                kanan={d.kt}
            />
        </>
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
