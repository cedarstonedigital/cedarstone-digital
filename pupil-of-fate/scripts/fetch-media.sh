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
# Requires: curl, and (optionally) cwebp from the `webp` package to convert
# the full-size PNGs. Without cwebp the PNGs are kept as-is.

set -euo pipefail

CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3EDDekfHCP3317iHZVCIF06BJvt"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/assets/media"

# key|basename|ext
ASSETS=$(cat <<'EOF'
bugatti-chiron-pur-sport/exterior|hf_20260726_202615_c67af167-2100-4a1d-a4b3-4f74841ff997|png
ferrari-f40/exterior|hf_20260726_202618_514b4992-cb5b-436d-9a0b-86c938174945|png
ferrari-sf90-xx-stradale/exterior|hf_20260726_202622_7bcc2e6b-4ef8-4e45-8317-1c892209f071|png
lamborghini-revuelto/exterior|hf_20260726_202624_af47ef6d-16a4-4302-9d47-98ea423100ec|png
mclaren-765lt-spider/exterior|hf_20260726_202705_01c103f4-2fc6-4f63-acf7-14f80dc348ef|png
porsche-959-komfort/exterior|hf_20260726_202707_acf01e02-ffc3-4876-abe8-d4006b49335d|png
rolls-royce-cullinan-black-badge/exterior|hf_20260726_202710_c36667a8-7e56-4720-94b4-004ae52ff570|png
porsche-911-gt3-rs-weissach/exterior|hf_20260726_202314_087c9525-e25a-423a-88de-71b4c465df20|png
rolls-royce-phantom-coupe/exterior|hf_20260726_203120_755517f0-762e-4cfc-8d9a-726e6b96f525|png
lamborghini-urus-se/exterior|hf_20260726_203123_67e31cb0-fb30-42a3-a732-6b6e855064e7|png
bentley-continental-gt-speed/exterior|hf_20260726_203127_965153d6-760d-4b9a-a3c6-1899a1bc403e|png
mercedes-amg-g63/exterior|hf_20260726_203128_f72abf5e-b312-4bda-bbd8-945fdb159f93|png
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
porsche-911-gt3-rs-weissach/motion|hf_20260726_203916_dfc4fc57-5b78-4899-80d0-d5e4140101be|mp4
ferrari-f40/motion|hf_20260726_203918_87f36c72-40f5-49d4-8325-ac65f55d8ff5|mp4
ferrari-sf90-xx-stradale/motion|hf_20260726_203919_0821f08e-7b13-41b6-9d68-010acb5097cf|mp4
lamborghini-revuelto/motion|hf_20260726_203921_8b5639d9-a2b7-4a90-add7-3bd2025237f1|mp4
bugatti-chiron-pur-sport/motion|hf_20260726_204036_d085654d-f583-45cc-911b-09134a33c98b|mp4
mclaren-765lt-spider/motion|hf_20260726_204307_ec195bfd-8aeb-4a47-b4a4-8a0335c2e870|mp4
porsche-959-komfort/motion|hf_20260726_204309_8f4055ed-147a-47b0-a931-32a6a6855edc|mp4
rolls-royce-cullinan-black-badge/motion|hf_20260726_204311_c3d6d16e-8794-446d-aa8f-1dd54dfd9445|mp4
rolls-royce-phantom-coupe/motion|hf_20260726_204313_0bd125d7-cb06-4064-9f9e-847486730cba|mp4
lamborghini-urus-se/motion|hf_20260726_204418_b6bd4c3b-87bd-46ea-b645-17c5cc75f729|mp4
bentley-continental-gt-speed/motion|hf_20260726_204603_3b1a2a13-6bb6-42b4-b382-681b9989a438|mp4
mercedes-amg-g63/motion|hf_20260726_204606_bff6ce0c-707b-4970-a75b-1961b9758b2a|mp4
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
    curl -fsSL "$CDN/$base.mp4" -o "$target" && ok=$((ok + 1)) || { fail=$((fail + 1)); continue; }
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
