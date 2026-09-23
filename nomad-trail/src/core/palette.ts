// The Nomad Trail palette: 32 colors, modern 8-bit (Katana ZERO twilight + Dave the Diver daylight). Use ONLY these.
export const PAL = {
  night0: 0x0b0f1a, night1: 0x141a2e, night2: 0x1f2a48, night3: 0x2e3d66,
  dusk0: 0x3b2a5a, dusk1: 0x5a2f6e, dusk2: 0x8b3a7a, dusk3: 0xc4457a,
  sun0: 0xe8663d, sun1: 0xf29e4c, sun2: 0xf7cf6b, sun3: 0xfff2b0,
  sky0: 0x2b6cb0, sky1: 0x4a9bd6, sky2: 0x8fd3f4, sky3: 0xdff6ff,
  sea0: 0x0f4c5c, sea1: 0x1b7f8c, sea2: 0x35b3a9, sea3: 0x9fe7d8,
  grass0: 0x2f5d3a, grass1: 0x4f8a4b, grass2: 0x8cc46b, grass3: 0xd6e8a0,
  earth0: 0x3d2b1f, earth1: 0x6b4a32, earth2: 0xa8794e, earth3: 0xe0b98a,
  ink: 0x0a0a12, gray0: 0x3a3f4b, gray1: 0x6e7484, gray2: 0xb4b9c4, white: 0xf4f1ea,
  red: 0xd63c3c, neon: 0x3ef0c8, pink: 0xff6fa8,
} as const;
export type PalKey = keyof typeof PAL;
export const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
export const PAL_LIST: number[] = Object.values(PAL);
