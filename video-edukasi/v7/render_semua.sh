#!/usr/bin/env bash
# Render penuh v7 (terlepas dari sesi): video_noaudio.mp4 + log.
cd "/c/Users/Nurhikmat Muhammad/Herd/mrkabar/video-edukasi/v7" || exit 1
echo "mulai $(date)" > render_log.txt
node render_video.cjs 8 >> render_log.txt 2>&1
echo "selesai $(date) kode $?" >> render_log.txt
