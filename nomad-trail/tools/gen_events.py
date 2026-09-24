#!/usr/bin/env python3
"""Generates src/data/events.json. Edit here, then: python3 tools/gen_events.py"""
import json
E = []
def ev(id, title, text, when, base, effects, **kw):
    o = dict(id=id, title=title, text=text, when=when, baseChance=base, effects=effects); o.update(kw); E.append(o)

# ---- The nine real incidents
ev('otter', 'The otter', "Day {day}, {city}. An animal cafe. A sea otter with the eyes of a saint and the teeth of a can opener presses its paws to the glass and looks at you. Specifically at you. The handler nods toward the open tank.",
   'action', 0.35, dict(),
   requiresCity='tokyo',
   choices=[dict(label='Pet the otter', text="You pet the otter. It was worth it. Three days later the cut on your finger is hot and the fever arrives at 3 am. The hospital is very clean and very confused.", effects=dict(health=-34, days=4, mood=-6, sick=3, unlockAchievement='otter')),
            dict(label='Pet it, clean the cut after', text="You pet the otter. It was worth it. That night you clean the nick on your finger, and when it goes hot two days later the antibiotics are already in the backpack. You keep your week.", effects=dict(health=-8, mood=8, unlockAchievement='otter_lived'), requiresTag='firstaid'),
            dict(label='Keep your hands to yourself', text="You do not pet the otter. The otter does not forgive you. Neither do you.", effects=dict(mood=-4, unlockAchievement='otter_resisted'))])
ev('backinjury', 'Something gives', "Lifting the bag onto the train rack, something in your lower back makes a sound you did not know it could make. For the next ten days, standing up is a project.",
   'leg', 0.45, dict(backInjury=10, energy=-30, mood=-15, unlockAchievement='back'), requiresOverweight=True)
ev('wheel', 'Baggage carousel, one wheel short', "Your suitcase comes around the carousel on three wheels and a stump. The airline offers a form. The form offers nothing.",
   'flight', 0.05, dict(wheelBroken=True, mood=-8, energy=-5))
ev('delayed', 'Delayed baggage', "Everyone else's bag comes out. Yours is, according to the app, still in {city}'s departure city, having a nice time. Whatever was in it is somewhere else for a while.",
   'flight', 0.10, dict(bagLocked=3, mood=-10))
ev('kettle', 'The kettle', "The collapsible travel kettle boils, then does not stop, then does something between boiling and detonation. Second-degree burns across the wrist. The hotel has a kettle. It always had a kettle.",
   'day', 0.02, dict(health=-21, mood=-10, energy=-10, sick=4, loseItemTag='kettle', unlockAchievement='kettle'), requiresTag='kettle')
ev('foodpoisoning', 'Food poisoning', "Day {day}, {city}. Something you ate has opinions. You spend two days learning the bathroom tile pattern by heart.",
   'action', 0.135, dict(health=-15, energy=-20, mood=-8, days=2, sick=2), mitigatedBy=['meds'],
   mitigatedText="Day {day}, {city}. Something you ate has opinions. The probiotics have counter-arguments. One rough night, not two days.", mitigatedEffects=dict(health=-7, energy=-10, mood=-4))
ev('airbnbcancel', 'Cancelled on arrival', "You land in {city}. The host has cancelled 'due to unforeseen circumstances', which is to say a better booking. It is 6 pm, everything you own is on your back, and the only hotel with a room is across town. You get there. You do not enjoy getting there.",
   'arrive', 0.08, dict(energy=-20, mood=-12))
ev('forgot', 'Left behind', "Two hours out of {city} you realize your {item} is still in the room. The host 'will look'. The host does not look.",
   'leave', 0.18, dict(loseRandomItem=True, mood=-8), mitigatedBy=['organizer'],
   mitigatedText="You do the packing-cube count before you leave {city}. Everything has a place; everything is in its place.", mitigatedEffects=dict(mood=2))
ev('mosquito', 'The swarm', "Sunset in {city}. The mosquitoes arrive like a shift change. You wake up with a constellation on each ankle and the sleep of a hunted animal.",
   'day', 0.07, dict(energy=-12, mood=-8, health=-3), requiresClimate=['hot'], mitigatedBy=['repellent'],
   mitigatedText="Sunset in {city}. The mosquitoes arrive. The net goes up and the repellent goes on. You sleep like a person with a plan.", mitigatedEffects=dict(mood=1))

# ---- More real-ish events
ev('altitude', 'Thin air', "Above 3,500 m in {city} the headache starts behind the eyes and the appetite leaves. Slowly, slowly: the only rule up here.",
   'arrive', 0.7, dict(health=-13, energy=-25, mood=-5), requiresCity='manaslu', mitigatedBy=['meds','water','health'],
   mitigatedText="Above 3,500 m in {city}. Altitude pills tingle in your fingers, electrolytes in the bottle, a rest day in the plan. The headache stays a rumour.", mitigatedEffects=dict(energy=-12))
ev('jetlag', 'Jet lag', "Six or more time zones in one leg. For three days you are awake at 4 am and asleep in meetings. The body keeps its own calendar.",
   'leg', 0.8, dict(energy=-25, mood=-5), mitigatedBy=['sleep'],
   mitigatedText="Six or more time zones in one leg. Sleep mask down, earplugs in, sun lamp on at 7. The body grumbles and gets in line.", mitigatedEffects=dict(energy=-10))
ev('windday', 'Wind day', "The wind arrives at 2 pm like a train timetable. Everyone in {city} disappears to the water.",
   'day', 0.08, dict(mood=-6), requiresClimate=['hot','cold'], mitigatedBy=['kite'],
   mitigatedText="The wind arrives at 2 pm like a train timetable. You rig up. Best day of the month.", mitigatedEffects=dict(mood=15, energy=-12, unlockAchievement='kite'))
ev('lostphone', 'Lost phone', "Somewhere between the metro and the bar in {city}, your phone stops being yours. The plan you wrote for this exact moment is, of course, on the phone.",
   'action', 0.02, dict(mood=-20, energy=-10, days=1), mitigatedBy=['essential'],
   mitigatedText="Somewhere in {city} your phone stops being yours. The old phone comes out of the backpack and logs you back into everything. A bad evening instead of a bad week.", mitigatedEffects=dict(mood=-6))
ev('overweight', 'Check-in scale', "The airline scale reads a number and the agent reads it back to you like a diagnosis. Fifty pounds is fifty pounds.",
   'flight', 0.6, dict(mood=-5, days=1), requiresOverweight=True)
ev('seaurchin', 'Sea urchin', "A reef, a wave, a foot in the wrong place. Seven spines and a limp for the rest of the week.",
   'action', 0.10, dict(health=-7, mood=-6), requiresCity='roatan', mitigatedBy=['firstaid'],
   mitigatedText="A reef, a wave, a foot in the wrong place. Tweezers, antiseptic, done before dinner.", mitigatedEffects=dict(health=-2))
ev('rockfall', 'Rockfall', "On the ferrata above {city} a stone the size of a fist comes down the gully. The helmet earns its rental fee.",
   'action', 0.06, dict(health=-8, mood=5), requiresCity='innsbruck')
ev('oktoberfest', 'Oktoberfest', "Opening weekend. A tent, a Mass, another Mass, a brass band that will not stop. You lose a day and gain a story.",
   'day', 0.5, dict(mood=18, energy=-25, health=-4, days=1), requiresCity='munich')
ev('rain', 'It rains', "It rains in {city}. Not dramatically. Continuously. Everything you own is slightly damp.",
   'day', 0.05, dict(mood=-6, energy=-4), requiresClimate=['rainy','temperate'], mitigatedBy=['rain'],
   mitigatedText="It rains in {city}. The shell goes on. You are the only dry person at the bus stop.", mitigatedEffects=dict(mood=1))
ev('sunburn', 'Sunburn', "You forgot the sunscreen for exactly one afternoon. Your shoulders will remember it for a week.",
   'day', 0.05, dict(health=-3, mood=-4, energy=-4), requiresClimate=['hot'], mitigatedBy=['health'],
   mitigatedText="SPF 30 in the morning, SPF 32 at noon. The sun tries; the routine wins.", mitigatedEffects=dict())
ev('sleepless', 'The upstairs neighbour', "The apartment above yours in {city} is either a nightclub or a family of tap dancers. 3 am, 4 am, 5 am.",
   'day', 0.04, dict(energy=-15, mood=-6), mitigatedBy=['sleep'],
   mitigatedText="The apartment above yours is a nightclub. Earplugs in. You hear nothing until the alarm.", mitigatedEffects=dict(energy=-3))
ev('wildlife', 'Wildlife', "A moose, or a stag, or something with more legs than expected, stands in the trail outside {city} and does not move. Neither do you. Best minute of the month.",
   'action', 0.10, dict(mood=12), requiresClimate=['cold','alpine','temperate'])
ev('goodday', 'A good day', "Day {day}, {city}. Nothing goes wrong. The coffee is right, the light is right, the work gets done by two and the mountain is still there at three. This is why.",
   'day', 0.04, dict(mood=10, energy=5))
ev('nowifi', 'No wifi', "The listing said wifi. The listing meant a router, unplugged, in a drawer. You hotspot the phone and pray to the tower on the hill.",
   'arrive', 0.06, dict(mood=-8, energy=-5))
ev('laundrylost', 'The laundromat', "The laundromat in {city} returns everything except one sock and your favourite t-shirt. Neither is ever seen again.",
   'action', 0.05, dict(mood=-4))
ev('hostgift', 'The host', "Your host in {city} leaves bread, cheese and a handwritten map of the neighbourhood. The map is wrong and the cheese is perfect.",
   'arrive', 0.10, dict(mood=8), requiresTag='luxury')
ev('surprisemeetup', 'Someone you know', "A friend from two cities ago is, by coincidence, in {city} this week. Dinner turns into a weekend.",
   'day', 0.02, dict(mood=15, energy=-8))
ev('flightdelay', 'Delayed', "The flight to {city} boards, sits, deboards, and then leaves four hours late. You learn the gate area's every outlet.",
   'flight', 0.10, dict(energy=-10, mood=-5))
ev('upgrade', 'Upgraded', "At the gate the agent looks at you, looks at the screen, and hands you a new boarding pass. Row two. You do not ask why.",
   'flight', 0.03, dict(energy=15, mood=10))
ev('trainview', 'The window seat', "The train to {city} runs along a lake, then a valley, then a lake again. You get nothing done and regret none of it.",
   'leg', 0.10, dict(mood=8))
ev('lostcharger', 'One cable short', "The watch cable is in the last hotel. The watch dies on day three and you become a person who does not know how far they walked.",
   'leave', 0.05, dict(loseItemTag='essential', mood=-6), mitigatedBy=['organizer'],
   mitigatedText="Every cable has a pouch and every pouch has a place. You leave {city} with all of them.", mitigatedEffects=dict())
ev('gymday', 'A real gym', "{city} has a real gym, with real weights, and a day pass costs less than a coffee. Arm day, finally.",
   'action', 0.10, dict(health=6, mood=6, energy=-8), requiresTag='fitness')
ev('coffeeshop', 'The cafe', "You find the cafe in {city}. Not a cafe: THE cafe. You will structure the rest of the stay around it.",
   'action', 0.08, dict(mood=8, energy=5))
ev('dirtyclothes', 'Running low', "Everything in the bag has been worn twice. You rotate the least offensive shirt to the front and hope for a laundromat.",
   'day', 0.0, dict(mood=-4))
ids=[e['id'] for e in E]; assert len(ids)==len(set(ids))
json.dump(E, open('src/data/events.json','w'), indent=1, ensure_ascii=False)
print('events', len(E))
