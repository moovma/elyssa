/**
 * Data for the board comparison on /elyssa ("Which board is ready for your idea?").
 * Written so a 7-year-old can follow it: plain words first, the technical name second.
 *
 * Elyssa facts: schematic, repo README and src/lib/elyssa-docs.ts.
 * ESP32-S3-DevKitC-1 facts: Espressif's official user guide. Arduino Uno R3 facts: Arduino's official tech specs.
 * Keep it fair: every board shows where it really wins. No prices, no invented numbers.
 */

export type BoardId = 'elyssa' | 'devkit' | 'uno';

export interface BoardInfo {
  id: BoardId;
  name: string;
  short: string;
  /** One honest line on what this board is great at. */
  strength: string;
}

export const BOARDS: BoardInfo[] = [
  { id: 'elyssa', name: 'Elyssa', short: 'Elyssa', strength: 'Has the most things already inside.' },
  { id: 'devkit', name: 'ESP32-S3-DevKitC-1', short: 'DevKitC-1', strength: 'Has the most pins.' },
  { id: 'uno', name: 'Arduino Uno R3', short: 'Uno R3', strength: 'Works with 5 V parts and has tons of tutorials.' },
];

/** Extra parts you would buy and wire to get a feature the board does not have. */
export type AddonId =
  | 'wifi' | 'imu' | 'charger' | 'boost' | 'sd' | 'qwiic' | 'rgb' | 'touch' | 'shifter' | 'expander';

export interface Addon {
  id: AddonId;
  label: string;
  /** Typical number of jumper wires to connect it (an estimate, shown with "about"). */
  wires: number;
}

export const ADDONS: Record<AddonId, Addon> = {
  wifi: { id: 'wifi', label: 'Wi-Fi / Bluetooth module', wires: 4 },
  imu: { id: 'imu', label: 'Motion sensor module', wires: 4 },
  charger: { id: 'charger', label: 'Battery charger module', wires: 4 },
  boost: { id: 'boost', label: '5 V boost converter', wires: 4 },
  sd: { id: 'sd', label: 'Memory card module', wires: 6 },
  qwiic: { id: 'qwiic', label: 'Qwiic adapter', wires: 4 },
  rgb: { id: 'rgb', label: 'Colour LED + 3 resistors', wires: 4 },
  touch: { id: 'touch', label: 'Touch sensor module', wires: 3 },
  shifter: { id: 'shifter', label: 'Level shifter (3.3 V to 5 V)', wires: 6 },
  expander: { id: 'expander', label: 'Pin expander', wires: 4 },
};

export type NeedId =
  | 'wireless' | 'motion' | 'battery' | 'logging' | 'plugin' | 'colour' | 'touch' | 'fiveV' | 'manyPins';

export interface Need {
  id: NeedId;
  /** Plain words. */
  label: string;
  /** Grown-up name, shown small. */
  tech: string;
  /** Extra parts each board needs for this (empty = already inside). */
  extras: Record<BoardId, AddonId[]>;
}

export const NEEDS: Need[] = [
  { id: 'wireless', label: 'Talk to a phone or Wi-Fi', tech: 'Wi-Fi + Bluetooth', extras: { elyssa: [], devkit: [], uno: ['wifi'] } },
  { id: 'motion', label: 'Feel moves and shakes', tech: 'Motion sensor', extras: { elyssa: [], devkit: ['imu'], uno: ['imu'] } },
  { id: 'battery', label: 'Run on a battery', tech: 'LiPo charger', extras: { elyssa: [], devkit: ['charger'], uno: ['charger', 'boost'] } },
  { id: 'logging', label: 'Save things on a memory card', tech: 'microSD', extras: { elyssa: [], devkit: ['sd'], uno: ['sd'] } },
  { id: 'plugin', label: 'Click in sensors, no soldering', tech: 'Qwiic port', extras: { elyssa: [], devkit: ['qwiic'], uno: ['qwiic'] } },
  { id: 'colour', label: 'Glow in any colour', tech: 'RGB LED', extras: { elyssa: [], devkit: [], uno: ['rgb'] } },
  { id: 'touch', label: 'Feel your finger', tech: 'Touch pins', extras: { elyssa: [], devkit: [], uno: ['touch'] } },
  { id: 'fiveV', label: 'Use old 5 V parts', tech: '5 V logic', extras: { elyssa: ['shifter'], devkit: ['shifter'], uno: [] } },
  { id: 'manyPins', label: 'Connect lots of things (20+ pins)', tech: 'Many I/O pins', extras: { elyssa: ['expander'], devkit: [], uno: ['expander'] } },
];

export interface Preset {
  id: string;
  label: string;
  /** A tiny line that says what it is. */
  hint: string;
  needs: NeedId[];
}

export const PRESETS: Preset[] = [
  { id: 'watch', label: 'A smart watch', hint: 'Counts steps, talks to your phone', needs: ['wireless', 'motion', 'battery', 'colour'] },
  { id: 'weather', label: 'A weather station', hint: 'Measures and remembers the weather', needs: ['wireless', 'logging', 'plugin', 'battery'] },
  { id: 'remote', label: 'A magic remote', hint: 'Wave it to control things', needs: ['wireless', 'motion', 'battery', 'touch'] },
  { id: 'lamp', label: 'A touch lamp', hint: 'Touch it, it changes colour', needs: ['colour', 'touch'] },
];

/**
 * Spec by spec, shown one at a time as you scroll. `plain` is the kid-friendly name, `label` the grown-up one,
 * `note` explains Elyssa's value. Built-in parts (motion sensor, charger, microSD, Qwiic) are not repeated here:
 * step 2 and the 3D anatomy already cover them.
 */
export const SPEC_ROWS: { label: string; plain: string; values: Record<BoardId, string>; note?: string }[] = [
  { label: 'Chip', plain: 'The brain', values: { elyssa: 'ESP32-S3, 2 cores, 240 MHz', devkit: 'ESP32-S3, 2 cores, 240 MHz', uno: 'ATmega328P, 8-bit, 16 MHz' }, note: 'Plenty fast for real projects.' },
  { label: 'Flash', plain: 'Room for your program', values: { elyssa: '8 MB', devkit: '8 MB or more (by version)', uno: '32 KB' }, note: 'Room for big sketches (no PSRAM).' },
  { label: 'RAM', plain: 'Short-term memory', values: { elyssa: '512 KB', devkit: '512 KB (+ PSRAM on some versions)', uno: '2 KB' } },
  { label: 'Wireless', plain: 'Talks without cables', values: { elyssa: 'Wi-Fi 2.4 GHz + BLE 5', devkit: 'Wi-Fi 2.4 GHz + BLE 5', uno: 'None' }, note: 'On-board antenna, no extra module needed.' },
  { label: 'LED', plain: 'Built-in light', values: { elyssa: 'RGB, 3 channels', devkit: 'Addressable RGB', uno: 'Single-colour LED' }, note: 'Plus power, TX, RX and charge lights.' },
  { label: 'USB', plain: 'The cable plug', values: { elyssa: 'USB-C, native', devkit: '2 ports (native + serial)', uno: 'USB-B (serial chip)' }, note: 'Code, power and Serial Monitor over one cable.' },
  { label: 'Logic level', plain: 'Signal voltage', values: { elyssa: '3.3 V', devkit: '3.3 V', uno: '5 V' }, note: 'Use a level shifter for 5 V parts.' },
  { label: 'Header pins', plain: 'Pins to connect things', values: { elyssa: '22', devkit: '44 (2 × 22)', uno: '32 sockets' }, note: 'IO0 to IO6, I2C, SPI, UART and 3 PWM outputs.' },
  { label: 'Analog inputs', plain: 'Pins that measure', values: { elyssa: '10, 12-bit', devkit: 'Up to 20, 12-bit', uno: '6, 10-bit' }, note: 'IO0 to IO6 keep working with Wi-Fi on.' },
  { label: 'Touch pins', plain: 'Pins that feel your finger', values: { elyssa: '10', devkit: 'Up to 14', uno: 'None' } },
];

/** Extra parts a board needs for a set of needs (no duplicates, stable order). */
export function extrasFor(board: BoardId, needs: NeedId[]): AddonId[] {
  const out: AddonId[] = [];
  for (const n of NEEDS) {
    if (!needs.includes(n.id)) continue;
    for (const a of n.extras[board]) if (!out.includes(a)) out.push(a);
  }
  return out;
}
