#!/usr/bin/env python3
"""Refresh the self-hosted Noto Sans KR subset after changing Korean catalogs."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
catalog = subprocess.check_output(['node', '-e', "process.stdout.write(['ko-ui','ko-story','ko-campaign'].flatMap(file=>Object.values(require('./src/locales/'+file+'.js'))).join(''))"], cwd=ROOT).decode()
characters = ''.join(sorted(set(catalog + ''.join(chr(n) for n in range(32, 127)))))
css_url = 'https://fonts.googleapis.com/css2?' + urllib.parse.urlencode({'family': 'Noto Sans KR:wght@400;600', 'display': 'swap', 'text': characters})
request = urllib.request.Request(css_url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
with urllib.request.urlopen(request, timeout=60) as response:
    css = response.read().decode()
urls = list(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)', css)))
if len(urls) != 1:
    raise RuntimeError('Expected one shared variable WOFF2 font for weights 400 and 600')
with urllib.request.urlopen(urls[0], timeout=60) as response:
    font = response.read()
if font[:4] != b'wOF2':
    raise RuntimeError('Expected WOFF2 data')
folder = ROOT / 'assets/fonts'
folder.mkdir(exist_ok=True)
(folder / 'noto-sans-kr.woff2').write_bytes(font)
manifest = {'family': 'Noto Sans KR', 'license': 'SIL Open Font License 1.1', 'catalogCharacters': characters, 'googleFontsCss': css_url, 'fonts': [{'file': 'noto-sans-kr.woff2', 'bytes': len(font), 'sha256': hashlib.sha256(font).hexdigest(), 'source': urls[0], 'weights': [400, 600]}]}
(folder / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Prepared {len(characters)} characters in {len(font)} bytes')
