#!/usr/bin/env bash
#
# Pull every remote asset into assets/media/ so the site can be self-hosted.
#
#   cd pupil-of-fate && ./scripts/fetch-media.sh
#
# Then set  POF.MEDIA_BASE = 'local'  in assets/js/media.js and the site
# serves entirely from your own domain — faster, cacheable, and immune to any
# CDN URL rotating.
#
# Images come down as the CDN's WebP derivative: same 1376x768 as the source
# PNG at about 2.5% of the bytes, so there is nothing to gain from the PNG.
#
# Videos are transcoded when ffmpeg is present. The originals are ~4.3 MB each
# at 6.8 Mbps, which is far more than a muted 5-second loop needs; the
# transcode brings them to roughly 400-700 KB with no visible loss at the size
# they are displayed. Without ffmpeg they are stored as-is.

set -euo pipefail

CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3EDDekfHCP3317iHZVCIF06BJvt"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/media"

# key|basename|ext
ASSETS=$(cat <<'EOF'
bugatti-chiron-pur-sport/exterior|hf_20260726_214207_a472a043-65fb-4a32-823d-b0e9fe60e099|png
ferrari-f40/exterior|hf_20260726_214209_95f3ece3-d454-4edc-8cef-c7e6c89846f5|png
ferrari-sf90-xx-stradale/exterior|hf_20260726_214211_226d0853-5a13-4b6b-8d35-58e67e3fce7b|png
lamborghini-revuelto/exterior|hf_20260726_214212_2244e0ed-dad9-4279-8468-29b56407a64c|png
mclaren-765lt-spider/exterior|hf_20260726_214308_2e09e496-9bfd-490f-b4be-b98c58c22b10|png
porsche-959-komfort/exterior|hf_20260726_214310_e2eb9ed0-1e72-471b-b543-c5f16fa14694|png
rolls-royce-cullinan-black-badge/exterior|hf_20260726_214312_7be3c92f-b8a2-452a-9e2c-e0bf34777a5e|png
porsche-911-gt3-rs-weissach/exterior|hf_20260726_214313_df36c27a-e219-4fa5-a431-dd95ccf21031|png
rolls-royce-phantom-coupe/exterior|hf_20260726_214400_7c453982-26cc-4a5e-a8e7-df3e3951269e|png
lamborghini-urus-se/exterior|hf_20260726_214402_ec65beac-b464-4621-a97c-7bde49a100d3|png
bentley-continental-gt-speed/exterior|hf_20260726_214403_6ba7ea2c-7d01-47ec-a337-7f822866aca0|png
mercedes-amg-g63/exterior|hf_20260726_214405_5dfcbc97-b009-4357-9ee2-0b297b6224da|png
bugatti-chiron-pur-sport/interior|hf_20260726_203241_67893a72-bb9a-45c3-bdb7-e3da0f5ecfba|png
ferrari-f40/interior|hf_20260726_203244_fb5b8ace-a4b4-492f-a516-eec1067ad60b|png
ferrari-sf90-xx-stradale/interior|hf_20260726_203247_611fb02b-a740-4f23-a299-c6372b9ee16e|png
lamborghini-revuelto/interior|hf_20260726_203248_dc6d9de4-a407-44ad-a917-5d13fb634f35|png
mclaren-765lt-spider/interior|hf_20260726_203455_841242b8-2e3a-4ea1-a133-243c750a8ee6|png
porsche-959-komfort/interior|hf_20260726_203457_708dc4f4-163f-4221-82b9-f62d1ec07df4|png
rolls-royce-cullinan-black-badge/interior|hf_20260726_203500_d7a21b96-33a5-491d-b5a9-654c8e8d32a1|png
rolls-royce-phantom-coupe/interior|hf_20260726_203502_44bedffa-a153-43f5-8082-0ff0ef83689c|png
porsche-911-gt3-rs-weissach/interior|hf_20260726_203717_1b218c9c-485c-4707-9842-7d8eefa4a3a2|png
lamborghini-urus-se/interior|hf_20260726_203719_8a7dd001-e24e-4973-b8e7-165201f0f9e4|png
bentley-continental-gt-speed/interior|hf_20260726_203722_826dc16a-a9a7-49fc-beb2-d7a691c8cbb0|png
mercedes-amg-g63/interior|hf_20260726_203724_cacfebf6-f51d-4502-bba8-1389cf2b5897|png
porsche-911-gt3-rs-weissach/motion|hf_20260726_214521_4944cab0-8808-4a92-b365-6e7c254fc437|mp4
ferrari-sf90-xx-stradale/motion|hf_20260726_214522_427b32c2-9d1d-4c6c-90d9-bd265293ded5|mp4
lamborghini-revuelto/motion|hf_20260726_214523_8473ddc0-2517-4b13-88fb-705b9709ca92|mp4
bugatti-chiron-pur-sport/motion|hf_20260726_214525_e00d555e-ade2-4f2c-8868-0fff2277cce2|mp4
ferrari-f40/motion|hf_20260726_214731_d4a26f2c-7fbb-44ee-a62b-9fe295acdb56|mp4
mclaren-765lt-spider/motion|hf_20260726_214733_5eb01e03-9e38-42da-b7e0-54030e84b8e3|mp4
lamborghini-urus-se/motion|hf_20260726_214734_d4dd1c89-bc69-46d2-a460-066b04eab755|mp4
rolls-royce-cullinan-black-badge/motion|hf_20260726_214735_6c6fbe57-3535-4f30-a2ed-8db37e0a48a4|mp4
porsche-959-komfort/motion|hf_20260726_215037_cb155750-91a5-4b8c-b5ad-4d521b63a6e1|mp4
mercedes-amg-g63/motion|hf_20260726_215039_0950ba60-251f-4ce1-ae78-975f0e9eb437|mp4
bentley-continental-gt-speed/motion|hf_20260726_215040_f5f3f328-4630-4f79-bdfa-6eeab1e2e924|mp4
brand/film|hf_20260726_215438_1308a1b1-032e-4c7a-959e-2a28b6cdf069|mp4
EOF
)

ok=0
fail=0

while IFS='|' read -r key base ext; do
  [ -z "$key" ] && continue
  dest="$OUT/$key"
  mkdir -p "$(dirname "$dest")"

  if [ "$ext" = "mp4" ]; then
    target="$dest.mp4"
  else
    target="$dest.webp"
  fi

  if [ -s "$target" ]; then
    echo "  skip  $key"
    ok=$((ok + 1))
    continue
  fi

  echo "  get   $key"
  if [ "$ext" = "mp4" ]; then
    if ! curl -fsSL "$CDN/$base.mp4" -o "$target.orig"; then
      fail=$((fail + 1)); continue
    fi
    if command -v ffmpeg >/dev/null 2>&1; then
      # 1280 wide, CRF 30, no audio track, faststart so it can begin playing
      # before the whole file has arrived.
      ffmpeg -loglevel error -y -i "$target.orig" \
        -vf "scale=1280:-2" -c:v libx264 -preset slow -crf 30 -an \
        -movflags +faststart "$target" && rm -f "$target.orig"
    else
      mv "$target.orig" "$target"
      echo "        (ffmpeg not installed — stored at full bitrate)"
    fi
    ok=$((ok + 1))
  else
    # Prefer the CDN's own WebP derivative; fall back to PNG + local convert.
    if curl -fsSL "$CDN/${base}_min.webp" -o "$target"; then
      ok=$((ok + 1))
    elif curl -fsSL "$CDN/$base.png" -o "$dest.png"; then
      if command -v cwebp >/dev/null 2>&1; then
        cwebp -quiet -q 86 "$dest.png" -o "$target" && rm -f "$dest.png"
      else
        mv "$dest.png" "$dest.webp"   # kept as PNG bytes under a .webp name
        echo "        (cwebp not installed — stored uncompressed)"
      fi
      ok=$((ok + 1))
    else
      fail=$((fail + 1))
    fi
  fi
done <<< "$ASSETS"

echo
echo "Done. $ok fetched, $fail failed."
echo "Now set  POF.MEDIA_BASE = 'local'  in assets/js/media.js"
