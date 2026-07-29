"""
Sintesis audio non-suara (musik latar + sound effect) murni pakai numpy --
TANPA layanan musik berbayar (Suno/Udio dkk, di luar akses skrip ini).

MUSIK (v3 -- Corporate Ambient, Formal & Modern):
  Tempo 100 BPM (di tengah rentang 90-110 yg diminta) -> 1 ketuk 0.6s,
  1 bar 4/4 = 2.4s. Instrumen: warm pad (sine ber-detune, attack panjang),
  soft synth lead (sparse, attack lembut), dan petikan gitar akustik tipis
  yg disintesis pakai algoritma Karplus-Strong (delay-line + filter rata2 --
  model fisik senar dipetik, jadi terdengar seperti gitar sungguhan, bukan
  sine biasa). Ditambah bass halus & perkusi SANGAT ringan (shaker + rim).

  ANTI-MONOTON: musik dibagi 8 SECTION mengikuti struktur narasi (lihat
  SECTIONS di bawah) -- tiap section punya progresi akor & kombinasi
  layer berbeda, dgn crossfade halus 3 detik antar-section. Jadi musiknya
  berkembang (intro kalem -> berlapis -> puncak -> menyurut) alih2 loop
  4 akor yg sama selama 6.5 menit seperti versi sebelumnya.

  Karakter: profesional & tenang, TIDAK mengalihkan perhatian dari narasi
  (perkusi sengaja dibuat sangat pelan, tanpa kick/clap EDM).
"""
import json
import os
import wave

import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SR = 44100

BPM = 100.0
BEAT = 60.0 / BPM          # 0.6 detik
BAR = BEAT * 4             # 2.4 detik


def write_wav(path, samples, sr=SR):
    samples = np.clip(samples, -1.0, 1.0)
    pcm = (samples * 32767).astype(np.int16)
    with wave.open(path, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


def envelope_adsr(n, sr, attack=0.05, decay=0.1, sustain=0.7, release=0.3):
    a = int(attack * sr)
    d = int(decay * sr)
    r = int(release * sr)
    s = max(n - a - d - r, 0)
    env = np.concatenate([
        np.linspace(0, 1, a, endpoint=False) if a > 0 else np.array([]),
        np.linspace(1, sustain, d, endpoint=False) if d > 0 else np.array([]),
        np.full(s, sustain),
        np.linspace(sustain, 0, r) if r > 0 else np.array([]),
    ])
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


def tone(freq, duration, sr=SR, wave_type="sine", vol=0.3):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    if wave_type == "sine":
        s = np.sin(2 * np.pi * freq * t)
    elif wave_type == "triangle":
        s = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
    else:
        s = np.sin(2 * np.pi * freq * t)
    return s * vol


# ─────────────────────────── INSTRUMEN ───────────────────────────

def make_pad_chord(freqs, duration, sr=SR, vol=0.12):
    """Warm pad: tiap nada = 3 sine ber-detune halus + harmonik ke-2 lemah,
    attack & release panjang (nafas ambient)."""
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    mix = np.zeros(n)
    for f in freqs:
        for detune in (-0.5, 0.0, 0.5):
            mix += np.sin(2 * np.pi * (f + detune) * t)
        mix += 0.25 * np.sin(2 * np.pi * (f * 2) * t)   # harmonik oktaf, bikin "warm"
    mix /= (len(freqs) * 3.25)
    env = envelope_adsr(n, sr, attack=duration * 0.35, decay=duration * 0.1,
                        sustain=0.85, release=duration * 0.35)
    return mix * env * vol


_PLUCK_CACHE = {}


def make_guitar_pluck(freq, duration=1.2, sr=SR, vol=0.30):
    """
    Petikan gitar akustik tipis via Karplus-Strong: buffer noise sepanjang
    satu periode, dibaca berulang sambil di-lowpass (rata2 2 sample) tiap
    lewat -> harmonik tinggi meluruh lebih cepat dari fundamental, persis
    perilaku senar sungguhan. Hasil di-cache per-frekuensi krn loop-nya
    mahal & nada yg dipakai cuma belasan.
    """
    key = (round(freq, 2), round(duration, 2))
    if key in _PLUCK_CACHE:
        return _PLUCK_CACHE[key] * vol

    n = int(sr * duration)
    N = max(int(sr / freq), 2)
    buf = np.random.uniform(-1, 1, N)
    buf = np.convolve(buf, np.ones(5) / 5, mode="same")   # perlembut serangan (petikan jari, bukan pick keras)
    out = np.empty(n)
    decay = 0.995
    for i in range(n):
        idx = i % N
        out[i] = buf[idx]
        buf[idx] = decay * 0.5 * (buf[idx] + buf[(idx + 1) % N])

    env = np.exp(-np.linspace(0, 1, n) * 2.4)
    sample = out * env
    peak = np.max(np.abs(sample)) or 1.0
    sample = sample / peak
    _PLUCK_CACHE[key] = sample
    return sample * vol


def make_soft_lead(freq, duration, sr=SR, vol=0.14):
    """Soft synth lead: sine + triangle lembut, attack sedang, sedikit vibrato."""
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    vib = 1.0 + 0.003 * np.sin(2 * np.pi * 5.0 * t)
    sine = np.sin(2 * np.pi * freq * t * vib)
    tri = 2 * np.abs(2 * (t * freq - np.floor(t * freq + 0.5))) - 1
    mix = sine * 0.75 + tri * 0.25
    env = envelope_adsr(n, sr, attack=0.12, decay=0.15, sustain=0.6, release=duration * 0.4)
    return mix * env * vol


def make_bass_note(freq, duration, sr=SR, vol=0.20):
    """Bass halus: sine dominan + sedikit saw, dibuat bulat (bukan agresif)."""
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    sine = np.sin(2 * np.pi * freq * t)
    saw = 2 * (t * freq - np.floor(0.5 + t * freq))
    mix = sine * 0.85 + saw * 0.15
    env = envelope_adsr(n, sr, attack=0.02, decay=0.08, sustain=0.55, release=duration * 0.35)
    return mix * env * vol


def make_shaker(sr=SR, vol=0.05, duration=0.055):
    """Shaker sangat pelan -- noise highpass pendek. Sengaja lirih supaya
    'formal', bukan terasa track dance."""
    n = int(sr * duration)
    noise = np.random.uniform(-1, 1, n)
    hp = np.diff(noise, prepend=0.0)
    env = np.exp(-np.linspace(0, 1, n) * 18)
    return hp * env * vol


def make_rim(sr=SR, vol=0.055, duration=0.07):
    """Rim click lembut sbg penanda backbeat, jauh lebih halus dari snare."""
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    body = np.sin(2 * np.pi * 380 * t) * 0.6 + np.random.uniform(-1, 1, n) * 0.25
    env = np.exp(-t * 55)
    return body * env * vol


# ─────────────────────────── HARMONI ───────────────────────────

CHORDS = {
    "Cmaj7": [261.63, 329.63, 392.00, 493.88],   # C4 E4 G4 B4
    "Am7":   [220.00, 261.63, 329.63, 392.00],   # A3 C4 E4 G4
    "Fmaj7": [174.61, 220.00, 261.63, 329.63],   # F3 A3 C4 E4
    "G6":    [196.00, 246.94, 293.66, 329.63],   # G3 B3 D4 E4
    "Em7":   [164.81, 196.00, 246.94, 293.66],   # E3 G3 B3 D4
    "Dm7":   [146.83, 174.61, 220.00, 261.63],   # D3 F3 A3 C4
    "G7":    [196.00, 246.94, 293.66, 349.23],   # G3 B3 D4 F4
}
BASS_ROOT = {
    "Cmaj7": 130.81, "Am7": 110.00, "Fmaj7": 87.31, "G6": 98.00,
    "Em7": 82.41, "Dm7": 73.42, "G7": 98.00,
}

PROGRESSIONS = [
    ["Cmaj7", "Am7", "Fmaj7", "G6"],    # 0: hangat, netral (intro/outro)
    ["Fmaj7", "G6", "Em7", "Am7"],      # 1: sedikit bergerak (bagian penjelasan)
    ["Dm7", "G7", "Cmaj7", "Am7"],      # 2: ii-V-I, terasa "naik kelas" (bagian puncak)
]

# (start_detik, prog_index, gain tiap layer) -- batas waktunya sengaja
# disamakan dgn batas scene animasi supaya musik berganti nuansa TEPAT saat
# topik berganti, bukan asal berulang.
SECTIONS = [
    (0.0,   0, dict(pad=1.00, guitar=0.00, bass=0.00, perc=0.00, lead=0.00)),  # s1 pembuka: pad saja
    (20.1,  0, dict(pad=1.00, guitar=0.55, bass=0.30, perc=0.00, lead=0.00)),  # s2 konsep
    (49.7,  1, dict(pad=0.95, guitar=0.70, bass=0.45, perc=0.25, lead=0.00)),  # s3 regulasi
    (77.0,  1, dict(pad=0.90, guitar=0.75, bass=0.50, perc=0.35, lead=0.22)),  # s4 solusi
    (121.1, 2, dict(pad=0.90, guitar=0.80, bass=0.55, perc=0.45, lead=0.32)),  # s5 lima tahap: puncak
    (148.1, 1, dict(pad=0.95, guitar=0.65, bass=0.45, perc=0.35, lead=0.00)),  # s6-s8 uraian tahap
    (287.9, 2, dict(pad=0.90, guitar=0.75, bass=0.50, perc=0.40, lead=0.28)),  # s9-s10 perlakuan & pantau
    (359.3, 0, dict(pad=1.00, guitar=0.45, bass=0.20, perc=0.00, lead=0.00)),  # s11 penutup: menyurut
]

XFADE = 3.0  # detik crossfade gain antar-section


def _layer_gain_envelope(layer, total_sec, sr=SR):
    """
    Kurva gain sepanjang lagu utk satu layer: nilai datar per-section, dgn
    ramp linier XFADE detik tepat di tiap pergantian section.

    Ramp dibuat EKSPLISIT per-batas (O(n)), bukan dgn menghaluskan seluruh
    array pakai np.convolve -- konvolusi langsung dgn kernel 3 detik
    (132k sample) atas array 17 juta sample butuh ~10^12 operasi dan
    membuat generate musik seolah menggantung.
    """
    n = int(total_sec * sr)
    env = np.zeros(n)
    for i, (start, _prog, gains) in enumerate(SECTIONS):
        end = SECTIONS[i + 1][0] if i + 1 < len(SECTIONS) else total_sec
        s_idx = max(int(start * sr), 0)
        e_idx = min(int(end * sr), n)
        if s_idx >= n:
            break
        env[s_idx:e_idx] = gains[layer]

    half = int((XFADE / 2) * sr)
    for i in range(1, len(SECTIONS)):
        boundary = int(SECTIONS[i][0] * sr)
        a = max(boundary - half, 0)
        b = min(boundary + half, n)
        if b - a < 2:
            continue
        env[a:b] = np.linspace(env[a], env[b - 1], b - a)
    return env


def _prog_at(t_sec):
    prog = PROGRESSIONS[SECTIONS[0][1]]
    for start, prog_idx, _g in SECTIONS:
        if t_sec >= start:
            prog = PROGRESSIONS[prog_idx]
        else:
            break
    return prog


def generate_background_music(total_duration_sec, out_path):
    n_total = int(total_duration_sec * SR)
    pad_t = np.zeros(n_total)
    gtr_t = np.zeros(n_total)
    bass_t = np.zeros(n_total)
    perc_t = np.zeros(n_total)
    lead_t = np.zeros(n_total)

    shaker = make_shaker()
    rim = make_rim()

    def mix_at(track, sound, start_sample):
        if start_sample >= len(track):
            return
        end = min(start_sample + len(sound), len(track))
        track[start_sample:end] += sound[: end - start_sample]

    n_bars = int(np.ceil(total_duration_sec / BAR)) + 1
    for bar in range(n_bars):
        bar_start = bar * BAR
        if bar_start >= total_duration_sec:
            break
        prog = _prog_at(bar_start)
        chord_name = prog[bar % len(prog)]
        chord = CHORDS[chord_name]
        s0 = int(bar_start * SR)

        # PAD: satu akor menggantung sepanjang bar (+ sedikit overlap ke bar berikut)
        mix_at(pad_t, make_pad_chord(chord, BAR * 1.15), s0)

        # BASS: root di ketuk 1 & 3
        for b in (0, 2):
            mix_at(bass_t, make_bass_note(BASS_ROOT[chord_name], BEAT * 1.7),
                   int((bar_start + b * BEAT) * SR))

        # GITAR: fingerpicking 8th-note, arpeggio nada akor satu oktaf ke atas
        pattern = [0, 2, 1, 3, 0, 2, 3, 1]
        for j, tone_idx in enumerate(pattern):
            t_note = bar_start + j * (BEAT / 2)
            if t_note >= total_duration_sec:
                break
            f = chord[tone_idx] * 2.0
            # petikan ke-1 tiap ketuk sedikit lebih tegas (aksen alami)
            v = 0.30 if j % 2 == 0 else 0.20
            mix_at(gtr_t, make_guitar_pluck(f, 1.2, vol=v), int(t_note * SR))

        # PERKUSI: shaker tiap 8th, rim di ketuk 2 & 4 (backbeat lembut)
        for j in range(8):
            t_p = bar_start + j * (BEAT / 2)
            if t_p >= total_duration_sec:
                break
            mix_at(perc_t, shaker, int(t_p * SR))
        for b in (1, 3):
            mix_at(perc_t, rim, int((bar_start + b * BEAT) * SR))

        # LEAD: satu nada panjang tiap 2 bar (sparse, supaya tidak menyaingi narasi)
        if bar % 2 == 0:
            f_lead = chord[(bar // 2) % len(chord)] * 2.0
            mix_at(lead_t, make_soft_lead(f_lead, BAR * 1.5), int((bar_start + BEAT) * SR))

    full = (
        pad_t * _layer_gain_envelope("pad", total_duration_sec)
        + gtr_t * _layer_gain_envelope("guitar", total_duration_sec)
        + bass_t * _layer_gain_envelope("bass", total_duration_sec)
        + perc_t * _layer_gain_envelope("perc", total_duration_sec)
        + lead_t * _layer_gain_envelope("lead", total_duration_sec)
    )

    peak = np.max(np.abs(full))
    if peak > 0.95:
        full = full * (0.95 / peak)

    fade_n = int(3.0 * SR)
    full[-fade_n:] *= np.linspace(1, 0, fade_n)
    fade_in_n = int(2.5 * SR)
    full[:fade_in_n] *= np.linspace(0, 1, fade_in_n)

    write_wav(out_path, full)
    print(f"Musik Corporate Ambient ditulis: {out_path} "
          f"({total_duration_sec:.1f}s, {BPM:.0f} BPM, {len(SECTIONS)} section)")


# ─────────────────────────── SFX ───────────────────────────

def generate_alert_sfx(out_path):
    """'Jeng-jeng' alert pendek & playful, dua nada naik."""
    sr = SR
    note1 = tone(587.33, 0.12, vol=0.35, wave_type="triangle")
    note2 = tone(698.46, 0.18, vol=0.4, wave_type="triangle")
    gap = np.zeros(int(0.02 * sr))
    env1 = envelope_adsr(len(note1), sr, attack=0.01, decay=0.02, sustain=0.6, release=0.08)
    env2 = envelope_adsr(len(note2), sr, attack=0.01, decay=0.03, sustain=0.6, release=0.14)
    sfx = np.concatenate([note1 * env1, gap, note2 * env2])
    write_wav(out_path, sfx)
    print(f"SFX alert ditulis: {out_path}")


def generate_whoosh_sfx(out_path):
    """Whoosh transisi antar-scene lembut."""
    sr = SR
    duration = 0.5
    n = int(sr * duration)
    noise = np.random.uniform(-1, 1, n)
    kernel = np.ones(60) / 60
    filtered = np.convolve(noise, kernel, mode="same")
    env = envelope_adsr(n, sr, attack=0.15, decay=0.1, sustain=0.5, release=0.25)
    write_wav(out_path, filtered * env * 0.25)
    print(f"SFX whoosh ditulis: {out_path}")


def generate_success_chime_sfx(out_path):
    """Chime positif (arpeggio mayor naik C-E-G)."""
    sr = SR
    notes = []
    for f in (523.25, 659.25, 783.99):
        n_tone = tone(f, 0.14, vol=0.3, wave_type="sine")
        env = envelope_adsr(len(n_tone), sr, attack=0.005, decay=0.02, sustain=0.7, release=0.1)
        notes.append(n_tone * env)
        notes.append(np.zeros(int(0.015 * sr)))
    write_wav(out_path, np.concatenate(notes))
    print(f"SFX success chime ditulis: {out_path}")


def generate_warning_thud_sfx(out_path):
    """'Thud' rendah pendek utk momen ancaman/masalah nyata."""
    sr = SR
    duration = 0.25
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    low_tone = np.sin(2 * np.pi * 80 * t) * 0.5
    noise = np.random.uniform(-1, 1, n) * 0.1
    env = envelope_adsr(n, sr, attack=0.005, decay=0.05, sustain=0.3, release=0.15)
    write_wav(out_path, (low_tone + noise) * env)
    print(f"SFX warning thud ditulis: {out_path}")


def generate_click_sfx(out_path):
    """Klik digital pendek utk momen menyebut fitur/menu aplikasi."""
    sr = SR
    duration = 0.06
    n = int(sr * duration)
    t = np.linspace(0, duration, n, endpoint=False)
    env = envelope_adsr(n, sr, attack=0.002, decay=0.01, sustain=0.4, release=0.03)
    write_wav(out_path, np.sin(2 * np.pi * 1200 * t) * env * 0.3)
    print(f"SFX click ditulis: {out_path}")


def generate_page_turn_sfx(out_path):
    """'Page turn' utk transisi antar-Tahap."""
    sr = SR
    duration = 0.35
    n = int(sr * duration)
    noise = np.random.uniform(-1, 1, n)
    filtered = np.convolve(noise, np.ones(25) / 25, mode="same")
    t = np.linspace(0, duration, n, endpoint=False)
    sweep = np.sin(2 * np.pi * (300 + 900 * t / duration) * t) * 0.15
    env = envelope_adsr(n, sr, attack=0.05, decay=0.05, sustain=0.6, release=0.2)
    write_wav(out_path, (filtered * 0.5 + sweep) * env * 0.3)
    print(f"SFX page-turn ditulis: {out_path}")


def main():
    with open(os.path.join(SCRIPT_DIR, "timeline.json"), "r", encoding="utf-8") as f:
        timeline = json.load(f)
    total_duration = timeline["total_duration"] + 2.0

    generate_background_music(total_duration, os.path.join(SCRIPT_DIR, "music_bg.wav"))
    generate_alert_sfx(os.path.join(SCRIPT_DIR, "sfx_alert.wav"))
    generate_whoosh_sfx(os.path.join(SCRIPT_DIR, "sfx_whoosh.wav"))
    generate_success_chime_sfx(os.path.join(SCRIPT_DIR, "sfx_success.wav"))
    generate_warning_thud_sfx(os.path.join(SCRIPT_DIR, "sfx_warning.wav"))
    generate_click_sfx(os.path.join(SCRIPT_DIR, "sfx_click.wav"))
    generate_page_turn_sfx(os.path.join(SCRIPT_DIR, "sfx_pageturn.wav"))


if __name__ == "__main__":
    main()
