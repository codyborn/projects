#!/usr/bin/env python3
"""Generates src/data/items.json: ~30 generic BUNDLES (no brands). Edit here, then: python3 tools/gen_items.py
Grid: checked 8x10 (50 lb), backpack 5x6 (25 lb). A sensible full kit fills ~70% of the checked grid; a heavy kit does not fit."""
import json, os
P = dict(night2=0x1f2a48, night3=0x2e3d66, dusk2=0x8b3a7a, dusk3=0xc4457a, sun0=0xe8663d, sun1=0xf29e4c, sun2=0xf7cf6b, sun3=0xfff2b0,
         sky0=0x2b6cb0, sky1=0x4a9bd6, sky2=0x8fd3f4, sea1=0x1b7f8c, sea2=0x35b3a9, sea3=0x9fe7d8, grass1=0x4f8a4b, grass2=0x8cc46b,
         earth1=0x6b4a32, earth2=0xa8794e, earth3=0xe0b98a, ink=0x0a0a12, gray0=0x3a3f4b, gray1=0x6e7484, gray2=0xb4b9c4, white=0xf4f1ea,
         red=0xd63c3c, neon=0x3ef0c8, pink=0xff6fa8)
# id, name, label, lb, w, h, tags, clothesDays, desc, real (from Cody's actual bag), color
B = [
 # ---- work + tech
 ('laptopkit',  'Laptop + Desk Kit',  'Laptop kit',   5.0, 3, 2, ['essential','work'],          0, 'The whole job, plus the stand and keyboard that keep the neck honest.', True,  'gray2'),
 ('phonekit',   'Phone + Chargers',   'Phone kit',    1.0, 2, 1, ['essential','camera'],        0, 'The camera, the map, the boarding pass, the plan. Never in the checked bag.', True, 'ink'),
 ('tablet',     'Tablet',             'Tablet',       1.2, 2, 2, ['work','luxury'],             0, 'Second monitor, e-reader, journal, cinema.', True, 'gray0'),
 ('watch',      'GPS Watch',          'GPS watch',    0.3, 1, 1, ['essential'],                 0, 'Counts every step, judges every rest day.', True, 'night3'),
 ('dronekit',   'Drone Kit',          'Drone kit',    4.0, 3, 2, ['camera','luxury'],           0, 'The camera the year gets remembered by, its controller, and the spare batteries.', True, 'gray1'),
 # ---- clothing
 ('clothes1',   '1 Week Of Clothes',  'Clothes wk 1', 6.0, 3, 3, ['clothing'],                  7, 'Seven days of looking like a person.', True, 'sky1'),
 ('clothes2',   '1 Week Of Clothes',  'Clothes wk 2', 6.0, 3, 3, ['clothing'],                  7, 'A second week. Laundry becomes a choice instead of an emergency.', True, 'sky0'),
 ('clothes3',   '1 Week Of Clothes',  'Clothes wk 3', 6.0, 3, 3, ['clothing'],                  7, 'A third week. The bag has noticed.', False, 'night3'),
 ('shell',      'Rain Shell',         'Rain shell',   0.9, 2, 2, ['rain','clothing'],           0, 'Lighter than an umbrella and it never inverts.', True, 'sun0'),
 ('downjacket', 'Down Jacket',        'Down jacket',  1.0, 2, 2, ['cold','clothing'],           0, 'Stuffs into its own pocket. Saves October in the Alps.', False, 'sun1'),
 ('hikingboots','Hiking Boots',       'Hiking boots', 3.0, 3, 2, ['hike','cold'],               0, 'Ankles for the Himalaya. Dead weight everywhere else.', False, 'earth1'),
 ('swimkit',    'Swim Kit',           'Swim kit',     0.6, 2, 1, ['swim'],                      0, 'Trunks, towel, goggles. Every coast, and the hotel pool you did not know about.', True, 'sea2'),
 ('sunkit',     'Hat + Sunglasses',   'Sun kit',      0.5, 2, 1, ['clothing'],                  0, 'A brimmed hat and armless sunglasses. Dignity optional.', True, 'earth3'),
 # ---- health
 ('protein',    'Protein Powder',     'Protein',      3.0, 2, 2, ['health'],                    0, 'Casein, greens, collagen, electrolytes. All the powders, one tub of resolve.', True, 'white'),
 ('supplements','Supplements',        'Supplements',  1.5, 2, 1, ['health'],                    0, 'The pills that keep the body the same across eleven diets.', True, 'sun2'),
 ('skincare',   'Skincare',           'Skincare',     1.0, 2, 1, ['health'],                    0, 'The routine that survives a hostel sink.', True, 'sky2'),
 ('toiletries', 'Toiletries',         'Toiletries',   1.5, 2, 2, ['essential'],                 0, 'Toothbrush, trimmer, the things hotels pretend to provide.', True, 'gray2'),
 ('sleepkit',   'Sleep Kit',          'Sleep kit',    2.0, 2, 2, ['sleep','health'],            0, 'Mask, earplugs, a compressed pillow, a sun lamp for the mornings the sun forgets.', True, 'dusk2'),
 ('firstaid',   'First Aid Kit',      'First aid',    0.8, 2, 1, ['firstaid'],                  0, 'Bandages, antiseptic, blister pads. Clean the cut. Every time.', False, 'red'),
 ('medkit',     'Medicine Kit',       'Medicine',     0.6, 2, 1, ['meds','health'],             0, 'Antibiotics, probiotics, altitude pills. Prescribed before leaving; the road does not care about your plans.', False, 'white'),
 ('mosquitokit','Mosquito Kit',       'Mosquito kit', 0.6, 2, 1, ['repellent'],                 0, 'Repellent and a travel net. The south of France has questions.', False, 'grass1'),
 # ---- adventure + fitness
 ('coffeekit',  'Coffee Kit',         'Coffee kit',   2.5, 2, 3, ['coffee'],                    0, 'Hand grinder, folding dripper, gooseneck kettle. Good coffee no matter what.', True, 'earth2'),
 ('adventure',  'Adventure Gear',     'Adventure',    5.0, 3, 3, ['hike','water','light','knife'], 0, 'Water bladder with the filter plumbed in, ice cleats, gloves, a headlamp, the knife from Patagonia.', True, 'grass2'),
 ('climbkit',   'Climbing Kit',       'Climbing kit', 2.5, 2, 2, ['climb','fitness'],           0, 'Shoes and chalk for the gym, a harness and lanyard for the ferrata.', True, 'sun0'),
 ('fitnesskit', 'Fitness Kit',        'Fitness kit',  2.0, 2, 2, ['fitness'],                   0, 'Bands and a collapsible foam roller. Hotel rooms become gyms.', True, 'neon'),
 ('yogamat',    'Yoga Mat',           'Yoga mat',     2.0, 1, 5, ['fitness'],                   0, 'Thin as a tortilla. Better than a carpet.', False, 'dusk3'),
 ('kitegear',   'Kite Gear',          'Kite gear',   12.0, 4, 3, ['kite','luxury'],             0, 'Twelve pounds. Turns every wind day into the best day of the month.', False, 'sky1'),
 # ---- fun, comfort, traps
 ('switch',     'Handheld Console',   'Console',      0.9, 2, 1, ['switch','luxury'],           0, 'The game within the game. Rest days get a level per city.', False, 'red'),
 ('ereader',    'E-Reader',           'E-reader',     0.4, 2, 1, ['luxury'],                    0, 'A thousand books and one cable you will lose.', False, 'gray0'),
 ('packingcubes','Packing Cubes',     'Cubes',        0.8, 2, 2, ['organizer'],                 0, 'Nothing gets left behind when everything has a place.', False, 'sea3'),
 ('hostgifts',  'Host Gifts',         'Host gifts',   2.0, 2, 2, ['luxury'],                    0, 'Small, local, edible. Reviews get warmer.', False, 'pink'),
 ('umbrella',   'Umbrella',           'Umbrella',     0.8, 1, 3, ['rain'],                      0, 'Inverts in Patagonia. Fine in Lisbon.', False, 'night3'),
 ('travelkettle','Travel Kettle',     'Kettle',       1.1, 2, 2, ['kettle','trap'],             0, 'Tea in every room. Also, one day, a second-degree burn.', True, 'red'),
 ('jeans2',     'Second Pair Of Jeans','Jeans #2',    2.0, 2, 2, ['clothing','trap'],           1, 'You will not wear these. You know you will not wear these.', False, 'sky0'),
 ('books',      'Books',              'Books',        5.0, 2, 2, ['luxury','trap'],             0, 'Five paperbacks. The e-reader exists. You know it exists.', False, 'earth2'),
]
out=[]
for (i,n,l,lb,w,h,tags,cd,d,real,col) in B:
    o=dict(id=i,name=n,label=l,weightLb=lb,w=w,h=h,tags=tags,desc=d,real=real,color=P[col])
    if cd: o['clothesDays']=cd
    out.append(o)
ids=[o['id'] for o in out]; assert len(ids)==len(set(ids))
tags=set(t for o in out for t in o['tags'])
need={'essential','work','clothing','health','fitness','sleep','coffee','rain','cold','swim','kite','climb','firstaid','meds','repellent','switch','kettle','camera','organizer','luxury','trap','water','light','knife','hike'}
assert need <= tags, need - tags
print('bundles', len(out), 'real', sum(1 for o in out if o['real']), 'total real weight', round(sum(o['weightLb'] for o in out if o['real']),1), 'lb')
os.makedirs('src/data',exist_ok=True)
json.dump(out, open('src/data/items.json','w'), indent=1, ensure_ascii=False)
