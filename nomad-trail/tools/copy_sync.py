#!/usr/bin/env python3
"""Two-way sync between the game's copy (JSON in src/data) and the Obsidian note Cody edits.

  python3 tools/copy_sync.py export   # JSON -> note (overwrites the note)
  python3 tools/copy_sync.py import   # note -> JSON (only text fields; ids/structure untouched)

Note format: '## Section', '### id' blocks, '- key: value' lines. Lists use ' | ' as the separator.
Newlines inside a value are written as '\\n'. Keep the {placeholders}."""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src', 'data')
NOTE = '/Users/cody.born/Documents/Obsidian Vault/Travel/Nomad/Nomad Trail Copy.md'
J = lambda n: json.load(open(os.path.join(DATA, n), encoding='utf-8'))
def W(n, d): json.dump(d, open(os.path.join(DATA, n), 'w', encoding='utf-8'), indent=1, ensure_ascii=False); open(os.path.join(DATA, n), 'a').write('\n')
enc = lambda v: (' | '.join(v) if isinstance(v, list) else str(v)).replace('\n', '\\n')
dec = lambda s: s.replace('\\n', '\n')

# (section title, json file, id key, [(note key, json key, is_list)], header note)
SPECS = [
 ('Events', 'events.json', 'id', [('title', 'title', False), ('text', 'text', False), ('mitigatedText', 'mitigatedText', False)],
  'What pops up on the trail. `text` is what you read without the mitigating gear, `mitigatedText` with it (only one is ever shown). Placeholders: {city} {day} {item}.'),
 ('Cities', 'cities.json', 'id', [('name', 'name', False), ('country', 'country', False), ('blurb', 'blurb', False)],
  'The arrival card. Blurbs describe the place, never an in-game event.'),
 ('Bundles', 'items.json', 'id', [('name', 'name', False), ('label', 'label', False), ('desc', 'desc', False), ('benefits', 'benefits', True)],
  'Packing cards. `name` is the card title, `label` the tile text (short), `benefits` the lines shown on the card (separate with ` | `).'),
 ('Dishes', 'dishes.json', 'id', [('name', 'name', False), ('ingredients', 'ingredients', True)],
  'Cooking mini-game. Ingredients are shown under the dish name.'),
]

def export():
    out = ['---', 'tags: [personal, project, nomad, game, copy]', 'created: 2026-09-24', 'status: Cody editing; sync with `npm run copy:import`', '---', '',
           '# Nomad Trail: all the words', '',
           'Every line of copy in [[The Nomad Trail (game)]], pulled from the game data. **Edit the text after the colon; do not touch `###` ids or the `- key:` names.** Lists use ` | ` between entries. Line breaks inside a value are written as `\\n`. Keep `{placeholders}`.',
           '', 'To push edits into the game: `cd ~/repos/projects/nomad-trail && npm run copy:import` (then rebuild + push). To regenerate this note from the game: `npm run copy:export` (overwrites your edits, so import first).', '']
    for title, fn, idk, fields, note in SPECS:
        data = J(fn); out += [f'## {title}', '', note, '']
        for row in data:
            out.append(f'### {row[idk]}')
            for nk, jk, is_list in fields:
                if jk in row and row[jk] not in (None, ''): out.append(f'- {nk}: {enc(row[jk])}')
            # event choices
            for i, ch in enumerate(row.get('choices') or [], 1):
                out.append(f'- choice{i}.label: {enc(ch.get("label", ""))}'); out.append(f'- choice{i}.text: {enc(ch.get("text", ""))}')
            out.append('')
    st = J('strings.json'); out += ['## Strings', '', st.get('_readme', ''), '']
    for group, vals in st.items():
        if group.startswith('_'): continue
        out.append(f'### {group}')
        for k, v in vals.items(): out.append(f'- {k}: {enc(v)}')
        out.append('')
    open(NOTE, 'w', encoding='utf-8').write('\n'.join(out)); print(f'exported -> {NOTE}')

def parse_note():
    sections = {}; sec = None; blk = None
    for ln in open(NOTE, encoding='utf-8').read().split('\n'):
        if ln.startswith('## '): sec = ln[3:].strip(); sections[sec] = {}; blk = None
        elif ln.startswith('### ') and sec: blk = ln[4:].strip(); sections[sec][blk] = {}
        elif ln.startswith('- ') and sec and blk is not None:
            m = re.match(r'- ([\w.]+):\s?(.*)$', ln)
            if m: sections[sec][blk][m.group(1)] = dec(m.group(2))
    return sections

def imp():
    sections = parse_note(); changed = 0
    for title, fn, idk, fields, _ in SPECS:
        data = J(fn); blocks = sections.get(title, {})
        for row in data:
            b = blocks.get(str(row[idk]));
            if b is None: continue
            for nk, jk, is_list in fields:
                if nk not in b: continue
                v = [x.strip() for x in b[nk].split(' | ')] if is_list else b[nk]
                if row.get(jk) != v: row[jk] = v; changed += 1
            for i, ch in enumerate(row.get('choices') or [], 1):
                for f in ('label', 'text'):
                    k = f'choice{i}.{f}'
                    if k in b and ch.get(f) != b[k]: ch[f] = b[k]; changed += 1
        W(fn, data)
    st = J('strings.json')
    for group, vals in sections.get('Strings', {}).items():
        if group in st and isinstance(st[group], dict):
            for k, v in vals.items():
                if k in st[group] and st[group][k] != v: st[group][k] = v; changed += 1
    W('strings.json', st); print(f'imported: {changed} field(s) changed')

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'export'
    export() if cmd == 'export' else imp()
