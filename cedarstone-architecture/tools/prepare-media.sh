#!/usr/bin/env bash
# Encode footage and photographs into exactly what the page expects.
#   ./tools/prepare-media.sh video  ~/raw/drone-night.mov  city
#   ./tools/prepare-media.sh video  ~/raw/walkthrough.mp4  house
#   ./tools/prepare-media.sh photo  ~/raw/westcliff-01.jpg work-westcliff
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
kind="${1:?video|photo}"; src="${2:?source file}"; name="${3:?output name}"

case "$kind" in
  video)
    mkdir -p "$here/assets/video"
    ffmpeg -y -i "$src" \
      -vf "scale=1920:-2,fps=30" \
      -c:v libx264 -profile:v high -crf 23 -preset slow \
      -g 10 -keyint_min 10 -sc_threshold 0 \
      -movflags +faststart -an \
      "$here/assets/video/$name.mp4"
    echo "→ assets/video/$name.mp4  ($(du -h "$here/assets/video/$name.mp4" | cut -f1))"
    ;;
  photo)
    mkdir -p "$here/assets/img"
    case "$name" in
      work-westcliff|work-rear) size=1600x900 ;;
      work-vault)               size=900x1200 ;;
      studio)                   size=1400x875 ;;
      still-site)               size=1920x1080 ;;
      *)                        size=1200x900 ;;
    esac
    w="${size%x*}"; h="${size#*x}"
    ffmpeg -y -i "$src" \
      -vf "scale=$w:$h:force_original_aspect_ratio=increase,crop=$w:$h" \
      -c:v libwebp -quality 82 \
      "$here/assets/img/$name.webp"
    echo "→ assets/img/$name.webp  ($size)"
    ;;
  *) echo "kind must be video or photo"; exit 1 ;;
esac
