#!/usr/bin/env python3
"""Generates src/data/arcade_levels.json (Carry-On levels, 23 cols x 20 rows).
Levels are authored as platform lists and rendered to tiles; a BFS with the game's jump rules
(jump up <= 3 rows, horizontal reach <= 4 cols rising, <= 5 cols level/falling) verifies every stamp is reachable."""
import json
W,H=23,20
def render(plats, stamps, hazards, spikes, start, oneway=()):
    g=[['.']*W for _ in range(H)]
    for x in range(W): g[0][x]='#'; g[H-1][x]='#'
    for y in range(H): g[y][0]='#'; g[y][W-1]='#'
    for (x,y,n) in plats:
        for i in range(n): g[y][x+i]='#'
    for (x,y,n) in oneway:
        for i in range(n): g[y][x+i]='-'
    for (x,y) in spikes: g[y][x]='^'
    for (x,y) in stamps: assert g[y][x]=='.', ('stamp on solid',x,y); g[y][x]='*'
    for (x,y) in hazards: g[y][x]='H'
    g[start[1]][start[0]]='S'
    return [''.join(r) for r in g]
def check(t):
    solid=lambda x,y: 0<=x<W and 0<=y<H and t[y][x] in '#-'
    free=lambda x,y: 0<=x<W and 0<=y<H and t[y][x] not in '#^'
    stand=lambda x,y: free(x,y) and solid(x,y+1)
    sx,sy=[(x,y) for y in range(H) for x in range(W) if t[y][x]=='S'][0]
    from collections import deque
    seen={(sx,sy)}; q=deque([(sx,sy)])
    while q:
        x,y=q.popleft()
        for ny in range(H):
            reach = 4 if ny<y else 5
            for nx in range(x-reach,x+reach+1):
                if (nx,ny) in seen or not stand(nx,ny) or y-ny>3: continue
                apex=max(0,min(y,ny)-1)
                if not all(free(px,apex) or free(px,apex+1) for px in range(min(x,nx),max(x,nx)+1)): continue
                seen.add((nx,ny)); q.append((nx,ny))
    stamps=[(x,y) for y in range(H) for x in range(W) if t[y][x]=='*']
    got=[s for s in stamps if any(abs(s[0]-x)<=1 and 0<=y-s[1]<=3 for (x,y) in seen)]
    return got,stamps,seen
# floor is row 18 (y=18) => stand row 17. Platforms as (x, y, length); stamps sit one row above a platform.
def staircase_level(city,hazard,pal,par,plats,stamps,hazards,spikes,start,oneway=()):
    t=render(plats,stamps,hazards,spikes,start,oneway)
    got,st,seen=check(t)
    missing=[s for s in st if s not in got]
    return dict(city=city,hazard=hazard,palette=pal,tiles=t,stampPieces=len(st),parTime=par), missing
specs=[
 ('tokyo','otter',[0x141a2e,0x8b3a7a,0x3ef0c8],45,
   [(1,18,21),(4,15,3),(9,14,3),(14,15,3),(18,13,3),(13,11,3),(8,10,3),(3,9,3),(1,6,3),(6,5,3),(11,6,3),(16,7,3),(19,4,3)],
   [(5,14),(10,13),(15,14),(19,12),(14,10),(9,9),(4,8),(2,5),(7,4),(12,5),(17,6),(20,3)], [(11,9),(4,4)], [(8,17),(9,17),(16,17),(17,17)], (2,17)),
 ('innsbruck','rock',[0x2e3d66,0xf4f1ea,0xe8663d],50,
   [(1,18,21),(5,15,3),(10,16,2),(14,14,3),(19,12,3),(15,10,3),(10,9,3),(5,8,3),(1,5,3),(6,4,3),(11,3,3),(16,5,3),(20,8,2)],
   [(6,14),(15,13),(20,11),(16,9),(11,8),(6,7),(2,4),(7,3),(12,2),(17,4),(20,7),(10,15)], [(3,3),(13,7)], [(3,17),(4,17),(12,17),(13,17)], (1,17)),
 ('dakhla','gust',[0xf7cf6b,0xe0b98a,0x4a9bd6],45,
   [(1,18,21),(4,16,3),(9,15,3),(14,14,3),(18,12,3),(14,10,3),(9,10,3),(4,11,3),(1,8,3),(5,6,3),(10,6,3),(15,6,3),(19,4,3)],
   [(5,15),(10,14),(15,13),(19,11),(15,9),(10,9),(5,10),(2,7),(6,5),(11,5),(16,5),(20,3)], [(12,12),(7,3)], [(7,17),(8,17),(12,17),(13,17)], (2,17)),
 ('lisbon','tram',[0xf29e4c,0x35b3a9,0xf4f1ea],45,
   [(1,18,21),(3,15,4),(8,13,3),(13,15,3),(17,13,3),(19,10,3),(14,9,3),(9,8,3),(4,9,3),(1,6,3),(6,5,3),(11,4,3),(16,5,3)],
   [(4,14),(9,12),(14,14),(18,12),(20,9),(15,8),(10,7),(5,8),(2,5),(7,4),(12,3),(17,4)], [(11,12),(3,3)], [(6,17),(7,17),(11,17),(12,17),(20,17)], (1,17),
   [(21,8,1)]),
 ('bangkok','tuktuk',[0xd63c3c,0xf7cf6b,0x1f2a48],45,
   [(1,18,21),(3,16,3),(8,15,3),(13,16,3),(18,14,3),(14,12,3),(9,12,3),(4,13,3),(1,10,3),(5,8,3),(10,8,3),(15,8,3),(19,6,3),(14,4,3),(9,4,3),(4,4,3)],
   [(4,15),(9,14),(14,15),(19,13),(15,11),(10,11),(5,12),(2,9),(6,7),(11,7),(16,7),(20,5),(15,3),(10,3),(5,3)], [(12,10),(7,2)], [(6,17),(7,17),(16,17),(17,17)], (1,17)),
 ('hyeres','mosquito',[0x8cc46b,0x4a9bd6,0xfff2b0],45,
   [(1,18,21),(5,16,3),(10,15,3),(15,16,3),(19,13,3),(15,11,3),(10,11,3),(5,12,3),(1,9,3),(5,7,3),(10,7,3),(15,7,3),(19,4,3)],
   [(6,15),(11,14),(16,15),(20,12),(16,10),(11,10),(6,11),(2,8),(6,6),(11,6),(16,6),(20,3)], [(13,9),(8,4)], [(8,17),(9,17),(13,17),(14,17)], (2,17)),
 ('patagonia','gust',[0x0f4c5c,0x8fd3f4,0xf4f1ea],50,
   [(1,18,21),(4,16,3),(9,14,3),(14,15,3),(18,13,3),(15,10,3),(10,9,3),(5,10,3),(1,7,3),(5,5,3),(10,4,3),(15,5,3),(19,7,3)],
   [(5,15),(10,13),(15,14),(19,12),(16,9),(11,8),(6,9),(2,6),(6,4),(11,3),(16,4),(20,6)], [(12,12),(8,2)], [(7,17),(8,17),(12,17),(13,17)], (2,17)),
 ('miami','pigeon',[0xff6fa8,0x35b3a9,0xfff2b0],40,
   [(1,18,21),(4,16,3),(9,16,3),(14,16,3),(19,14,3),(15,12,3),(10,12,3),(5,12,3),(1,9,3),(6,8,3),(11,8,3),(16,8,3),(20,5,2)],
   [(5,15),(10,15),(15,15),(20,13),(16,11),(11,11),(6,11),(2,8),(7,7),(12,7),(17,7),(20,4)], [(12,5),(3,4)], [(7,17),(8,17),(17,17),(18,17)], (2,17)),
 ('kathmandu','yak',[0xe8663d,0xc4457a,0xf7cf6b],50,
   [(1,18,21),(5,16,3),(10,15,3),(15,14,3),(19,12,3),(15,10,3),(10,10,3),(5,11,3),(1,8,3),(5,6,3),(10,5,3),(15,6,3),(19,3,3)],
   [(6,15),(11,14),(16,13),(20,11),(16,9),(11,9),(6,10),(2,7),(6,5),(11,4),(16,5),(20,2)], [(13,8),(8,3)], [(8,17),(9,17),(13,17),(14,17)], (2,17)),
]
levels=[]; ok=True
for s in specs:
    lv,missing=staircase_level(*s); levels.append(lv)
    print(lv['city'], lv['stampPieces'], 'stamps', 'OK' if not missing else f'MISSING {missing}')
    ok = ok and not missing
assert ok
json.dump(levels, open('src/data/arcade_levels.json','w'), indent=1)
print('levels', len(levels))
