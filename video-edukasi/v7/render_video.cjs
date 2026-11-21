// Render animation.html -> MP4 tanpa suara, PARALEL.
//
// Animasi adalah fungsi murni dari waktu t, jadi rentang frame dibagi ke
// beberapa proses Chromium; potongan disambung tanpa kode ulang (concat).
//
//   node render_video.cjs [jumlah_proses=8] [mulai_detik] [akhir_detik] [keluaran.mp4]
//   (tanpa mulai/akhir = seluruh film -> video_noaudio.mp4)
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const FPS = 30;
const FFMPEG = 'C:/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/' +
  'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe';

async function pekerja(a, b, keluar) {
  const { chromium } = require(path.join(__dirname, '..', '..', 'node_modules', 'playwright'));
  const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'fast', '-g', '60', keluar], { stdio: ['pipe', 'ignore', 'ignore'] });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file:///' + path.join(__dirname, 'animation.html').split(path.sep).join('/'));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })))));
  await page.waitForTimeout(1500);
  for (let i = a; i < b; i++) {
    await page.evaluate((tt) => window.setVideoTime(tt), i / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if ((i - a) % 600 === 0) process.stdout.write(`[${path.basename(keluar)}] ${i - a}/${b - a}\n`);
  }
  await browser.close();
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
}

async function utama() {
  if (process.argv[2] === '--pekerja') {
    await pekerja(Number(process.argv[3]), Number(process.argv[4]), process.argv[5]);
    return;
  }
  require('./rakit.cjs').rakitHtml('film');
  const k = Number(process.argv[2] || 8);
  const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf-8'));
  const mulai = Math.round(Number(process.argv[3] || 0) * FPS);
  const akhir = Math.round(Number(process.argv[4] || tl.total_duration) * FPS);
  const hasil = process.argv[5] || path.join(__dirname, 'video_noaudio.mp4');
  const dirPot = path.join(__dirname, 'potongan');
  fs.rmSync(dirPot, { recursive: true, force: true });
  fs.mkdirSync(dirPot, { recursive: true });
  const t0 = Date.now();
  console.log(`frame ${mulai}-${akhir} (${akhir - mulai}), ${k} proses`);
  const tugas = [];
  for (let j = 0; j < k; j++) {
    const a = mulai + Math.floor(((akhir - mulai) * j) / k), b = mulai + Math.floor(((akhir - mulai) * (j + 1)) / k);
    const keluar = path.join(dirPot, `p${String(j).padStart(2, '0')}.mp4`);
    tugas.push(new Promise((res, rej) => {
      const c = spawn(process.execPath, [__filename, '--pekerja', String(a), String(b), keluar], { stdio: ['ignore', 'inherit', 'inherit'] });
      c.on('close', (code) => (code === 0 ? res(keluar) : rej(new Error(`pekerja ${j} keluar ${code}`))));
    }));
  }
  const pot = await Promise.all(tugas);
  const daftar = path.join(dirPot, 'daftar.txt');
  fs.writeFileSync(daftar, pot.map((p) => `file '${p.split(path.sep).join('/')}'`).join('\n'));
  await new Promise((res, rej) => {
    const c = spawn(FFMPEG, ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', daftar, '-c', 'copy', hasil], { stdio: 'inherit' });
    c.on('close', (code) => (code === 0 ? res() : rej(new Error('concat ' + code))));
  });
  console.log(`Selesai ${hasil} dalam ${((Date.now() - t0) / 60000).toFixed(1)} menit`);
}

utama().catch((e) => { console.error(e); process.exit(1); });
