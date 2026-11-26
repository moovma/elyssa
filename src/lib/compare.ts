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
 * `note` explains Elyssa's value. Owner decision (Nov 2026): this list leads with what Elyssa has on the board that
 * a bare ESP32-S3 board does not (same brain, plus sensors, battery, power and storage), and frames the pin count
 * honestly (fewer pins because those parts are already wired in). DevKitC-1 values: Espressif's official user guide.
 */
export const SPEC_ROWS: { label: string; plain: string; values: Record<BoardId, string>; note?: string }[] = [
  { label: 'Chip', plain: 'The brain', values: { elyssa: 'ESP32-S3, 2 cores, 240 MHz', devkit: 'ESP32-S3, 2 cores, 240 MHz', uno: 'ATmega328P, 8-bit, 16 MHz' }, note: 'The same brain as Espressif’s own board. Everything below is what Elyssa adds around it.' },
  { label: 'Motion sensor', plain: 'Feels every move', values: { elyssa: 'LSM6DS3TR-C, 6-axis + temperature', devkit: 'None', uno: 'None' }, note: 'Tilt, shake and turn, ready in one library (ElyssaIMU). No module, no wires.' },
  { label: 'Battery charging', plain: 'Runs on a battery', values: { elyssa: 'BQ24092 LiPo charger, about 540 mA', devkit: 'None', uno: 'None' }, note: 'Plug in one 3.7 V cell: it charges from USB and your project goes anywhere.' },
  { label: '3.3 V power', plain: 'Strong, steady power', values: { elyssa: 'TLV62569 buck, up to 2 A', devkit: 'LDO regulator', uno: '50 mA on the 3.3 V pin' }, note: 'An efficient step-down regulator with headroom for Wi-Fi, sensors and screens together. A power-OR stage keeps USB and battery from fighting.' },
  { label: 'microSD', plain: 'Saves your data', values: { elyssa: 'Socket on its own SPI bus', devkit: 'None', uno: 'None' }, note: 'Log days of data. The header SPI pins stay free.' },
  { label: 'Qwiic', plain: 'Click-in modules', values: { elyssa: 'Qwiic connector, pull-ups on board', devkit: 'None', uno: 'None' }, note: 'Add sensors and screens with one cable. No soldering.' },
  { label: 'Wireless', plain: 'Talks without cables', values: { elyssa: 'Wi-Fi 2.4 GHz + BLE 5', devkit: 'Wi-Fi 2.4 GHz + BLE 5', uno: 'None' }, note: 'On-board antenna, no extra module needed.' },
  { label: 'Lights', plain: 'Shows what is happening', values: { elyssa: 'RGB + power, TX, RX, charge LEDs', devkit: 'Addressable RGB + power LED', uno: 'Single-colour LED' }, note: 'You see power, data and charging at a glance.' },
  { label: 'USB', plain: 'The cable plug', values: { elyssa: 'USB-C, native', devkit: '2 ports (native + serial)', uno: 'USB-B (serial chip)' }, note: 'Code, power, charging and Serial Monitor over one cable.' },
  { label: 'Memory', plain: 'Room for your program', values: { elyssa: '8 MB flash · 512 KB RAM', devkit: '8 MB+ flash · 512 KB RAM (+ PSRAM on some)', uno: '32 KB flash · 2 KB RAM' }, note: 'Room for big sketches, web pages and sensor logs.' },
  { label: 'Free pins', plain: 'Pins for your project', values: { elyssa: '22 · 10 analog · 10 touch', devkit: '44 · nothing built in', uno: '32 sockets · 6 analog' }, note: 'Fewer pins, because the motion sensor, charger, card slot and LEDs are already wired inside: you need fewer pins to begin with.' },
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
