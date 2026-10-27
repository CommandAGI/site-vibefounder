#!/usr/bin/env bash
# Grades and compresses fal's originals into the site's media/: a seamless loop (the last second crossfades into the
# first), AV1 + H.264, 1280 wide, muted, with a JPEG poster of the loop's first frame; stills as AVIF + JPEG.
set -euo pipefail
F=${FFMPEG:-ffmpeg}; IN=$1; OUT=$2; mkdir -p "$OUT"
GRADE="eq=saturation=0.92:contrast=1.04:gamma_r=1.02:gamma_b=0.97,noise=alls=5:allf=t"
loop() { # id seconds
  local id=$1 T=$2
  local FC="[0:v]scale=1280:-2,fps=24,split[a][b];[a]trim=1:${T},setpts=PTS-STARTPTS,fps=24[m];[b]trim=0:1,setpts=PTS-STARTPTS,fps=24[h];[m][h]xfade=transition=fade:duration=1:offset=$(echo "$T-2" | bc),${GRADE}"
  $F -hide_banner -loglevel error -y -i "$IN/$id.mp4" -filter_complex "$FC" -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart "$OUT/$id.mp4"
  $F -hide_banner -loglevel error -y -i "$IN/$id.mp4" -filter_complex "$FC" -an -c:v libaom-av1 -crf 40 -b:v 0 -cpu-used 6 -row-mt 1 -pix_fmt yuv420p -movflags +faststart "$OUT/$id.av1.mp4"
  $F -hide_banner -loglevel error -y -i "$OUT/$id.mp4" -frames:v 1 -q:v 5 "$OUT/$id.jpg"
}
loop duet 10
loop sheet 5
$F -hide_banner -loglevel error -y -i "$IN/proof.png" -vf "scale=960:-2,eq=saturation=0.92:contrast=1.04" -q:v 5 "$OUT/proof.jpg"
$F -hide_banner -loglevel error -y -i "$IN/proof.png" -vf "scale=960:-2,eq=saturation=0.92:contrast=1.04" -c:v libaom-av1 -still-picture 1 -crf 32 "$OUT/proof.avif"
ls -la "$OUT"
