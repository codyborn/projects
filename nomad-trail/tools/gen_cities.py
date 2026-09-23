#!/usr/bin/env python3
"""Generates src/data/cities.json and src/data/dishes.json. Edit here, then: python3 tools/gen_cities.py"""
import json
# id: (name, country, region, lat, lon, hero, minStay, suggested, climate, tz, altitude, dishes, activities, hazard, blurb, stampIcon, eventWeights)
C = {
 'miami':('Miami','USA','northamerica',25.76,-80.19,True,3,14,'hot',-5,0,['stonecrab','cubano'],['swim','trailrun','bands'],'pigeon',"Home base, allegedly. Ninety-six days here last year and the tan never took.",'palm',{'foodpoisoning':0.6}),
 'newyork':('New York','USA','northamerica',40.71,-74.01,True,3,10,'temperate',-5,0,['pizza','bagel'],['bands','trailrun'],'crowd',"The team onsite city. Twenty days at a time, four times a year, always a hotel with a view of a wall.",'skyline',{'lostphone':2.0,'airbnbcancel':1.4}),
 'boulder':('Boulder','USA','northamerica',40.01,-105.27,True,5,21,'temperate',-7,1655,['greenchile','bisonburger'],['trailrun','boulder','hike','ski'],'rock',"Trail runs at altitude, coffee at sea-level prices. The only American city that feels like a base.",'flatirons',{'altitude':0.2,'sunburn':1.5}),
 'bozeman':('Montana','USA','northamerica',45.68,-111.04,True,5,21,'cold',-7,1461,['bisonburger','huckleberry'],['hike','trailrun','ski'],'snow',"A Jeep Compass, a month, and more sky than a person needs.",'mountain',{'wildlife':2.0}),
 'lasvegas':('Las Vegas','USA','northamerica',36.17,-115.14,False,1,3,'hot',-8,0,['buffet'],['bands'],'crowd',"A layover that became five days. Nobody remembers why.",'dice',{'sleepless':2.0}),
 'joshuatree':('Joshua Tree','USA','northamerica',34.13,-116.31,False,2,4,'hot',-8,0,['chili'],['boulder','hike'],'rock',"Bouldering by day, stars by night, an Airbnb with a hot tub and no wifi.",'cactus',{'sunburn':1.5,'nowifi':2.0}),
 'orangecounty':('Orange County','USA','northamerica',33.72,-117.83,False,2,7,'temperate',-8,0,['fishtacos'],['swim','surf','bands'],'wave',"Family. Laundry that someone else folds. The Pacific gateway.",'sun',{'goodday':1.5}),
 'montreal':('Montreal','Canada','northamerica',45.50,-73.57,False,3,10,'cold',-5,0,['poutine','bagel'],['trailrun','bands'],'snow',"Two weeks of bagels and the discovery that French is spoken faster here.",'maple',{}),
 'lapaz':('La Paz','Mexico','mexico',24.14,-110.31,False,2,5,'hot',-7,0,['tacos','fishtacos'],['swim','hike'],'wave',"Whale sharks, a rental car, the good kind of quiet.",'whale',{'foodpoisoning':1.6}),
 'laventana':('La Ventana','Mexico','mexico',24.05,-109.99,True,4,12,'hot',-7,0,['tacos','fishtacos'],['kite','swim','yoga'],'gust',"Kiteboarding town. Wind every afternoon, NYE on the beach, nothing to do until 2 pm.",'kite',{'windday':2.5,'foodpoisoning':1.4}),
 'roatan':('Roatan','Honduras','mexico',16.32,-86.53,True,7,21,'hot',-6,0,['baleada','ceviche'],['swim','yoga','bands'],'wave',"Vitalia. Five weeks on an island of biohackers and one very bad kettle.",'reef',{'seaurchin':2.0,'foodpoisoning':1.3,'mosquito':1.2}),
 'santiago':('Santiago','Chile','southamerica',-33.45,-70.67,False,3,7,'temperate',-4,520,['ceviche','completo'],['hike','bands','trailrun'],'crowd',"A week in the Andes' shadow before the wind country.",'andes',{}),
 'patagonia':('Patagonia','Chile','southamerica',-51.73,-72.51,True,10,28,'cold',-3,0,['asado','ceviche'],['hike','trailrun','kite'],'gust',"Edge City. A month at the end of the world with a hundred other people who also work on the internet.",'peaks',{'windday':2.5,'wildlife':1.5}),
 'buenosaires':('Buenos Aires','Argentina','southamerica',-34.60,-58.38,True,5,14,'temperate',-3,0,['asado','empanada'],['bands','trailrun'],'crowd',"DevConnect. Steak at midnight, meetings at ten, a city that never asked what time zone you were on.",'tango',{'lostphone':1.6,'sleepless':1.5}),
 'iguazu':('Iguazu','Argentina','southamerica',-25.69,-54.44,False,1,2,'hot',-3,0,['empanada'],['hike'],'mosquito',"Waterfalls that make Niagara look like a tap.",'falls',{'mosquito':2.0}),
 'lisbon':('Lisbon','Portugal','europe',38.72,-9.14,True,5,14,'temperate',0,0,['pasteldenata','bacalhau'],['trailrun','surf','bands'],'tram',"The European base. Hills, tiles, the Airbnb that cancelled on the day.",'tram',{'airbnbcancel':2.0}),
 'carvoeiro':('Carvoeiro','Portugal','europe',37.10,-8.47,False,3,7,'hot',0,0,['pasteldenata','bacalhau'],['swim','hike','trailrun'],'wave',"Cliffs, caves, a rental car with the turning radius of a boat.",'cliff',{'sunburn':1.5}),
 'madrid':('Madrid','Spain','europe',40.42,-3.70,False,3,7,'temperate',1,650,['paella','tortilla'],['bands','trailrun'],'crowd',"A week of late dinners and early meetings. The math does not work.",'bull',{'sleepless':1.5}),
 'granada':('Granada','Spain','europe',37.18,-3.60,True,4,10,'hot',1,740,['paella','tortilla'],['hike','boulder','trailrun'],'rock',"Free tapas with every drink. The Alhambra. The Sierra Nevada right there.",'alhambra',{'goodday':1.5}),
 'london':('London','UK','europe',51.51,-0.13,True,5,21,'rainy',0,0,['fishandchips','sundayroast'],['bands','trailrun'],'pigeon',"Six weeks of a city that charges rent on the air.",'bigben',{'rain':2.5}),
 'brussels':('Brussels','Belgium','europe',50.85,4.35,False,3,7,'rainy',1,0,['moules','frites'],['bands'],'pigeon',"A week. Fries as a food group.",'waffle',{'rain':1.5}),
 'amsterdam':('Amsterdam','Netherlands','europe',52.37,4.90,False,3,7,'rainy',1,0,['stroopwafel','moules'],['bands','trailrun'],'tram',"Bikes have right of way over everything, including you.",'bike',{'rain':1.5}),
 'marseille':('Marseille','France','europe',43.30,5.37,False,1,2,'hot',1,0,['bouillabaisse'],['swim','hike'],'wave',"One night. The bouillabaisse was worth the night.",'port',{}),
 'hyeres':('Hyeres','France','europe',43.12,6.13,True,10,26,'hot',1,0,['bouillabaisse','ratatouille'],['swim','trailrun','kite','bands'],'mosquito',"Twenty-six days on the Riviera. Bread is the answer. The mosquitoes had questions.",'palm',{'mosquito':3.0,'goodday':1.5}),
 'antibes':('Antibes','France','europe',43.58,7.12,True,5,21,'hot',1,0,['ratatouille','bouillabaisse'],['swim','trailrun','bands'],'wave',"Nice, Monaco, the sea every morning. If you can't beat 'em.",'yacht',{'mosquito':1.5,'sunburn':1.5}),
 'edinburgh':('Edinburgh','UK','europe',55.95,-3.19,False,1,2,'rainy',0,0,['haggis','fishandchips'],['trailrun','hike'],'pigeon',"A night between the Highlands and Morocco. Rain both ways.",'castle',{'rain':2.0}),
 'highlands':('Scottish Highlands','UK','europe',57.27,-6.22,True,10,40,'rainy',0,0,['haggis','sundayroast'],['hike','trailrun','swim'],'rock',"Aviemore, Skye, Glencoe. Six weeks, twelve dry hours, the best of them all.",'stag',{'rain':3.0,'wildlife':1.5,'goodday':1.5}),
 'reykjavik':('Iceland','Iceland','europe',64.15,-21.94,True,5,8,'cold',0,0,['plokkfiskur','lamb'],['hike','swim'],'ice',"A campervan, the ring road, sleep that never gets dark.",'geyser',{'rain':2.0,'windday':1.5,'goodday':2.0}),
 'munich':('Munich','Germany','alps',48.14,11.58,True,3,7,'temperate',1,520,['weisswurst','kaiserschmarrn'],['bands','trailrun','swim'],'crowd',"Oktoberfest in September. Nothing about this city makes sense and all of it is on time.",'pretzel',{'oktoberfest':3.0,'sleepless':1.5}),
 'innsbruck':('Innsbruck','Austria','alps',47.27,11.40,True,10,33,'alpine',1,574,['kaspressknoedel','kaiserschmarrn'],['ferrata','boulder','hike','ski','trailrun'],'rock',"The Nordkette out the window. Via ferrata on Saturdays, the climbing gym on Tuesdays. The best month of the year.",'edelweiss',{'goodday':2.5,'rockfall':2.0,'airbnbcancel':1.3}),
 'hallstatt':('Salzkammergut','Austria','alps',47.56,13.65,False,4,7,'alpine',1,511,['kaspressknoedel','kaiserschmarrn'],['hike','swim','trailrun'],'rock',"Bad Goisern, Gosau, lakes you can drink from. Cut from a month to a week and still worth it.",'lake',{'goodday':2.0,'rain':1.3}),
 'casablanca':('Casablanca','Morocco','africa',33.57,-7.59,False,2,7,'hot',1,0,['tagine','couscous'],['bands','trailrun'],'crowd',"A week of tagine and the realization that the movie was not filmed here.",'lantern',{'foodpoisoning':1.8}),
 'dakhla':('Dakhla','Morocco','africa',23.71,-15.94,True,7,21,'hot',1,0,['tagine','couscous'],['kite','swim','yoga','bands'],'gust',"Three weeks on a lagoon in the Sahara. Wind at 2 pm like a train timetable. The French have watches.",'dune',{'windday':3.0,'foodpoisoning':1.5,'sunburn':2.0}),
 'nairobi':('Nairobi','Kenya','africa',-1.29,36.82,True,4,10,'hot',3,1795,['nyamachoma','ugali'],['trailrun','hike','bands'],'yak',"The October gap. Altitude you do not notice until the run.",'acacia',{'wildlife':2.5,'foodpoisoning':1.5,'mosquito':1.5}),
 'seoul':('Seoul','South Korea','asia',37.57,126.98,True,4,7,'temperate',9,0,['bibimbap','kbbq'],['bands','trailrun','hike'],'crowd',"A week of food that is both spicy and a personality.",'lantern',{'goodday':1.5}),
 'chiangmai':('Chiang Mai','Thailand','asia',18.79,98.98,False,4,8,'hot',7,310,['khaosoi','padthai'],['yoga','bands','hike'],'mosquito',"Nomad capital, cafés per capita off the charts, khao soi for breakfast.",'temple',{'foodpoisoning':2.0,'mosquito':1.8}),
 'bangkok':('Bangkok','Thailand','asia',13.76,100.50,True,3,7,'hot',7,0,['padthai','khaosoi'],['bands','swim'],'tuktuk',"Street food at 1 am, a tuk-tuk at 1:05, regret at 4.",'tuktuk',{'foodpoisoning':2.5,'sleepless':1.5}),
 'hongkong':('Hong Kong','China','asia',22.32,114.17,True,3,7,'hot',8,0,['dimsum','wonton'],['hike','trailrun','swim'],'crowd',"Skyscrapers with hiking trails behind them. A week of dim sum and stairs.",'junk',{'rain':1.5}),
 'tokyo':('Tokyo','Japan','asia',35.68,139.65,True,5,20,'temperate',9,0,['ramen','sushi'],['trailrun','bands','boulder'],'otter',"Three weeks. An animal café. An otter. A hospital. In that order.",'torii',{'otter':1.0,'goodday':2.0}),
 'minakami':('Minakami','Japan','asia',36.78,138.99,False,2,4,'alpine',9,500,['ramen','soba'],['hike','ski','swim'],'snow',"Nikko and Minakami: onsens, snow, a train that apologizes for being early.",'onsen',{'goodday':2.0}),
 'kathmandu':('Kathmandu','Nepal','himalaya',27.72,85.32,True,2,4,'temperate',6,1400,['dalbhat','momo'],['hike','bands'],'crowd',"Permits, a duffel, the last real shower for two weeks.",'stupa',{'foodpoisoning':2.0}),
 'manaslu':('Manaslu Circuit','Nepal','himalaya',28.55,84.56,True,1,3,'alpine',6,5106,['dalbhat','momo'],['hike'],'yak',"Fourteen days on foot around the eighth-highest mountain in the world. Dal bhat power, twenty-four hour.",'yak',{'altitude':3.0,'foodpoisoning':1.5,'goodday':2.0}),
}
# undirected edges: (a, b, transport, days, months?)
E = [
 ('miami','newyork','flight',1),('miami','lapaz','flight',1),('miami','roatan','flight',1),('miami','lisbon','flight',1),('miami','santiago','flight',1),('miami','buenosaires','flight',1),('miami','orangecounty','flight',1),
 ('newyork','london','flight',1),('newyork','lisbon','flight',1),('newyork','montreal','train',1),('newyork','boulder','flight',1),('newyork','reykjavik','flight',1,[6,7,8,9]),('newyork','bozeman','flight',1),('newyork','tokyo','flight',2),
 ('boulder','bozeman','car',1),('boulder','lasvegas','flight',1),('boulder','orangecounty','flight',1),('bozeman','montreal','flight',1),
 ('lasvegas','joshuatree','car',1),('joshuatree','orangecounty','car',1),('orangecounty','lapaz','flight',1),('orangecounty','tokyo','flight',1),('orangecounty','seoul','flight',1),('lasvegas','tokyo','flight',1),
 ('lapaz','laventana','car',1),('laventana','santiago','flight',2),('roatan','santiago','flight',2),('lapaz','roatan','flight',1),
 ('santiago','patagonia','flight',1),('patagonia','buenosaires','flight',1),('buenosaires','iguazu','bus',1),('buenosaires','lisbon','flight',1),('buenosaires','madrid','flight',1),('iguazu','madrid','flight',1),('santiago','buenosaires','flight',1),
 ('lisbon','carvoeiro','car',1),('carvoeiro','madrid','train',1),('lisbon','madrid','train',1),('madrid','granada','train',1),('granada','marseille','flight',1),('granada','casablanca','flight',1),('lisbon','casablanca','flight',1),('lisbon','london','flight',1),('madrid','marseille','flight',1),
 ('casablanca','dakhla','flight',1),('dakhla','nairobi','flight',2),('casablanca','nairobi','flight',1),
 ('london','brussels','train',1),('brussels','amsterdam','train',1),('amsterdam','munich','train',1),('london','edinburgh','train',1),('edinburgh','highlands','car',1),('highlands','reykjavik','flight',1,[6,7,8,9]),('reykjavik','london','flight',1),('edinburgh','casablanca','flight',1),('london','marseille','flight',1),
 ('marseille','hyeres','train',1),('hyeres','antibes','train',1),('antibes','munich','train',1),('antibes','innsbruck','train',1),('munich','innsbruck','train',1),('innsbruck','hallstatt','train',1),('hallstatt','munich','train',1),
 ('munich','nairobi','flight',1),('munich','bangkok','flight',1),('munich','tokyo','flight',1),('amsterdam','seoul','flight',1),('munich','kathmandu','flight',2),
 ('nairobi','bangkok','flight',1),('nairobi','kathmandu','flight',1),('kathmandu','manaslu','trek',14,[10,11]),('kathmandu','bangkok','flight',1),('kathmandu','hongkong','flight',1),
 ('bangkok','chiangmai','train',1),('chiangmai','hongkong','flight',1),('bangkok','hongkong','flight',1),('hongkong','seoul','flight',1),('hongkong','tokyo','flight',1),('seoul','tokyo','flight',1),('tokyo','minakami','train',1),
 ('tokyo','lasvegas','flight',1),('seoul','lasvegas','flight',1),('hongkong','newyork','flight',1),('tokyo','miami','flight',2),
]
ENERGY = {'flight':18,'train':8,'bus':14,'car':6,'ferry':8,'campervan':10,'trek':30}
legs = {k: [] for k in C}
def wrap(d): return ((d+540)%360)-180
E=[e for e in E if abs(wrap(C[e[0]][4]-C[e[1]][4]))<=110 or print('drop long-haul', e[0], e[1])]
for e in E:
    a,b,t,d = e[:4]; months = e[4] if len(e)>4 else None
    for x,y in ((a,b),(b,a)):
        if t=='trek' and x=='manaslu': t2,d2='bus',2
        else: t2,d2=t,d
        tz = abs(C[x][9]-C[y][9])
        leg = dict(to=y, transport=t2, days=d2, energy=ENERGY[t2] + (tz//3)*4, timezones=tz)
        if months and y in ('reykjavik','manaslu'): leg['months']=months
        legs[x].append(leg)
LODGE = {
 'airbnb': dict(id='airbnb', name='Airbnb', cancelChance=0.08, quiet=2, moodPerDay=2, energyPerDay=1),
 'hostel': dict(id='hostel', name='Hostel dorm', cancelChance=0.0, quiet=0, moodPerDay=-2, energyPerDay=-2),
 'hotel':  dict(id='hotel', name='Hotel', cancelChance=0.01, quiet=3, moodPerDay=1, energyPerDay=3),
 'teahouse': dict(id='teahouse', name='Tea house', cancelChance=0.0, quiet=1, moodPerDay=3, energyPerDay=-1),
 'campervan': dict(id='campervan', name='Campervan', cancelChance=0.0, quiet=2, moodPerDay=4, energyPerDay=-1),
 'coliving': dict(id='coliving', name='Co-living', cancelChance=0.02, quiet=1, moodPerDay=3, energyPerDay=0),
}
def lodgings(cid):
    if cid=='manaslu': return [LODGE['teahouse']]
    if cid=='reykjavik': return [LODGE['campervan'], LODGE['hotel']]
    if cid in ('roatan','patagonia'): return [LODGE['coliving'], LODGE['airbnb']]
    if cid in ('newyork','lasvegas','marseille','edinburgh','iguazu'): return [LODGE['hotel'], LODGE['hostel']]
    return [LODGE['airbnb'], LODGE['hotel'], LODGE['hostel']]
cities=[]
for cid,(name,country,region,lat,lon,hero,mins,sug,climate,tz,alt,dishes,acts,hazard,blurb,icon,ew) in C.items():
    sug=max(sug,8) if cid not in ('manaslu','marseille','edinburgh','iguazu','lasvegas','joshuatree') else sug
    mins=max(mins, round(sug*0.8))
    o=dict(id=cid,name=name,country=country,region=region,lat=lat,lon=lon,hero=hero,minStay=mins,suggestedStay=sug,climate=climate,timezone=tz,
           dishes=dishes,activities=acts,hazard=hazard,lodgings=lodgings(cid),eventWeights=ew,legs=legs[cid],blurb=blurb,stampIcon=icon)
    if alt: o['altitude']=alt
    cities.append(o)
json.dump(cities, open('src/data/cities.json','w'), indent=1, ensure_ascii=False)
print('cities', len(cities), 'hero', sum(1 for c in cities if c['hero']), 'legs', sum(len(c['legs']) for c in cities))
# ---- dishes
S=lambda *steps: [dict(kind=k,count=n) for k,n in steps]
D = [
 ('stonecrab','Stone crab + key lime pie','miami',['stone crab','butter','lime','graham'],S(('chop',4),('stir',3),('pour',2)),8,10),
 ('cubano','Cubano sandwich','miami',['bread','pork','ham','pickles','mustard'],S(('chop',4),('flip',3),('season',2)),6,8),
 ('pizza','Dollar slice','newyork',['dough','sauce','mozzarella'],S(('knead',5),('pour',2),('season',3)),4,10),
 ('bagel','Everything bagel + lox','newyork',['bagel','cream cheese','lox','capers'],S(('chop',3),('stir',2),('season',3)),6,8),
 ('greenchile','Green chile stew','boulder',['pork','green chile','potato','onion'],S(('chop',6),('stir',4),('season',2)),10,7),
 ('bisonburger','Bison burger','bozeman',['bison','bun','onion','cheddar'],S(('knead',3),('flip',4),('season',2)),9,9),
 ('huckleberry','Huckleberry pancakes','bozeman',['flour','egg','huckleberries','butter'],S(('stir',5),('pour',3),('flip',4)),5,10),
 ('buffet','The buffet','lasvegas',['everything'],S(('pour',6),('stir',2)),2,6),
 ('chili','Campfire chili','joshuatree',['beans','tomato','onion','cumin'],S(('chop',4),('stir',6),('season',3)),8,7),
 ('fishtacos','Fish tacos','orangecounty',['white fish','tortilla','cabbage','lime','crema'],S(('chop',4),('flip',3),('season',2),('pour',2)),9,10),
 ('poutine','Poutine','montreal',['fries','cheese curds','gravy'],S(('chop',4),('pour',3),('stir',2)),3,9),
 ('tacos','Tacos al pastor','lapaz',['pork','pineapple','tortilla','onion','cilantro'],S(('chop',5),('flip',4),('season',3)),9,10),
 ('baleada','Baleadas','roatan',['flour tortilla','beans','cheese','egg'],S(('knead',4),('flip',3),('pour',2)),7,8),
 ('ceviche','Ceviche','santiago',['white fish','lime','onion','cilantro','chili'],S(('chop',6),('pour',2),('stir',3),('season',2)),10,8),
 ('completo','Completo italiano','santiago',['hot dog','avocado','tomato','mayo'],S(('chop',3),('pour',3)),3,7),
 ('asado','Asado','buenosaires',['beef','salt','charcoal','chimichurri'],S(('season',4),('flip',5),('chop',3)),10,12),
 ('empanada','Empanadas','buenosaires',['dough','beef','onion','egg','olives'],S(('knead',4),('chop',4),('flip',3)),7,8),
 ('pasteldenata','Pastel de nata','lisbon',['pastry','egg yolk','sugar','cinnamon'],S(('knead',4),('pour',3),('stir',4)),4,12),
 ('bacalhau','Bacalhau a bras','lisbon',['salt cod','potato','egg','onion','olives'],S(('chop',5),('stir',5),('season',2)),9,7),
 ('paella','Paella','madrid',['rice','saffron','shrimp','chicken','peppers'],S(('chop',5),('stir',6),('season',3)),9,9),
 ('tortilla','Tortilla espanola','granada',['egg','potato','onion','olive oil'],S(('chop',5),('stir',3),('flip',3)),8,8),
 ('fishandchips','Fish and chips','london',['cod','batter','potato','peas'],S(('chop',4),('pour',2),('flip',4),('season',2)),6,8),
 ('sundayroast','Sunday roast','london',['beef','potatoes','carrots','gravy','yorkshire pudding'],S(('season',3),('chop',5),('pour',3)),9,9),
 ('moules','Moules frites','brussels',['mussels','white wine','shallots','fries'],S(('chop',3),('pour',2),('stir',4)),8,8),
 ('frites','Frites with andalouse','brussels',['potato','oil','andalouse sauce'],S(('chop',5),('flip',3),('pour',2)),3,8),
 ('stroopwafel','Stroopwafels','amsterdam',['dough','caramel','cinnamon'],S(('knead',4),('flip',4),('pour',3)),3,10),
 ('bouillabaisse','Bouillabaisse','marseille',['rockfish','saffron','fennel','tomato','rouille'],S(('chop',6),('stir',5),('season',3),('pour',2)),10,9),
 ('ratatouille','Ratatouille','hyeres',['eggplant','zucchini','tomato','peppers','herbs'],S(('chop',8),('stir',4),('season',3)),10,7),
 ('haggis','Haggis, neeps and tatties','highlands',['haggis','turnip','potato','whisky'],S(('chop',5),('stir',3),('pour',2)),7,8),
 ('plokkfiskur','Plokkfiskur','reykjavik',['cod','potato','onion','bechamel'],S(('chop',4),('stir',5),('season',2)),8,7),
 ('lamb','Icelandic lamb soup','reykjavik',['lamb','root vegetables','herbs'],S(('chop',5),('stir',6)),9,8),
 ('weisswurst','Weisswurst breakfast','munich',['weisswurst','pretzel','sweet mustard'],S(('pour',3),('chop',2),('season',2)),5,9),
 ('kaiserschmarrn','Kaiserschmarrn','innsbruck',['flour','egg','milk','sugar','plum jam'],S(('stir',5),('pour',2),('flip',4),('season',2)),5,12),
 ('kaspressknoedel','Kaspressknoedel','innsbruck',['bread','graukase','onion','egg','broth'],S(('chop',4),('knead',5),('flip',3),('pour',2)),9,10),
 ('tagine','Lamb tagine','casablanca',['lamb','apricots','almonds','cumin','couscous'],S(('chop',5),('season',4),('stir',5)),10,9),
 ('couscous','Friday couscous','dakhla',['couscous','vegetables','chickpeas','harissa'],S(('stir',5),('chop',5),('season',2)),9,7),
 ('nyamachoma','Nyama choma','nairobi',['goat','salt','kachumbari','ugali'],S(('season',3),('flip',5),('chop',4)),9,9),
 ('ugali','Ugali + sukuma wiki','nairobi',['maize flour','collard greens','onion','tomato'],S(('stir',6),('chop',4)),8,6),
 ('bibimbap','Bibimbap','seoul',['rice','egg','vegetables','gochujang','beef'],S(('chop',6),('flip',2),('stir',4),('season',2)),10,9),
 ('kbbq','Korean BBQ','seoul',['pork belly','lettuce','kimchi','garlic'],S(('flip',6),('chop',3),('season',2)),8,11),
 ('khaosoi','Khao soi','chiangmai',['egg noodles','coconut milk','curry paste','chicken','shallots'],S(('stir',5),('pour',3),('chop',4),('season',2)),9,10),
 ('padthai','Pad thai','bangkok',['rice noodles','shrimp','egg','peanuts','tamarind'],S(('chop',4),('stir',6),('flip',2),('season',3)),8,9),
 ('dimsum','Dim sum','hongkong',['dough','shrimp','pork','ginger'],S(('knead',5),('chop',4),('pour',2)),8,10),
 ('wonton','Wonton noodles','hongkong',['wonton','egg noodles','broth','bok choy'],S(('knead',4),('pour',3),('stir',3)),8,8),
 ('ramen','Ramen','tokyo',['noodles','broth','pork','egg','scallion'],S(('stir',6),('chop',3),('pour',3),('season',2)),9,11),
 ('sushi','Sushi','tokyo',['rice','tuna','salmon','nori','wasabi'],S(('stir',4),('chop',6),('knead',3)),9,10),
 ('soba','Soba','minakami',['buckwheat noodles','dashi','scallion','wasabi'],S(('knead',5),('pour',3),('chop',2)),8,8),
 ('dalbhat','Dal bhat','kathmandu',['lentils','rice','spinach','pickle','cumin'],S(('stir',6),('chop',4),('season',3),('pour',2)),10,8),
 ('momo','Momos','kathmandu',['dough','buffalo','onion','ginger','chili sauce'],S(('knead',5),('chop',4),('flip',2),('pour',2)),8,10),
]
dishes=[dict(id=i,name=n,city=c,ingredients=ing,steps=st,health=h,mood=m) for (i,n,c,ing,st,h,m) in D]
ids={d['id'] for d in dishes}
missing=[(c['id'],d) for c in cities for d in c['dishes'] if d not in ids]
assert not missing, missing
json.dump(dishes, open('src/data/dishes.json','w'), indent=1, ensure_ascii=False)
print('dishes', len(dishes))
