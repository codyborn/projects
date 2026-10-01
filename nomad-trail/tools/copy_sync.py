#!/usr/bin/env python3
"""Two-way sync between the game's copy (JSON in src/data) and the Obsidian note Cody edits.

  python3 tools/copy_sync.py export   # JSON -> note (overwrites the note)
  python3 tools/copy_sync.py import   # note -> JSON (only text fields; ids/structure untouched)

Note format: '## Section', '### id' blocks, '- key: value' lines. Lists use ' | ' as the separator.
Newlines inside a value are written as '\\n'. Keep the {placeholders}."""
import json, re, sys, os, hashlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'src', 'data')
NOTE = '/Users/cody.born/Documents/Obsidian Vault/Travel/Nomad/Nomad Trail Copy.md'
def J(n):
    d = json.load(open(os.path.join(DATA, n), encoding='utf-8'))
    if n == 'dishes.json':
        for row in d: row['stepText'] = [f"{st['kind']}: {st.get('what', '')}".rstrip(': ') for st in row['steps']]
    return d
def W(n, d):
    if n == 'dishes.json':
        for row in d:
            texts = row.pop('stepText', None)
            if texts:
                for st, line in zip(row['steps'], texts):
                    k, _, w = line.partition(':'); st['what'] = w.strip() or st.get('what')
    path = os.path.join(DATA, n); ind = _indent(path)   # read the indent before open(w) truncates the file
    json.dump(d, open(path, 'w', encoding='utf-8'), indent=ind, ensure_ascii=False); open(path, 'a').write('\n')
def _indent(path):
    """Match the file's existing indent so an import diffs only the lines that changed."""
    for ln in open(path, encoding='utf-8'):
        m = re.match(r'( +)\S', ln)
        if m: return len(m.group(1))
    return 2
enc = lambda v: (' | '.join(v) if isinstance(v, list) else str(v)).replace('\n', '\\n')
dec = lambda s: s.replace('\\n', '\n')

# (section title, json file, id key, [(note key, json key, is_list)], header note)
SPECS = [
 ('Events', 'events.json', 'id', [('title', 'title', False), ('text', 'text', False), ('mitigatedText', 'mitigatedText', False)],
  'What pops up on the trail. `text` is what you read without the mitigating gear, `mitigatedText` with it (only one is ever shown). '
  'A `mitigatedText.<item>` line replaces it when that particular item is the one that saved you \u2014 the umbrella does not go *on*. Placeholders: {city} {day} {item}.'),
 ('Cities', 'cities.json', 'id', [('name', 'name', False), ('country', 'country', False), ('blurb', 'blurb', False)],
  'The arrival card. Blurbs describe the place, never an in-game event.'),
 ('Puzzles', 'puzzles.json', 'id', [('title', 'title', False), ('prompt', 'prompt', False), ('choices', 'choices', True), ('hint', 'hint', False), ('explain', 'explain', False)],
  'Work-week puzzles (Professor Layton style, Uniswap engineering). Keep choices as 4 lines; the answer index lives in the JSON.'),
 ('Bundles', 'items.json', 'id', [('name', 'name', False), ('label', 'label', False), ('desc', 'desc', False), ('benefits', 'benefits', True)],
  'Packing cards. `name` is the card title, `label` the tile text (short), `benefits` the lines shown on the card (separate with ` | `).'),
 ('Dishes', 'dishes.json', 'id', [('name', 'name', False), ('ingredients', 'ingredients', True), ('steps', 'stepText', True)],
  'Cooking mini-game. Ingredients are shown under the dish name.'),
]

# ---- the copy that lives in the scenes, not in the JSON ------------------------------------------------------------
# Everything a player reads is editable here, not only the data files. Each entry is one string literal in a .ts file,
# found by where it sits (a text call, a copy-bearing property) and by how it reads (prose, or an all-caps button word).
# Import rewrites those exact spans, and refuses a file whose literal count has moved since the export.
SRC = os.path.join(ROOT, 'src')
SKIP_FILES = {   # dev surfaces and machinery: nothing here reaches a player
 'debug.ts', 'playLink.ts', 'minigames/devHarness.ts', 'minigames/harness-entry.ts', 'minigames/console/stall-entry.ts',
 'minigames/console/input.ts', 'ui/simBridge.ts', 'audio/synth.ts', 'audio/tracker.ts', 'audio/sfx.ts', 'audio/selection.ts',
 'core/types.ts', 'core/palette.ts', 'art/icons.ts', 'art/sprites.ts', 'art/font.ts', 'art/skyline.ts', 'main.ts',
}
SKIP_TEXT = {'ABCDEF', 'GET', 'POST', 'SHUTDOWN', 'CSS', 'JSON',
 'North America', 'South America'}   # continent ids: the engine matches on them, so they are not copy
ANCHORS = [
 r'\btxt\(\s*[^,()]+,\s*[^,()]+,\s*[^,()]+,\s*$', r'\bptext\(\s*[^,()]+,\s*[^,()]+,\s*[^,()]+,\s*$',
 r'\.setText\(\s*$', r'\.(intro|card|say|toast|setMsg|setHint|setProgress|setLabel|tip|pop|banner|interlude)\(\s*$',
 r'\btoast\(\s*[^,()]+,\s*$', r'new MinigameFrame\(\s*[^,]+,\s*[^,]+,\s*$', r'new Button\(\s*[^,()]+,\s*[^,()]+,\s*[^,()]+,\s*$',
 r'\b(title|label|instruction|instr|hint|blurb|caption|subtitle|msg|prompt|desc|body|note|line|head|sub|why|answer|name|word|tip|text|detail|error|outcome|flavor)\s*:\s*$',
 r'\.push\(\s*$', r'\breturn\s*$', r'\?\s*$', r':\s*$', r'\[\s*$', r',\s*$', r'\+\s*$', r'\|\|\s*$', r'=\s*$',
]
ANCHOR_RE = [re.compile(a) for a in ANCHORS]
PLACEHOLDER = re.compile(r'\$\{[^}]*\}')

def ts_literals(code):
    """Every string / template literal in a .ts file, as (start, end, quote, inner); comments skipped."""
    i, n, out = 0, len(code), []
    while i < n:
        c = code[i]
        if c == '/' and i + 1 < n and code[i + 1] == '/': j = code.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and i + 1 < n and code[i + 1] == '*': j = code.find('*/', i); i = n if j < 0 else j + 2; continue
        if c in '\'"`':
            q, j, depth = c, i + 1, 0
            while j < n:
                if code[j] == '\\': j += 2; continue
                if q == '`' and code[j] == '$' and j + 1 < n and code[j + 1] == '{': depth += 1; j += 2; continue
                if q == '`' and depth and code[j] == '}': depth -= 1; j += 1; continue
                if code[j] == q and not depth: break
                if q != '`' and code[j] == '\n': break
                j += 1
            out.append((i, j, q, code[i + 1:j])); i = j + 1; continue
        i += 1
    return out

def is_copy(inner, code, a):
    """Prose or a button word, in a position where text gets drawn."""
    if '\n' in inner or inner in SKIP_TEXT: return False
    bare = PLACEHOLDER.sub('', inner).strip()
    if not re.search(r'[A-Za-z]', bare): return False
    prose = (' ' in bare and re.search(r'[a-z]', bare)) or (bare.isupper() and len(bare) >= 2)
    if not prose: return False
    # pixel art and tile maps are rows of capitals: real one-word copy is short and has no map glyphs in it
    if bare.isupper() and ' ' not in bare and (len(bare) > 12 or re.search(r'[.#^*~]', bare) or (len(bare) >= 8 and len(set(bare)) <= 4)): return False
    if re.match(r'^[a-z0-9_\-.:#/%]+$', bare) or '/' in bare and ' ' not in bare: return False
    tail = re.sub(r'\s+', ' ', code[max(0, a - 160):a])
    return any(r.search(tail) for r in ANCHOR_RE)

def src_files():
    out = []
    for dirpath, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d != 'node_modules']
        for f in sorted(files):
            if not f.endswith('.ts') or f.endswith('.test.ts'): continue
            rel = os.path.relpath(os.path.join(dirpath, f), SRC).replace(os.sep, '/')
            if rel in SKIP_FILES: continue
            out.append(rel)
    return sorted(out)

def screen_strings(rel):
    """(start, end, inner) for every editable literal in one source file, in file order."""
    code = open(os.path.join(SRC, rel), encoding='utf-8').read()
    return code, [(a, b, inner) for (a, b, q, inner) in ts_literals(code) if is_copy(inner, code, a)]

def export_screens(out):
    out += ['## Screens', '',
            'Copy that lives in the code: buttons, cards, toasts, mini-game instructions, the lines the engine writes into the log. '
            'The numbers are positions in the file, so **do not add, remove or reorder entries** — edit the text after the colon and nothing else. '
            '`${...}` and `{braces}` are filled in by the game; keep them, spelling and all. An import that finds a file changed underneath it skips that file and says so. '
            'Two things are deliberately missing: the audio credits (a CC-BY licence obliges us to name the author exactly) and dev-only text.', '']
    for rel in src_files():
        _code, hits = screen_strings(rel)
        if not hits: continue
        out.append(f'### {rel}')
        for i, (_a, _b, inner) in enumerate(hits, 1): out.append(f'- {i}: {inner}')
        out.append('')

def import_screens(sections):
    changed = skipped = 0
    for rel, block in (sections.get('Screens') or {}).items():
        path = os.path.join(SRC, rel)
        if not os.path.exists(path): print(f'  ! {rel}: gone, skipped'); skipped += 1; continue
        code, hits = screen_strings(rel)
        if len(hits) != len(block): print(f'  ! {rel}: {len(hits)} strings in the file, {len(block)} in the note — skipped (re-export first)'); skipped += 1; continue
        edits = []
        for i, (a, b, inner) in enumerate(hits, 1):
            want = block.get(str(i))
            if want is None or want == inner: continue
            edits.append((a, b, want))
        if not edits: continue
        for a, b, want in sorted(edits, reverse=True): code = code[:a + 1] + want + code[b:]
        open(path, 'w', encoding='utf-8').write(code); changed += len(edits)
    return changed, skipped

STAMP = os.path.join(ROOT, 'tools', '.copy_note.sha256')

def note_hash():
    try: return hashlib.sha256(open(NOTE, 'rb').read()).hexdigest()
    except FileNotFoundError: return None

def edited_since_export():
    """Has Cody touched the note since we last wrote it? Compares it against the hash stamped at the last export."""
    try: last = open(STAMP).read().strip()
    except FileNotFoundError: return False      # no stamp yet: nothing to compare against
    cur = note_hash()
    return cur is not None and cur != last

def export():
    out = ['---', 'tags: [personal, project, nomad, game, copy]', 'created: 2026-09-24', 'status: Cody editing; sync with `npm run copy:import`', '---', '',
           '# Nomad Trail: all the words', '',
           'Every line of copy in [[The Nomad Trail (game)]] \u2014 the data files **and** the text written into the scenes. **Edit the text after the colon; do not touch `###` ids or the `- key:` names.** Lists use ` | ` between entries. Line breaks inside a value are written as `\\n`. Keep `{placeholders}`.',
           '', 'To push edits into the game: `cd ~/repos/projects/nomad-trail && npm run copy:import` (then rebuild + push). To regenerate this note from the game: `npm run copy:export` (overwrites your edits, so import first).', '']
    for title, fn, idk, fields, note in SPECS:
        data = J(fn); out += [f'## {title}', '', note, '']
        for row in data:
            out.append(f'### {row[idk]}')
            for nk, jk, is_list in fields:
                if jk in row and row[jk] not in (None, ''): out.append(f'- {nk}: {enc(row[jk])}')
            # exceptions to mitigatedText for particular items (the umbrella does not 'go on')
            for item_id, line in (row.get('mitigatedTextBy') or {}).items(): out.append(f'- mitigatedText.{item_id}: {enc(line)}')
            # event choices
            for i, ch in enumerate([c for c in (row.get('choices') or []) if isinstance(c, dict)], 1):
                out.append(f'- choice{i}.label: {enc(ch.get("label", ""))}'); out.append(f'- choice{i}.text: {enc(ch.get("text", ""))}')
            out.append('')
    st = J('strings.json'); out += ['## Strings', '', st.get('_readme', ''), '']
    for group, vals in st.items():
        if group.startswith('_'): continue
        out.append(f'### {group}')
        for k, v in vals.items(): out.append(f'- {k}: {enc(v)}')
        out.append('')
    export_screens(out)
    open(NOTE, 'w', encoding='utf-8').write('\n'.join(out)); print(f'exported -> {NOTE}')
    open(STAMP, 'w').write(note_hash() or '')   # remember what we wrote, so the next export can tell if Cody edited it 

def parse_note():
    sections = {}; sec = None; blk = None
    for ln in open(NOTE, encoding='utf-8').read().split('\n'):
        if ln.startswith('## '): sec = ln[3:].strip(); sections[sec] = {}; blk = None
        elif ln.startswith('### ') and sec: blk = ln[4:].strip(); sections[sec][blk] = {}
        elif ln.startswith('- ') and sec and blk is not None:
            m = re.match(r'- ([\w.]+):\s?(.*)$', ln)
            if m: sections[sec][blk][m.group(1)] = m.group(2)   # raw: the data sections decode, the source section must not 
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
                v = [dec(x.strip()) for x in b[nk].split(' | ')] if is_list else dec(b[nk])
                if row.get(jk) != v: row[jk] = v; changed += 1
            for item_id in list((row.get('mitigatedTextBy') or {})):
                k = f'mitigatedText.{item_id}'
                if k in b and row['mitigatedTextBy'][item_id] != dec(b[k]): row['mitigatedTextBy'][item_id] = dec(b[k]); changed += 1
            for i, ch in enumerate(row.get('choices') or [], 1):
                for f in ('label', 'text'):
                    k = f'choice{i}.{f}'
                    if k in b and ch.get(f) != dec(b[k]): ch[f] = dec(b[k]); changed += 1
        W(fn, data)
    st = J('strings.json')
    for group, vals in sections.get('Strings', {}).items():
        if group in st and isinstance(st[group], dict):
            for k, v in vals.items():
                if k in st[group] and st[group][k] != dec(v): st[group][k] = dec(v); changed += 1
    W('strings.json', st)
    src_changed, skipped = import_screens(sections)
    print(f'imported: {changed} data field(s), {src_changed} string(s) in the scenes' + (f', {skipped} file(s) skipped' if skipped else ''))

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'export'
    if cmd == 'export':
        # Never overwrite edits. If the note has changed since we last wrote it, pull those changes into the game first.
        if edited_since_export() and '--discard-note-edits' not in sys.argv:
            print('the note has been edited since the last export: importing those changes first')
            imp()
        export()
    else:
        imp()
