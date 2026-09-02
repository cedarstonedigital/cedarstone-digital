#!/usr/bin/env bash
#
# Pull every photograph and film into assets/media/ so the site can be hosted
# entirely from your own domain.
#
#   cd luxe-dining && ./scripts/fetch-media.sh
#
# Then set  LUXE.MEDIA_BASE = 'local'  in assets/js/media.js and every <img>,
# <video> and background is rewritten to ./assets/media on load — faster,
# cacheable, and immune to any CDN URL changing.
#
# Photographs come down at 1600px wide (2000px for the wide ones), which is
# more than any layout here asks for. Films are transcoded to 1280px-wide H.264
# when ffmpeg is present: the source files are 4K and up to ~40 MB, far more
# than a muted background loop needs. Without ffmpeg they are stored as-is.
#
# Everything here is free to use under the Pexels licence: pexels.com/license

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/media"
IMG="https://images.pexels.com"
VID="https://videos.pexels.com"
mkdir -p "$OUT"

# key|path on images.pexels.com|width
PHOTOS=$(cat <<'EOF'
carpaccio|photos/20105550/pexels-photo-20105550/free-photo-of-close-up-of-carpaccio-dish.jpeg|1600
scallops|photos/3645126/pexels-photo-3645126.jpeg|1600
burrata|photos/3510248/pexels-photo-3510248.jpeg|1600
prawn|photos/38953823/pexels-photo-38953823/free-photo-of-fresh-mexican-shrimp-cocktail-with-avocado.jpeg|1600
bisque|photos/37800281/pexels-photo-37800281/free-photo-of-elegant-lobster-bisque-with-decorative-garnish.jpeg|1600
mushroom-soup|photos/5419030/pexels-photo-5419030.jpeg|1600
fillet|photos/7627443/pexels-photo-7627443.jpeg|2000
salmon|photos/33597317/pexels-photo-33597317/free-photo-of-grilled-salmon-in-basil-sauce-dish.jpeg|1600
lamb|photos/36691299/pexels-photo-36691299/free-photo-of-grilled-rack-of-lamb-with-assorted-spices.jpeg|1600
risotto|photos/6406460/pexels-photo-6406460.jpeg|1600
duck|photos/14459160/pexels-photo-14459160.jpeg|1600
fondant|photos/27819686/pexels-photo-27819686/free-photo-of-a-chocolate-pudding-with-ice-cream-on-top.jpeg|2000
brulee|photos/8753629/pexels-photo-8753629.jpeg|1600
lemon-tart|photos/28869120/pexels-photo-28869120/free-photo-of-delicious-lemon-meringue-tart-on-a-plate.jpeg|1600
cheese|photos/10560868/pexels-photo-10560868.jpeg|1600
mocktail|photos/8084639/pexels-photo-8084639.jpeg|1200
wine|photos/6449866/pexels-photo-6449866.jpeg|1600
espresso|photos/29085946/pexels-photo-29085946.png|1200
juice|photos/10277954/pexels-photo-10277954.jpeg|1200
interior|photos/941861/pexels-photo-941861.jpeg|2000
table|photos/8856579/pexels-photo-8856579.jpeg|2000
menu-table|photos/16548526/pexels-photo-16548526/free-photo-of-menu-cards-and-two-empty-wineglasses-on-a-wooden-table.jpeg|2000
food-lover|photos/28879287/pexels-photo-28879287/free-photo-of-elegant-dining-experience-with-fresh-oysters.jpeg|2000
diner|photos/10821318/pexels-photo-10821318.jpeg|2000
chef|photos/4253315/pexels-photo-4253315.jpeg|1600
chef-team|photos/36904788/pexels-photo-36904788/free-photo-of-chefs-preparing-gourmet-steak-dish-in-kitchen.jpeg|1600
EOF
)

# key|path on videos.pexels.com|poster path on images.pexels.com
FILMS=$(cat <<'EOF'
film-hall|video-files/857151/857151-hd_1920_746_30fps.mp4|videos/857151/free-video-857151.jpg
film-aerial|video-files/34344023/14549712_2560_1440_30fps.mp4|videos/34344023/pexels-photo-34344023.jpeg
film-steak|video-files/33461237/14237071_1920_1080_25fps.mp4|videos/33461237/pexels-photo-33461237.jpeg
film-plating|video-files/3209765/3209765-uhd_2560_1440_25fps.mp4|videos/3209765/free-video-3209765.jpg
film-wine|video-files/8922357/8922357-uhd_2732_1440_25fps.mp4|videos/8922357/administration-adult-bar-celebration-8922357.jpeg
film-fondant|video-files/37023533/15685922_1440_2560_60fps.mp4|videos/37023533/pexels-photo-37023533.jpeg
EOF
)

get() { curl -fsSL --retry 3 --retry-delay 2 -o "$1" "$2"; }

echo "→ photographs"
while IFS='|' read -r key path width; do
  [ -z "$key" ] && continue
  ext="${path##*.}"
  dest="$OUT/$key.$ext"
  if [ -s "$dest" ]; then echo "   · $key (already here)"; continue; fi
  echo "   · $key"
  get "$dest" "$IMG/$path?auto=compress&cs=tinysrgb&w=$width"
done <<< "$PHOTOS"

echo "→ films"
while IFS='|' read -r key path poster; do
  [ -z "$key" ] && continue
  pext="${poster##*.}"
  [ -s "$OUT/$key-poster.$pext" ] || get "$OUT/$key-poster.$pext" "$IMG/$poster?auto=compress&cs=tinysrgb&w=1600"

  dest="$OUT/$key.mp4"
  if [ -s "$dest" ]; then echo "   · $key (already here)"; continue; fi
  echo "   · $key"
  if command -v ffmpeg >/dev/null 2>&1; then
    tmp="$OUT/.$key.src.mp4"
    get "$tmp" "$VID/$path"
    ffmpeg -loglevel error -y -i "$tmp" \
      -vf "scale='min(1280,iw)':-2" -c:v libx264 -profile:v high -crf 26 -preset slow \
      -movflags +faststart -an "$dest"
    rm -f "$tmp"
  else
    get "$dest" "$VID/$path"
  fi
done <<< "$FILMS"

echo
echo "Done. $(ls -1 "$OUT" | wc -l) files in assets/media."
echo "Now set  LUXE.MEDIA_BASE = 'local'  in assets/js/media.js."
command -v ffmpeg >/dev/null 2>&1 || \
  echo "Note: ffmpeg was not found, so the films were stored at full size. Install it and delete assets/media/film-*.mp4 to re-run the transcode."
