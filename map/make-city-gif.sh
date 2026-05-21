#!/usr/bin/env bash
# Convert a city .mp4 into a transparent, looping GIF.
# Usage: ./make-city-gif.sh <cityname> [filterColor] [filterStrength] [REVERSE] [BG_FLOODFILL] [FADE_FRAMES]
#   cityname        Required. Basename (looks for <cityname>.mp4 in cwd) OR a path to an .mp4.
#   filterColor     Color to key out. Hex (#rrggbb / 0xrrggbb / rrggbb) or a named color
#                   like 'white', 'black', 'cyan'. Default: 4dd0e1
#   filterStrength  similarity:blend for chromakey (ignored if BG_FLOODFILL=1). Default: 0.10:0.04
#   REVERSE         1 = boomerang (forward+reverse), 0 = forward only. Default: 0
#                   Ignored if FADE_FRAMES > 0.
#   BG_FLOODFILL    1 = per-frame mask: for each frame, mark as background only the pixels of
#                   filterColor that are connected to the frame border (preserves moving
#                   interior content like foam/steam). Requires python3 + numpy/scipy/Pillow.
#                   0 = use chromakey (original behavior). Default: 0
#   FADE_FRAMES     >0 = append a smooth crossfade from the last frame back to the first frame,
#                   spread over this many frames (at 12 fps, e.g. 24 = 2-second fade). Makes the
#                   GIF loop seamlessly. Default: 0
#
# Env vars (optional):
#   CITYGIF_BRIGHTNESS  ffmpeg eq brightness, -1.0..1.0. Default: 0
#   CITYGIF_SATURATION  ffmpeg eq saturation, 0..3.   Default: 1
#   CITYGIF_TOL         Floodfill: per-channel tolerance for background pixels. Default: 28
#   CITYGIF_DILATE      Floodfill: pixels to grow background mask. Default: 1
#
# Output: <script-dir>/images/<cityname>.gif

set -euo pipefail

cityname="${1:-}"
filterColor="${2:-4dd0e1}"
filterStrength="${3:-0.10:0.04}"
REVERSE="${4:-0}"
BG_FLOODFILL="${5:-0}"
FADE_FRAMES="${6:-0}"

if [ -z "$cityname" ]; then
  echo "Usage: $0 <cityname> [filterColor] [filterStrength] [REVERSE] [BG_FLOODFILL] [FADE_FRAMES]" >&2
  exit 1
fi

if [ "$FADE_FRAMES" -gt 0 ] && [ "$REVERSE" -eq 1 ]; then
  echo "Note: FADE_FRAMES > 0 takes precedence; ignoring REVERSE=1." >&2
  REVERSE=0
fi

normalize_color() {
  local c="$1"
  c="${c#\#}"; c="${c#0x}"; c="${c#0X}"
  case "$(echo "$c" | tr '[:upper:]' '[:lower:]')" in
    white)   echo "ffffff" ;;
    black)   echo "000000" ;;
    red)     echo "ff0000" ;;
    green)   echo "00ff00" ;;
    blue)    echo "0000ff" ;;
    cyan)    echo "00ffff" ;;
    magenta) echo "ff00ff" ;;
    yellow)  echo "ffff00" ;;
    gray|grey) echo "808080" ;;
    *)
      if [[ "$c" =~ ^[0-9a-fA-F]{6}$ ]]; then echo "$c"
      else echo "ERROR: unrecognized color '$1'" >&2; return 1; fi
      ;;
  esac
}

filterColor="$(normalize_color "$filterColor")"

if [[ "$cityname" == *.mp4 || "$cityname" == */* ]]; then
  INPUT="$cityname"
  base="$(basename "$cityname")"
  cityname="${base%.mp4}"
else
  INPUT="${cityname}.mp4"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/images"
OUTPUT="${OUTPUT_DIR}/${cityname}.gif"
PALETTE="$(mktemp -t citygif_palette.XXXXXX).png"
WORK_DIR=""
trap '[ -n "$WORK_DIR" ] && rm -rf "$WORK_DIR"; rm -f "$PALETTE"' EXIT

[ -f "$INPUT" ] || { echo "ERROR: input file not found: $INPUT" >&2; exit 1; }
mkdir -p "$OUTPUT_DIR"

PRE="crop=min(iw\,ih):min(iw\,ih):(iw-min(iw\,ih))/2:(ih-min(iw\,ih))/2,fps=12,scale=600:-1:flags=lanczos"

# Optional color adjust via ffmpeg eq filter.
BRIGHTNESS="${CITYGIF_BRIGHTNESS:-0}"
SATURATION="${CITYGIF_SATURATION:-1}"
EQ_INFIX=""        # ",eq=..."  inserted between existing filters
EQ_OR_PASS="null"  # "eq=..."   used where a leading filter is needed
if [ "$BRIGHTNESS" != "0" ] || [ "$SATURATION" != "1" ]; then
  EQ_FILTER="eq=brightness=${BRIGHTNESS}:saturation=${SATURATION}"
  EQ_INFIX=",${EQ_FILTER}"
  EQ_OR_PASS="${EQ_FILTER}"
fi

if [ "$FADE_FRAMES" -gt 0 ]; then
  WORK_DIR="$(mktemp -d -t citygif_work.XXXXXX)"
  KEY_DIR="$WORK_DIR/keyed"
  mkdir -p "$KEY_DIR"

  if [ "$BG_FLOODFILL" -eq 1 ]; then
    RAW_DIR="$WORK_DIR/raw"; mkdir -p "$RAW_DIR"
    echo "Extracting frames..."
    ffmpeg -y -loglevel error -i "$INPUT" -vf "$PRE" "$RAW_DIR/%04d.png"
    echo "Building per-frame alpha masks..."
    python3 - "$RAW_DIR" "$KEY_DIR" "$filterColor" <<'PY'
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage
raw_dir, out_dir, hex_color = sys.argv[1], sys.argv[2], sys.argv[3]
target = np.array([int(hex_color[i:i+2], 16) for i in (0, 2, 4)], dtype=np.int16)
TOL = int(os.environ.get("CITYGIF_TOL", "28"))
DILATE = int(os.environ.get("CITYGIF_DILATE", "1"))
for p in sorted(glob.glob(os.path.join(raw_dir, "*.png"))):
    img = np.array(Image.open(p).convert('RGB'))
    diff = np.abs(img.astype(np.int16) - target)
    close = np.all(diff <= TOL, axis=-1)
    labels, _ = ndimage.label(close)
    border = set()
    for row in (labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]):
        border.update(row.tolist())
    border.discard(0)
    bg = np.isin(labels, list(border))
    if DILATE > 0:
        bg = ndimage.binary_dilation(bg, iterations=DILATE)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    rgba = np.dstack([img, alpha])
    Image.fromarray(rgba, mode='RGBA').save(os.path.join(out_dir, os.path.basename(p)))
PY
  else
    echo "Extracting chromakey'd frames..."
    ffmpeg -y -loglevel error -i "$INPUT" \
      -vf "format=rgba,chromakey=0x${filterColor}:${filterStrength},${PRE}" \
      "$KEY_DIR/%04d.png"
  fi

  echo "Generating $FADE_FRAMES fade frames..."
  python3 - "$KEY_DIR" "$FADE_FRAMES" <<'PY'
import sys, os, glob
import numpy as np
from PIL import Image
key_dir, K = sys.argv[1], int(sys.argv[2])
paths = sorted(glob.glob(os.path.join(key_dir, "*.png")))
N = len(paths)
first = np.array(Image.open(paths[0]).convert("RGBA"), dtype=np.float32)
last  = np.array(Image.open(paths[-1]).convert("RGBA"), dtype=np.float32)
# K fade frames between last (k=0) and first (loop boundary). Step t = k/(K+1).
for k in range(1, K + 1):
    t = k / (K + 1)
    blend = (1 - t) * last + t * first
    blend = np.clip(blend, 0, 255).astype(np.uint8)
    Image.fromarray(blend, mode="RGBA").save(os.path.join(key_dir, f"{N + k:04d}.png"))
print(f"total frames: {N + K}", file=sys.stderr)
PY

  echo "PASS 1: palette..."
  ffmpeg -y -loglevel error -framerate 12 -i "$KEY_DIR/%04d.png" \
    -filter_complex "${EQ_OR_PASS},palettegen=reserve_transparent=1[pal]" \
    -map "[pal]" -frames:v 1 "$PALETTE"
  echo "PASS 2: render..."
  ffmpeg -y -loglevel error -framerate 12 -i "$KEY_DIR/%04d.png" -i "$PALETTE" \
    -filter_complex "${EQ_OR_PASS}[fg];[fg][1:v]paletteuse=dither=bayer:bayer_scale=5:alpha_threshold=128" \
    -gifflags -offsetting -loop 0 "$OUTPUT"

  echo "Wrote $OUTPUT"
  exit 0
fi

if [ "$BG_FLOODFILL" -eq 1 ]; then
  WORK_DIR="$(mktemp -d -t citygif_work.XXXXXX)"
  RAW_DIR="$WORK_DIR/raw"; KEY_DIR="$WORK_DIR/keyed"
  mkdir -p "$RAW_DIR" "$KEY_DIR"

  echo "Extracting frames..."
  ffmpeg -y -loglevel error -i "$INPUT" -vf "$PRE" "$RAW_DIR/%04d.png"

  echo "Building per-frame alpha masks..."
  python3 - "$RAW_DIR" "$KEY_DIR" "$filterColor" <<'PY'
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage

raw_dir, out_dir, hex_color = sys.argv[1], sys.argv[2], sys.argv[3]
target = np.array([int(hex_color[i:i+2], 16) for i in (0, 2, 4)], dtype=np.int16)
# Per-channel tolerance for "background-ish" pixels. Tune via env if needed.
TOL = int(os.environ.get("CITYGIF_TOL", "28"))
# How many pixels to dilate the background mask (softens halos).
DILATE = int(os.environ.get("CITYGIF_DILATE", "1"))

paths = sorted(glob.glob(os.path.join(raw_dir, "*.png")))
for i, p in enumerate(paths):
    img = np.array(Image.open(p).convert('RGB'))
    diff = np.abs(img.astype(np.int16) - target)
    close = np.all(diff <= TOL, axis=-1)
    labels, _ = ndimage.label(close)
    border = set()
    border.update(labels[0, :].tolist())
    border.update(labels[-1, :].tolist())
    border.update(labels[:, 0].tolist())
    border.update(labels[:, -1].tolist())
    border.discard(0)
    bg = np.isin(labels, list(border))
    if DILATE > 0:
        bg = ndimage.binary_dilation(bg, iterations=DILATE)
    alpha = np.where(bg, 0, 255).astype(np.uint8)
    rgba = np.dstack([img, alpha])
    Image.fromarray(rgba, mode='RGBA').save(os.path.join(out_dir, os.path.basename(p)))
print(f"processed {len(paths)} frames", file=sys.stderr)
PY

  if [ "$REVERSE" -eq 1 ]; then
    PAL_CHAIN="${EQ_OR_PASS},split[fwd][t];[t]reverse[rev];[rev]select='not(eq(n\,0))',setpts=N/FRAME_RATE/TB[rev2];[fwd][rev2]concat=n=2:v=1:a=0,palettegen=reserve_transparent=1[pal]"
    RENDER_CHAIN="${EQ_OR_PASS},split[fwd][t];[t]reverse[rev];[rev]select='not(eq(n\,0))',setpts=N/FRAME_RATE/TB[rev2];[fwd][rev2]concat=n=2:v=1:a=0[fg];[fg][1:v]paletteuse=dither=bayer:bayer_scale=5:alpha_threshold=128"
  else
    PAL_CHAIN="${EQ_OR_PASS},palettegen=reserve_transparent=1[pal]"
    RENDER_CHAIN="${EQ_OR_PASS}[fg];[fg][1:v]paletteuse=dither=bayer:bayer_scale=5:alpha_threshold=128"
  fi

  printf '%s\n' "$PAL_CHAIN"
  printf '%s\n' "$RENDER_CHAIN"

  echo "PASS 1: palette..."
  ffmpeg -y -loglevel error -framerate 12 -i "$KEY_DIR/%04d.png" \
    -filter_complex "$PAL_CHAIN" -map "[pal]" -frames:v 1 "$PALETTE"
  echo "PASS 2: render..."
  ffmpeg -y -loglevel error -framerate 12 -i "$KEY_DIR/%04d.png" -i "$PALETTE" \
    -filter_complex "$RENDER_CHAIN" -gifflags -offsetting -loop 0 "$OUTPUT"
else
  KEY="format=rgba,chromakey=0x${filterColor}:${filterStrength},${PRE}"
  if [ "$REVERSE" -eq 1 ]; then
    BODY="${KEY},split[fwd][t];[t]reverse[rev];[rev]select='not(eq(n\,0))',setpts=N/FRAME_RATE/TB[rev2];[fwd][rev2]concat=n=2:v=1:a=0"
  else
    BODY="$KEY"
  fi
  PAL_CHAIN="${BODY}${EQ_INFIX},palettegen=reserve_transparent=1[pal]"
  RENDER_CHAIN="${BODY}${EQ_INFIX}[fg];[fg][1:v]paletteuse=dither=bayer:bayer_scale=5:alpha_threshold=128"

  printf '%s\n' "$PAL_CHAIN"
  printf '%s\n' "$RENDER_CHAIN"

  ffmpeg -y -loglevel error -i "$INPUT" \
    -filter_complex "$PAL_CHAIN" -map "[pal]" -frames:v 1 "$PALETTE"
  ffmpeg -y -loglevel error -i "$INPUT" -i "$PALETTE" \
    -filter_complex "$RENDER_CHAIN" -gifflags -offsetting -loop 0 "$OUTPUT"
fi

echo "Wrote $OUTPUT"
