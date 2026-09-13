// Render animation.html -> video_noaudio.mp4 (tanpa audio).
//
// Frame di-PIPE langsung ke ffmpeg, tidak ditulis dulu sebagai PNG ke disk:
// 17 menit @30fps = 31 ribu frame ~ 6 GB kalau disimpan. Piping juga
// menghilangkan satu putaran baca-tulis disk per frame.
//
// Waktu diambil dari window.setVideoTime(t) -- animasinya fungsi murni dari
// t, jadi hasilnya deterministik dan sinkron persis dengan timeline.json.
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { chromium } = require(path.join(__dirname, "..", "..", "node_modules", "playwright"));

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;
const FFMPEG = "C:/Users/Nurhikmat Muhammad/AppData/Local/Microsoft/WinGet/Packages/" +
  "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe";

function drain(stream) {
  return new Promise((res) => stream.once("drain", res));
}

async function main() {
  const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, "timeline.json"), "utf-8"));
  const total = timeline.total_duration;
  const nFrames = Math.ceil(total * FPS);
  const outPath = path.join(__dirname, "video_noaudio.mp4");

  console.log(`Durasi ${total.toFixed(1)}s -> ${nFrames} frame @ ${FPS}fps (${WIDTH}x${HEIGHT})`);

  // JPEG, bukan PNG. Encode PNG 1920x1080 di dalam Chromium makan ratusan ms
  // per frame -- pada 31 ribu frame itu selisih berjam-jam. Pada q=96 dan
  // gambar vektor rata seperti ini, kerugiannya tidak terlihat, apalagi
  // hasil akhirnya toh dikompres lagi oleh H.264.
  const ff = spawn(FFMPEG, [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
    outPath,
  ], { stdio: ["pipe", "ignore", "ignore"] });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.goto("file:///" + path.join(__dirname, "animation.html").replace(/\\/g, "/"));
  await page.waitForTimeout(600);

  const t0 = Date.now();
  const limit = process.env.FRAME_LIMIT ? Number(process.env.FRAME_LIMIT) : nFrames;
  for (let i = 0; i < limit; i++) {
    await page.evaluate((tt) => window.setVideoTime(tt), i / FPS);
    const buf = await page.screenshot({ type: "jpeg", quality: 96, optimizeForSpeed: true });
    if (!ff.stdin.write(buf)) await drain(ff.stdin);
    if (i % 500 === 0) {
      const el = (Date.now() - t0) / 1000;
      const eta = i ? (el / i) * (nFrames - i) : 0;
      console.log(`  ${i}/${nFrames} (t=${(i / FPS).toFixed(0)}s) ` +
        `berjalan ${(el / 60).toFixed(1)} mnt, sisa ~${(eta / 60).toFixed(1)} mnt`);
    }
  }

  await browser.close();
  ff.stdin.end();
  await new Promise((res, rej) => {
    ff.on("close", (code) => (code === 0 ? res() : rej(new Error("ffmpeg keluar " + code))));
  });
  console.log(`Selesai: ${outPath} (${((Date.now() - t0) / 60000).toFixed(1)} menit)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
