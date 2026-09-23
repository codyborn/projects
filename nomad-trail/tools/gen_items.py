#!/usr/bin/env python3
"""Generates src/data/items.json. Edit here, then: python3 tools/gen_items.py"""
import json, os
P = dict(night2=0x1f2a48, night3=0x2e3d66, dusk2=0x8b3a7a, dusk3=0xc4457a, sun0=0xe8663d, sun1=0xf29e4c, sun2=0xf7cf6b, sun3=0xfff2b0,
         sky0=0x2b6cb0, sky1=0x4a9bd6, sky2=0x8fd3f4, sea1=0x1b7f8c, sea2=0x35b3a9, sea3=0x9fe7d8, grass1=0x4f8a4b, grass2=0x8cc46b,
         earth1=0x6b4a32, earth2=0xa8794e, earth3=0xe0b98a, ink=0x0a0a12, gray0=0x3a3f4b, gray1=0x6e7484, gray2=0xb4b9c4, white=0xf4f1ea,
         red=0xd63c3c, neon=0x3ef0c8, pink=0xff6fa8)
A = 'https://www.amazon.com/dp/'
# id, name, label, lb, w, h, tags, clothesDays, desc, real, color, link
R = [
 # Carry / tech
 ('macbook','Apple MacBook Pro 14"','MacBook 14"',3.4,4,3,['essential','work'],0,'Daily driver. The whole job fits in here.',True,'gray2',None),
 ('pixel10','Google Pixel 10','Pixel 10',0.5,1,2,['essential','camera'],0,'Primary camera. Also, technically, a phone.',True,'ink',A+'B0GYJ4DK31'),
 ('magickeyboard','Apple Magic Keyboard','Keyboard',0.5,3,1,['work'],0,'Because laptop keyboards are for emergencies.',True,'white',A+'B016QO64FI'),
 ('laptopstand','UGREEN laptop stand','Laptop stand',1.2,2,2,['work'],0,'Eye level. Your neck will thank you in a decade.',True,'gray1',A+'B07CG71KQ1'),
 ('osprey55','Osprey Farpoint Trek 55','Osprey 55',3.9,4,5,['hike','luxury'],0,"Technically over carry-on size but I've never had any issues.",True,'night3',A+'B0FGXYLC75'),
 ('fenix7','Garmin Fenix 7','Fenix 7',0.2,1,1,['fitness','essential'],0,'Counts every step, judges every rest day.',True,'ink',None),
 ('djirc','DJI RC-N3 controller','DJI controller',0.9,2,2,['camera'],0,'Useless without the drone. Pack both or neither.',True,'gray2',None),
 ('djimini5','DJI Mini 5 Pro','DJI Mini 5',0.6,3,2,['camera','luxury'],0,'The camera the year is going to be remembered by.',True,'gray1',A+'B0F6XJ7W9M'),
 ('galaxytab','Samsung Galaxy Tab S11','Galaxy Tab',1.1,3,2,['work','luxury'],0,'Second monitor, e-books, journaling, Netflix.',True,'gray0',A+'B0FGKQK3J2'),
 ('sonyxm4','Sony WH-1000XM4','Sony XM4',0.6,2,2,['work','sleep'],0,'Overnight bus insurance.',True,'ink',A+'B0863TXGM3'),
 ('airpods','AirPods Pro 2','AirPods',0.1,1,1,['work'],0,'For when the big ones are too big.',True,'white',A+'B0BDHWDR12'),
 ('thulesling','Thule Aion sling','Thule sling',1.0,2,2,['organizer'],0,'The day bag inside the bag.',True,'earth2',A+'B09NLB55Z5'),
 ('anker','Anker MagGo power bank','Power bank',0.3,1,1,['essential'],0,'5,000 mAh of not-being-stranded.',True,'ink',A+'B099284SRR'),
 ('tripod','Magnetic phone tripod','Mini tripod',0.3,1,2,['camera'],0,'Folds to nothing. Hooks onto anything.',True,'gray0',A+'B0DZG8WH4N'),
 ('garmincable','Garmin charging cable','Garmin cable',0.1,1,1,['essential'],0,'Proprietary. Forget it once and the watch becomes jewelry.',True,'gray1',A+'B0DDY7YZHJ'),
 ('euadapter','US to EU plug adapters','EU adapters',0.1,1,1,['essential'],0,'Slots directly into the MacBook adapter.',True,'white',A+'B07QLVDJ1P'),
 ('trackpad','Apple Magic Trackpad','Trackpad',0.5,2,2,['work'],0,'Desk in a box, part three.',True,'gray0',A+'B07BRF3ZQD'),
 ('carpio','DELTAHUB Carpio 2.0 wrist rest','Wrist rest',0.2,1,1,['work'],0,'Glides with the wrist. Tiny, and the wrist notices.',True,'ink',A+'B098P8C3BT'),
 # Clothing
 ('ombraz','Ombraz Classic Polarized','Ombraz',0.1,1,1,['clothing'],0,'Armless sunglasses. Great for action sports.',True,'ink','https://ombraz.com/products/classic-ombraz-armless-sunglasses'),
 ('rayban','Ray-Ban folding Wayfarer','Ray-Bans',0.1,1,1,['clothing','luxury'],0,'Fits in your pocket.',True,'ink',None),
 ('reishell','REI rain shell','Rain shell',0.8,2,3,['clothing','rain'],1,'Gore-Tex, lighter than an umbrella.',True,'sun0',None),
 ('gaiter','Decathlon neck gaiter','Neck gaiter',0.1,1,1,['clothing','cold'],0,'Sun, sand, face mask, pillow in a pinch.',True,'grass1',None),
 ('boonie','Surf Monkey boonie hat','Boonie hat',0.2,2,1,['clothing'],0,'The hat that says you have given up on looking cool. Correctly.',True,'earth3',None),
 ('melin','Melin A-Game Infinite Thermal','Melin cap',0.2,2,1,['clothing'],0,'The cap for days with a mirror.',True,'night3',None),
 ('altra','Altra Lone Peak 9+','Altra shoes',1.4,3,2,['clothing','hike','fitness'],0,'Wide toe box, zero drop. Trail and city.',True,'ink',A+'B0DTR5X3MN'),
 ('reef','Reef Leather Smoothy flip flops','Flip flops',0.8,2,2,['clothing','swim'],0,'Lightweight sandals. Hostel-shower-grade.',True,'earth2',A+'B000KS500W'),
 # Mountain / activity
 ('gloves','Decathlon gloves','Gloves',0.2,1,1,['climb','kite','cold'],0,'Grip + sun protection. Ferrata and kite.',True,'gray0',None),
 ('bladder','Osprey Hydraulics 2.5L reservoir','2.5L bladder',0.5,2,3,['water','hike'],0,'The tank.',True,'sky0',None),
 ('sawyer','Sawyer Mini water filter','Sawyer Mini',0.1,1,1,['water','health'],0,'Inlined into the bladder. Filtering is not a separate step.',True,'sky1',A+'B00FA2RLX2'),
 ('yaktrax','Yaktrax traction cleats','Yaktrax',0.6,2,1,['hike','cold'],0,'For snow + ice.',True,'gray1',A+'B0094GO9DA'),
 ('bands','Resistance loop bands','Bands',0.4,1,1,['fitness'],0,'Hotel room workouts.',True,'red',A+'B0D25Y125B'),
 ('nebo','Nebo Mycro 250 light','Keychain light',0.1,1,1,['light'],0,'Attaches to backpack or hats.',True,'sun2',A+'B0DDYHGL24'),
 ('knife','Pocket knife','Pocket knife',0.3,1,1,['knife'],0,'Picked up in Patagonia. Do not put in the backpack for a flight.',True,'earth3',None),
 ('foamroller','Collapsible foam roller','Foam roller',1.0,1,4,['fitness','health'],0,'Great after long travel days.',True,'ink',A+'B07GXYFG88'),
 ('climbshoes','La Sportiva Tarantula Boulder','Climbing shoes',1.4,2,2,['climb','fitness'],0,'Added for the Innsbruck gym sessions.',True,'sun1',None),
 ('chalk','Mammut liquid chalk','Liquid chalk',0.5,1,1,['climb'],0,'No chalk dust in the bag, gym-friendly.',True,'white',A+'B08P2TXY7V'),
 # Supplements
 ('multi','Two-Per-Day multivitamin','Multivitamin',0.4,1,1,['health','meds'],0,'The boring one that works.',True,'sun2',A+'B01IROPPR8'),
 ('creatine','Creatine monohydrate','Creatine',1.1,1,2,['health','fitness'],0,'Five grams, every day, forever.',True,'white',A+'B00GL2HMES'),
 ('casein','Micellar casein protein','Casein',2.2,2,2,['health','fitness'],0,'Slow release protein.',True,'earth3',A+'B0128VQT7Q'),
 ('greens','Super greens powder','Greens',0.8,1,2,['health'],0,'Vegetables, in the sense that a fax is a letter.',True,'grass2',A+'B0038B3AAK'),
 ('collagen','Collagen peptides','Collagen',0.9,1,2,['health'],0,'For the joints that carry the bag.',True,'sky2',A+'B09RQBHRCT'),
 ('electrolytes','Electrolyte complex','Electrolytes',0.7,1,1,['health','water'],0,'Altitude, heat, and the day after Oktoberfest.',True,'sun1',A+'B0D6JFYVHW'),
 ('nze','NZE caffeine pouches','NZE pouches',0.1,1,1,['coffee','luxury'],0,'Coffee without the kettle.',True,'sea2',A+'B0DHLSDS91'),
 ('calmag','Calcium + magnesium','Cal + mag',0.6,1,1,['health','sleep'],0,'Sleep, in tablet form.',True,'white',A+'B0989HPNQF'),
 ('psyllium','Psyllium husk','Psyllium',1.0,1,2,['health'],0,'Fiber. Travel does things to a person.',True,'earth3',A+'B07MKZD9LR'),
 ('d3k2','Liquid D3 + K2','D3 + K2',0.1,1,1,['health','meds'],0,'Sunlight, bottled.',True,'sun2',A+'B07H1V2KM3'),
 ('fishoil','Fish oil','Fish oil',0.5,1,1,['health','meds'],0,'The pills that taste like a harbor.',True,'sun1',A+'B0046XC528'),
 # Skincare
 ('ceraveam','CeraVe AM SPF 30','CeraVe AM',0.2,1,1,['health'],0,'Sunscreen you will actually use.',True,'sky2',A+'B00F97FHAW'),
 ('ceravepm','CeraVe PM','CeraVe PM',0.2,1,1,['health'],0,'The night shift.',True,'night3',A+'B00365DABC'),
 ('vitc','Vitamin C serum','Vit C serum',0.1,1,1,['health'],0,'Tiny bottle, big claims.',True,'sun2',A+'B07PNCCLD2'),
 ('retinol','Retinol serum','Retinol',0.1,1,1,['health'],0,'Anti-aging, pro-sunburn. Read the label.',True,'dusk3',A+'B07XJ7XWLW'),
 ('copper','Copper peptides','Copper pept.',0.1,1,1,['health','luxury'],0,'Blue. Expensive. Possibly magic.',True,'sky0',A+'B0C9DXGXZ3'),
 ('hairserum','Hair density serum','Hair serum',0.1,1,1,['health','luxury'],0,'Hope, in a dropper.',True,'sea1',A+'B09WMT8HYB'),
 ('dermaroller','Derma roller','Derma roller',0.1,1,2,['health','luxury'],0,'540 tiny needles. Weirdly relaxing.',True,'gray2',A+'B0B1DJ8LTR'),
 ('cocokind','Cocokind SPF 32','Cocokind SPF',0.2,1,1,['health'],0,'Mineral sunscreen for the face that faces the sun.',True,'sun3',A+'B08P4SD7V5'),
 # Everything else
 ('trimmer','Rechargeable detail trimmer','Trimmer',0.3,1,2,['luxury'],0,'Personal grooming.',True,'gray1',A+'B0BK93C994'),
 ('pillow','Memory foam travel pillow','Travel pillow',1.2,3,3,['sleep','luxury'],0,'Ratchet straps keep it compact. Mostly.',True,'gray2',A+'B0BV5WNWS8'),
 ('sunlamp','KLEAH 10,000 lux sun lamp','Sun lamp',1.4,2,3,['sleep','health','luxury'],0,'Circadian rhythm locked in.',True,'sun3',A+'B0BFWSHV7G'),
 ('airthings','Airthings Wave Plus','Air monitor',0.5,2,2,['health','luxury'],0,'Monitors CO2, VOCs and radon. Every Airbnb is a mystery.',True,'white',A+'B07JB8QWH6'),
 ('gooseneck','Gooseneck pour-over kettle','Gooseneck',1.2,2,2,['coffee'],0,'12 oz of precision. Does not explode.',True,'gray2',A+'B0B1TJ4KSP'),
 ('pourigami','MiiR Pourigami dripper','Pourigami',0.3,1,1,['coffee'],0,'Great coffee no matter what.',True,'gray0',A+'B0BGYJBJ4G'),
 ('timemore','Timemore C2 grinder','C2 grinder',1.0,1,3,['coffee'],0,'Hand-ground. Forty turns of arm day.',True,'ink',A+'B0833SDN8M'),
 ('loops','Loop Quiet 2 earplugs','Earplugs',0.1,1,1,['sleep'],0,'24 dB between you and the hostel.',True,'night3',A+'B0D3V61JC8'),
 ('sleepmask','Contoured sleep mask','Sleep mask',0.1,1,1,['sleep'],0,'Darkness, portable.',True,'ink',A+'B095C7H62X'),
 ('blender','BlenderBottle shaker','Shaker',0.4,1,3,['fitness','health'],0,'Protein logistics.',True,'gray2',A+'B07TK681SZ'),
 ('laundrysheets','Laundry detergent sheets','Laundry sheets',0.2,1,1,['organizer'],0,'Detergent that goes through security.',True,'white',A+'B0DYCJ2LXF'),
 ('sonicare','Philips Sonicare 2100','Sonicare',0.3,1,2,['health','essential'],0,'Two minutes, twice a day, in eleven countries.',True,'white',A+'B09LD8PTNJ'),
 ('shaver','MANSCAPED travel shaver','Travel shaver',0.3,1,1,['luxury'],0,'Compact. Discreet. Enough said.',True,'gray0',A+'B0C9LKH31T'),
]
X = [
 # extras: clothing that carries clothesDays
 ('tees5','Five t-shirts','T-shirts x5',1.5,3,2,['clothing'],5,'Five days of looking like a person.',False,'sky1',None),
 ('merino3','Three merino tees','Merino x3',0.9,2,2,['clothing'],4,'Merino: wear twice, smell like nothing. Allegedly.',False,'grass1',None),
 ('underwear7','Seven pairs of underwear','Underwear x7',0.7,2,1,['clothing'],7,'The true laundry clock.',False,'gray2',None),
 ('socks7','Seven pairs of socks','Socks x7',0.9,2,1,['clothing'],7,'Merino quarter socks. The Altras demand it.',False,'gray1',None),
 ('jeans','A pair of jeans','Jeans',1.6,2,3,['clothing'],3,'Heavy, slow to dry, worth it in a city.',False,'sky0',None),
 ('jeans2','A second pair of jeans','Jeans #2',1.6,2,3,['clothing','trap'],2,'You will not wear these. You know you will not wear these.',False,'night3',None),
 ('hikepants','Hiking pants','Hike pants',0.9,2,2,['clothing','hike'],3,'Zip-off legs are a personal choice.',False,'earth2',None),
 ('shorts2','Two pairs of shorts','Shorts x2',0.7,2,1,['clothing'],3,'Quick-dry. Run, swim, sit.',False,'sea2',None),
 ('hoodie','Hoodie','Hoodie',1.3,3,2,['clothing','cold'],2,'The airplane blanket you own.',False,'gray0',None),
 ('downjacket','Packable down jacket','Down jacket',0.9,3,2,['clothing','cold'],1,'Stuffs into its own pocket. Saves the Alps in October.',False,'sun0',None),
 ('swimsuit','Swimsuit','Swimsuit',0.3,1,1,['clothing','swim'],1,'Roatan, Antibes, the hotel pool you did not know about.',False,'sea3',None),
 ('sunhoodie','Sun hoodie','Sun hoodie',0.6,2,2,['clothing'],2,'UPF 50. Dakhla in August.',False,'sun3',None),
 ('hikingboots','Hiking boots','Hiking boots',3.2,3,3,['hike','cold'],0,'Manaslu wants ankles. Everywhere else, they are dead weight.',False,'earth1',None),
 ('dressshirt','Linen button-down','Linen shirt',0.5,2,1,['clothing','luxury'],1,'For the one dinner a month that deserves it.',False,'white',None),
 ('beanie','Knit beanie','Beanie',0.2,1,1,['clothing','cold'],0,'Scotland, in July.',False,'ink',None),
 # extras: health, safety
 ('firstaid','First aid kit','First aid kit',0.8,2,2,['firstaid','health'],0,'Bandages, antiseptic, blister pads. Clean the cut. Every time.',False,'red',None),
 ('antibiotics','Travel antibiotics','Antibiotics',0.1,1,1,['meds','firstaid'],0,'Prescribed before leaving. The otter does not care about your plans.',False,'white',None),
 ('probiotics','Probiotics','Probiotics',0.2,1,1,['health','meds'],0,'A fighting chance against street food.',False,'grass2',None),
 ('repellent','Repellent + travel mosquito net','Repellent + net',0.6,2,2,['repellent'],0,'Hyeres, June. You have been warned.',False,'grass1',None),
 ('diamox','Diamox','Diamox',0.1,1,1,['meds'],0,'Altitude pills. Tingling fingers, functional brain.',False,'sky2',None),
 ('waterbottle','Insulated water bottle','Water bottle',0.8,1,3,['water'],0,'Heavy when full, which is the point.',False,'sea1',None),
 ('sunhat','Wide-brim sun hat','Sun hat',0.3,2,2,['clothing'],0,'Alternative to the boonie for people with dignity.',False,'earth3',None),
 # extras: fun, work, traps
 ('switch','Nintendo Switch','Switch',0.9,3,2,['switch','luxury'],0,'Game within the game. Rest days get a level per city.',False,'red',None),
 ('kindle','Kindle','Kindle',0.4,2,1,['luxury'],0,'A thousand books and one charging cable you will lose.',False,'gray0',None),
 ('yogamat','Travel yoga mat','Yoga mat',2.0,1,5,['fitness'],0,'Thin as a tortilla. Better than a carpet.',False,'dusk2',None),
 ('kitegear','Kite + bar + harness','Kite gear',12.0,4,4,['kite','luxury'],0,'Twelve pounds. Turns every wind day into the best day.',False,'sky1',None),
 ('umbrella','Compact umbrella','Umbrella',0.8,1,3,['rain'],0,'Inverts in Patagonia. Fine in Lisbon.',False,'night3',None),
 ('travelkettle','Collapsible travel kettle','Travel kettle',1.1,2,2,['kettle','coffee'],0,'Tea in every room. Also, one day, a second-degree burn.',False,'red',None),
 ('lens','Camera lens','Camera lens',1.3,2,2,['camera','luxury'],0,'For the photos the phone cannot take. About twelve of them a year.',False,'ink',None),
 ('sparephone','Spare phone','Spare phone',0.4,1,2,['essential'],0,'The old phone. The plan for when the new one goes missing.',False,'gray1',None),
 ('yubikey','YubiKey','YubiKey',0.0,1,1,['essential','work'],0,'The key to everything. Do not put it in the checked bag.',False,'ink',None),
 ('packingcubes','Packing cubes','Packing cubes',0.6,2,2,['organizer'],0,'Nothing gets left behind when everything has a place.',False,'sea2',None),
 ('straps','Compression straps','Straps',0.2,1,1,['organizer'],0,'The pillow becomes a fist.',False,'sun1',None),
 ('gifts','Gifts for hosts','Host gifts',1.0,2,2,['luxury'],0,'Small, local, edible. Airbnb reviews get warmer.',False,'pink',None),
 ('journal','Paper journal + pen','Journal',0.7,2,2,['luxury'],0,'The one thing that never needs charging.',False,'earth2',None),
 ('frenchpress','French press','French press',1.5,2,3,['coffee','luxury'],0,'Heavier than the pour-over kit, and glass. Brave.',False,'gray2',None),
 ('chargerbrick','Second laptop charger','Spare charger',0.6,1,2,['essential','work'],0,'For the day the first one stays in Lisbon.',False,'white',None),
 ('locks','TSA lock','Lock',0.2,1,1,['organizer'],0,'Keeps the honest people out.',False,'gray1',None),
 ('towel','Microfiber towel','Towel',0.4,2,1,['swim','organizer'],0,'Dries in an hour. Smells in a week.',False,'sea3',None),
 # dense heavy things: the way a bag actually hits fifty pounds
 ('kettlebell','Travel kettlebell (12 lb)','Kettlebell',12.0,2,2,['fitness','trap'],0,'Twelve pounds of commitment. The airline will weigh it. Your spine will weigh it.',False,'ink',None),
 ('books','Five paperbacks','Books x5',5.0,2,2,['luxury'],0,'The Kindle exists. You know the Kindle exists.',False,'earth2',None),
 ('wine','Two bottles for hosts','Wine x2',6.0,2,3,['luxury'],0,'Generous, breakable, six pounds.',False,'dusk2',None),
 ('proteintub','5 lb whey tub','Whey tub',5.2,2,3,['health','fitness'],0,'Bought in bulk because it was cheaper. It was not cheaper.',False,'white',None),
 ('camerabody','Mirrorless camera body','Camera',1.6,2,2,['camera','luxury'],0,'For the photos the phone cannot take.',False,'ink',None),
 ('secondlaptop','Second laptop','Laptop #2',3.5,4,3,['work','luxury'],0,'Work laptop and personal laptop, because the two must never meet.',False,'gray1',None),
 ('hairdryer','Travel hair dryer','Hair dryer',1.8,2,2,['luxury','trap'],0,'Every hotel has one. Every single one.',False,'pink',None),
 ('fulltripod','Full-size tripod','Tripod (big)',3.0,1,5,['camera','luxury'],0,'For the drone shots that need a ground shot too.',False,'gray0',None),
]
out=[]
for (i,n,l,lb,w,h,tags,cd,d,real,col,link) in R+X:
    o=dict(id=i,name=n,label=l,weightLb=lb,w=w,h=h,tags=tags,desc=d,real=real,color=P[col])
    if cd: o['clothesDays']=cd
    if link: o['link']=link
    out.append(o)
ids=[o['id'] for o in out]; assert len(ids)==len(set(ids))
print('real', sum(1 for o in out if o['real']), 'extra', sum(1 for o in out if not o['real']), 'total', len(out))
print('real weight total', round(sum(o['weightLb'] for o in out if o['real']),1), 'lb')
os.makedirs('src/data',exist_ok=True)
json.dump(out, open('src/data/items.json','w'), indent=1, ensure_ascii=False)
