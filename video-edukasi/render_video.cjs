// Render animation.html jadi video MP4 (tanpa audio) via Playwright:
// screenshot per-frame pada framerate tetap, dipanggil lewat
// window.setVideoTime(t) supaya sinkron persis dgn timeline.json,
// lalu di-encode jadi mp4 pakai ffmpeg image2 pipe.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require(path.join(__dirname, "..", "node_modules", "playwright"));

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

async function main() {
  const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, "timeline.json"), "utf-8"));
  const totalDuration = timeline.total_duration + 2.0;
  const nFrames = Math.ceil(totalDuration * FPS);

  const framesDir = path.join(__dirname, "frames");
  fs.mkdirSync(framesDir, { recursive: true });

  const htmlUrl = "file:///" + path.join(__dirname, "animation.html").replace(/\\/g, "/");

  console.log(`Total durasi: ${totalDuration.toFixed(1)}s, ${nFrames} frame @ ${FPS}fps`);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.goto(htmlUrl);
  await page.waitForTimeout(300);

  for (let i = 0; i < nFrames; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.setVideoTime(tt), t);
    const framePath = path.join(framesDir, `frame_${String(i).padStart(6, "0")}.png`);
    await page.screenshot({ path: framePath });
    if (i % 200 === 0) console.log(`  frame ${i}/${nFrames} (t=${t.toFixed(1)}s)`);
  }

  await browser.close();
  console.log("Semua frame ditangkap. Encoding ke mp4...");

  const outPath = path.join(__dirname, "video_noaudio.mp4");
  execFileSync("ffmpeg", [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(framesDir, "frame_%06d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
    outPath,
  ], { stdio: "inherit" });

  console.log(`Video (tanpa audio) selesai: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
