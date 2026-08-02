"""Penulis berkas MIDI standar (SMF format 1) seadanya — tanpa pustaka luar.

Dipakai musik.py untuk menuliskan not, yang lalu dibunyikan FluidSynth memakai
soundfont berisi REKAMAN instrumen sungguhan. Jadi nada-nadanya ditulis di sini,
warna bunyinya datang dari rekaman, bukan dari osilator.

Cukup menulis: pemilihan instrumen (program change), not on/off, kecepatan
tekan (velocity), dan tempo. Tidak ada pitch bend, tidak ada controller —
memang tidak diperlukan untuk musik latar.
"""
import struct


def _var(n: int) -> bytes:
    """Bilangan panjang-berubah (variable-length quantity) khas MIDI."""
    out = bytearray([n & 0x7F])
    n >>= 7
    while n:
        out.insert(0, (n & 0x7F) | 0x80)
        n >>= 7
    return bytes(out)


class Trek:
    """Satu trek MIDI. Waktu dicatat dalam tick absolut lalu diurutkan."""

    def __init__(self, kanal: int, program: int, nama: str = ''):
        self.kanal = kanal
        self.program = program
        self.nama = nama
        self.peristiwa: list[tuple[int, int, bytes]] = []  # (tick, prioritas, data)

    def _tambah(self, tick: int, prioritas: int, data: bytes) -> None:
        self.peristiwa.append((max(0, tick), prioritas, data))

    def not_(self, tick: int, panjang: int, nada: int, keras: int = 80) -> None:
        if nada < 0 or nada > 127 or panjang <= 0:
            return
        keras = max(1, min(127, int(keras)))
        # Note-off diberi prioritas lebih dulu pada tick yang sama, supaya not
        # berulang pada nada sama tidak saling memotong.
        self._tambah(tick + panjang, 0, bytes([0x80 | self.kanal, nada, 0]))
        self._tambah(tick, 1, bytes([0x90 | self.kanal, nada, keras]))

    def akor(self, tick: int, panjang: int, nada: list[int], keras: int = 80) -> None:
        for n in nada:
            self.not_(tick, panjang, n, keras)

    def rakit(self) -> bytes:
        awal = []
        if self.nama:
            n = self.nama.encode('ascii', 'replace')
            awal.append((0, 2, b'\xff\x03' + _var(len(n)) + n))
        # Kanal 9 adalah perkusi pada General MIDI; program change di sana tidak
        # memilih instrumen melainkan set drum, jadi dilewati saja.
        if self.kanal != 9:
            awal.append((0, 2, bytes([0xC0 | self.kanal, self.program])))

        semua = sorted(awal + self.peristiwa, key=lambda e: (e[0], e[1]))
        keluar = bytearray()
        lalu = 0
        for tick, _, data in semua:
            keluar += _var(tick - lalu) + data
            lalu = tick
        keluar += _var(0) + b'\xff\x2f\x00'
        return b'MTrk' + struct.pack('>I', len(keluar)) + bytes(keluar)


def tulis(path: str, trek: list[Trek], bpm: float, tpq: int = 480) -> None:
    """Tulis seluruh trek ke satu berkas .mid."""
    tempo = int(round(60_000_000 / bpm))
    kepala = bytearray()
    kepala += _var(0) + b'\xff\x51\x03' + tempo.to_bytes(3, 'big')
    kepala += _var(0) + b'\xff\x2f\x00'
    trek_tempo = b'MTrk' + struct.pack('>I', len(kepala)) + bytes(kepala)

    isi = trek_tempo + b''.join(t.rakit() for t in trek)
    with open(path, 'wb') as f:
        f.write(b'MThd' + struct.pack('>IHHH', 6, 1, len(trek) + 1, tpq))
        f.write(isi)
