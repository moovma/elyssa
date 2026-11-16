/**
 * Data for the "How it compares" section on /elyssa.
 * Elyssa facts come from src/lib/elyssa-docs.ts / the schematic. The other two boards use the public specs of the
 * official Espressif ESP32-S3-DevKitC-1 and the Arduino Uno R3.
 */

export type BoardKey = 'uno' | 'devkit' | 'elyssa';
export type FeatureKey = 'wireless' | 'motion' | 'battery' | 'microsd' | 'qwiic' | 'rgb';

/** The six things Elyssa has on the board. Used for the "built in" meter and the project builder. */
export const FEATURES: { key: FeatureKey; name: string; addOn: string }[] = [
  { key: 'wireless', name: 'Wi-Fi + Bluetooth', addOn: 'Wi-Fi / Bluetooth module' },
  { key: 'motion', name: 'Motion sensor', addOn: '6-axis motion sensor module' },
  { key: 'battery', name: 'LiPo charger', addOn: 'LiPo charger module' },
  { key: 'microsd', name: 'microSD', addOn: 'microSD card module' },
  { key: 'qwiic', name: 'Qwiic connector', addOn: 'Jumper wires for every sensor (no Qwiic)' },
  { key: 'rgb', name: 'RGB LED', addOn: 'RGB LED + resistors' },
];

export interface CompareBoard {
  key: BoardKey;
  name: string;
  persona: string; // the analogy
  verdict: string; // weak / smart / strong in two or three words
  story: string;
  brain: string; // the facts behind the brain meter
  brainScore: number; // cores × MHz, 0..1 relative to the ESP32-S3 (2 × 240 MHz)
  memory: string;
  builtIn: FeatureKey[];
}

export const COMPARE_BOARDS: CompareBoard[] = [
  {
    key: 'uno',
    name: 'Arduino Uno R3',
    persona: 'The old-timer',
    verdict: 'Weak and slow',
    story: 'A legend for a first blink. But it thinks slowly, remembers little and cannot talk without wires. Every new idea means another module.',
    brain: '1 core · 8-bit · 16 MHz',
    brainScore: 16 / 480,
    memory: '32 KB flash · 2 KB RAM',
    builtIn: [],
  },
  {
    key: 'devkit',
    name: 'ESP32-S3 DevKit',
    persona: 'The genius with empty hands',
    verdict: 'Smart, but weak',
    story: 'The same fast ESP32-S3 brain as Elyssa. But no motion sensor, no battery charger, no microSD: you buy the rest and wire it yourself.',
    brain: '2 cores · 32-bit · 240 MHz',
    brainScore: 1,
    memory: '8 MB+ flash · 512 KB RAM',
    builtIn: ['wireless', 'rgb'],
  },
  {
    key: 'elyssa',
    name: 'Elyssa',
    persona: 'The all-rounder',
    verdict: 'Smart and strong',
    story: 'The same fast brain, plus the muscle: motion sensing, LiPo charging, microSD, Qwiic and an RGB LED, all on one board. Plug in and build.',
    brain: '2 cores · 32-bit · 240 MHz',
    brainScore: 1,
    memory: '8 MB flash · 512 KB RAM',
    builtIn: ['wireless', 'motion', 'battery', 'microsd', 'qwiic', 'rgb'],
  },
];

export interface CompareProject {
  key: string;
  name: string;
  needs: FeatureKey[];
}

/** Real project ideas and the on-board features each one needs. */
export const PROJECTS: CompareProject[] = [
  { key: 'steps', name: 'Wearable step counter', needs: ['motion', 'battery', 'wireless'] },
  { key: 'lamp', name: 'Phone-controlled lamp', needs: ['wireless', 'rgb'] },
  { key: 'logger', name: 'Garden data logger', needs: ['qwiic', 'microsd', 'battery', 'wireless'] },
  { key: 'controller', name: 'Motion game controller', needs: ['motion', 'wireless', 'battery', 'rgb'] },
  { key: 'all', name: 'Everything at once', needs: ['wireless', 'motion', 'battery', 'microsd', 'qwiic', 'rgb'] },
];

export function missingFor(board: CompareBoard, project: CompareProject): FeatureKey[] {
  return project.needs.filter((f) => !board.builtIn.includes(f));
}

export const addOnName = (f: FeatureKey) => FEATURES.find((x) => x.key === f)?.addOn ?? f;

/** Full spec table (null = not on the board). */
export const SPEC_ROWS: { name: string; uno: string | null; devkit: string | null; elyssa: string | null }[] = [
  { name: 'Brain', elyssa: 'ESP32-S3, dual-core 240 MHz', devkit: 'ESP32-S3, dual-core 240 MHz', uno: 'ATmega328P, 8-bit 16 MHz' },
  { name: 'Memory', elyssa: '8 MB flash', devkit: '8 – 32 MB flash, PSRAM on some versions', uno: '32 KB flash, 2 KB RAM' },
  { name: 'Wireless', elyssa: 'Wi-Fi 2.4 GHz + BLE 5', devkit: 'Wi-Fi 2.4 GHz + BLE 5', uno: null },
  { name: 'Motion sensor', elyssa: '6-axis IMU built in', devkit: null, uno: null },
  { name: 'Battery', elyssa: 'LiPo charger built in', devkit: null, uno: null },
  { name: 'microSD', elyssa: 'Slot on the back', devkit: null, uno: null },
  { name: 'Qwiic', elyssa: 'Yes', devkit: null, uno: null },
  { name: 'Built-in light', elyssa: 'RGB LED + status LEDs', devkit: 'Addressable RGB LED', uno: 'One LED + status LEDs' },
  { name: 'Pins', elyssa: '22-pin header + Qwiic', devkit: '2 × 22-pin headers', uno: '14 digital + 6 analog' },
  { name: 'Analog inputs', elyssa: '12-bit', devkit: '12-bit', uno: '10-bit' },
  { name: 'Touch pins', elyssa: '10', devkit: 'Yes', uno: null },
  { name: 'Logic level', elyssa: '3.3 V', devkit: '3.3 V', uno: '5 V' },
  { name: 'Arduino IDE', elyssa: 'Yes, with LED and motion helpers', devkit: 'Yes', uno: 'Yes' },
];
