#!/usr/bin/env python3
"""PWA icons: pixel suitcase in front of a globe, palette colors only. Writes public/icon-192.png and icon-512.png."""
from PIL import Image, ImageDraw
import os
PAL = dict(night0=(0x0b,0x0f,0x1a), night2=(0x1f,0x2a,0x48), sea1=(0x1b,0x7f,0x8c), sea2=(0x35,0xb3,0xa9), grass1=(0x4f,0x8a,0x4b), dusk3=(0xc4,0x45,0x7a), dusk2=(0x8b,0x3a,0x7a), sun2=(0xf7,0xcf,0x6b), ink=(0x0a,0x0a,0x12), gray1=(0x6e,0x74,0x84), white=(0xf4,0xf1,0xea))
S = 32
im = Image.new('RGBA', (S, S), PAL['night0'] + (255,)); d = ImageDraw.Draw(im)
d.rounded_rectangle([0, 0, S-1, S-1], radius=6, fill=PAL['night2'])
d.ellipse([5, 3, 26, 24], fill=PAL['sea1'], outline=PAL['ink'])
for (x, y, w, h) in [(9, 7, 6, 5), (16, 6, 6, 4), (12, 13, 8, 6), (19, 15, 4, 5)]: d.rectangle([x, y, x+w, y+h], fill=PAL['grass1'])
for x in range(6, 26, 2): d.point((x, 9), fill=PAL['sea2'])
d.rectangle([9, 15, 22, 28], fill=PAL['dusk3'], outline=PAL['ink']); d.rectangle([11, 17, 20, 26], fill=PAL['dusk2'])
d.rectangle([13, 12, 18, 15], fill=PAL['gray1'], outline=PAL['ink']); d.rectangle([9, 20, 22, 22], fill=PAL['sun2'])
d.point((11, 29), fill=PAL['ink']); d.point((20, 29), fill=PAL['ink'])
os.makedirs('public', exist_ok=True)
for size in (192, 512): im.resize((size, size), Image.NEAREST).save(f'public/icon-{size}.png')
print('icons written')
