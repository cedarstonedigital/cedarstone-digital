#!/usr/bin/env python3
"""Bundle the Ohana site into ONE self-contained file for an Artifact preview.

The Artifact CSP blocks every external host, so this:
  - downloads the Google Fonts (latin subset only) and inlines them as data URIs
  - inlines site.css and the three JS files
  - drops the Google Maps iframe (it would be blocked) and promotes the
    fallback panel that already exists behind it
  - strips <head>/<html>/<body> wrappers, which the Artifact adds itself
"""
import base64, re, subprocess, sys, pathlib

SRC = pathlib.Path('/home/user/cedarstone-digital/ohana-cafe')
OUT = pathlib.Path('/tmp/claude-0/-home-user-cedarstone-digital/9fb70c67-6e96-5535-abbf-23c7d1716622/scratchpad/ohana-preview.html')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')

def fetch(url, binary=False):
    r = subprocess.run(['curl', '-sSL', '--max-time', '60', '-A', UA, url],
                       capture_output=True)
    if r.returncode != 0:
        sys.exit(f'fetch failed {url}: {r.stderr[:200]}')
    return r.stdout if binary else r.stdout.decode('utf-8')

FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap',
]

def inline_fonts():
    out, total = [], 0
    for url in FONT_URLS:
        css = fetch(url)
        # Google emits  /* latin */  before each @font-face. Keep latin only:
        # the other subsets (cyrillic, greek, vietnamese) are dead weight here.
        for m in re.finditer(r'/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})', css):
            subset, block = m.group(1), m.group(2)
            if subset != 'latin':
                continue
            u = re.search(r"url\((https://[^)]+\.woff2)\)", block)
            if not u:
                continue
            data = fetch(u.group(1), binary=True)
            total += len(data)
            b64 = base64.b64encode(data).decode('ascii')
            block = block.replace(u.group(0),
                     f"url(data:font/woff2;base64,{b64}) format('woff2')")
            block = re.sub(r"\s*format\('woff2'\)\s*format\('woff2'\)", " format('woff2')", block)
            out.append(block)
    print(f'  embedded {len(out)} font faces, {total/1024:.0f} KB raw')
    return '\n'.join(out)

def main():
    html = (SRC / 'index.html').read_text(encoding='utf-8')
    css  = (SRC / 'assets/css/site.css').read_text(encoding='utf-8')
    js   = '\n'.join((SRC / f'assets/js/{f}').read_text(encoding='utf-8')
                     for f in ('media.js', 'ocean.js', 'site.js'))

    # Anchor on the real opening tag, not a regex for `<body...>`: the
    # PRE-LAUNCH GUARD comment in <head> contains the literal text "<body>",
    # which a loose pattern matches first and then drags the whole head —
    # including the Google Fonts <link> — into the output.
    open_tag = '<body id="top">'
    start = html.index(open_tag) + len(open_tag)
    body = html[start:html.rindex('</body>')]

    # The map iframe is blocked by the artifact CSP. Remove it and let the
    # fallback panel (address + "Open in Google Maps") be the real content.
    body = re.sub(r'<iframe\b.*?</iframe>', '', body, flags=re.S)
    body = body.replace('<div class="map-fallback" aria-hidden="true">',
                        '<div class="map-fallback">')

    # Body carried id="top"; the artifact's own <body> won't, so anchor it.
    body = '<div id="top"></div>\n' + body

    fonts = inline_fonts()

    doc = f"""<title>Ohana Beach Café | Seaside Cafe in Kalk Bay, Cape Town</title>
<style>
{fonts}
{css}
/* Artifact preview only: the real site has a live Google Map here. */
.map-frame{{ display:grid; place-content:center }}
</style>
{body}
<script>
{js}
</script>
"""
    OUT.write_text(doc, encoding='utf-8')
    print(f'  wrote {OUT}  ({len(doc.encode())/1024/1024:.2f} MB)')

if __name__ == '__main__':
    main()
