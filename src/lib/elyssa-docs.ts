/**
 * Technical data for Elyssa v5.
 * Source: https://github.com/moovma/Elyssa-dev-board (README.md, TIPS_AND_KNOWN_ISSUES.md,
 * platform/variants/elyssa/pins_arduino.h). Rows marked `chip` come from the ESP32-S3 datasheet.
 */

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'moovma@gmail.com';
export const REPO_URL = 'https://github.com/moovma/Elyssa-dev-board';
export const REPO_BLOB = `${REPO_URL}/blob/main`;

export const SCHEMATIC_PDF = '/elyssa_images/elyssa_schematic.pdf';
export const BOARD_TOP_IMG = '/elyssa_images/elyssa_top.png';
export const BOARD_BOTTOM_IMG = '/elyssa_images/elyssa_buttom.png';

export type PinKind = 'power' | 'gpio' | 'comm' | 'pwm';

export interface HeaderPin {
  n: number;
  label: string; // silkscreen label
  kind: PinKind;
  gpio?: number;
  detail: string;
}

/** Header J12, top to bottom as printed on the right edge of the board (top view). */
export const HEADER_PINS: HeaderPin[] = [
  { n: 1, label: 'Gnd', kind: 'power', detail: 'Ground' },
  { n: 2, label: 'Tx', kind: 'comm', gpio: 43, detail: 'UART TX' },
  { n: 3, label: 'Rx', kind: 'comm', gpio: 44, detail: 'UART RX' },
  { n: 4, label: 'IO0', kind: 'gpio', gpio: 1, detail: 'A0 · T0 · digital' },
  { n: 5, label: 'IO1', kind: 'gpio', gpio: 2, detail: 'A1 · T1 · digital' },
  { n: 6, label: 'IO2', kind: 'gpio', gpio: 3, detail: 'A2 · T2 · digital' },
  { n: 7, label: 'IO3', kind: 'gpio', gpio: 4, detail: 'A3 · T3 · digital' },
  { n: 8, label: 'IO4', kind: 'gpio', gpio: 5, detail: 'A4 · T4 · digital' },
  { n: 9, label: 'IO5', kind: 'gpio', gpio: 6, detail: 'A5 · T5 · digital' },
  { n: 10, label: 'IO6', kind: 'gpio', gpio: 7, detail: 'A6 · T6 · BAT_SENSE (JP3)' },
  { n: 11, label: '+3.3', kind: 'power', detail: '3.3 V rail' },
  { n: 12, label: 'Gnd', kind: 'power', detail: 'Ground' },
  { n: 13, label: 'PWM1', kind: 'pwm', gpio: 14, detail: 'PWM · or touch T10' },
  { n: 14, label: 'PWM2', kind: 'pwm', gpio: 47, detail: 'PWM' },
  { n: 15, label: 'PWM3', kind: 'pwm', gpio: 48, detail: 'PWM' },
  { n: 16, label: 'MISO', kind: 'comm', gpio: 37, detail: 'SPI MISO' },
  { n: 17, label: 'CLK', kind: 'comm', gpio: 36, detail: 'SPI SCK' },
  { n: 18, label: 'MOSI', kind: 'comm', gpio: 35, detail: 'SPI MOSI' },
  { n: 19, label: 'CS', kind: 'comm', gpio: 34, detail: 'SPI SS' },
  { n: 20, label: 'SCL', kind: 'comm', gpio: 9, detail: 'I2C SCL · A9 · T9' },
  { n: 21, label: 'SDA', kind: 'comm', gpio: 8, detail: 'I2C SDA · A8 · T8' },
  { n: 22, label: 'Vin', kind: 'power', detail: 'Supply input / output' },
];

export type Safety = 'safe' | 'caution' | 'reserved';

export interface PinSafety {
  pin: string;
  gpio: string;
  sketch: string;
  safety: Safety;
  useFor: string;
  note: string;
}

export const PIN_SAFETY: PinSafety[] = [
  {
    pin: 'IO0 – IO5',
    gpio: '1 – 6',
    sketch: 'IO0…IO5 · A0…A5 · T0…T5',
    safety: 'safe',
    useFor: 'Analog (ADC1), touch, digital in/out',
    note: 'ADC1 keeps working while Wi-Fi is on. Best general-purpose pins on the board.',
  },
  {
    pin: 'IO6',
    gpio: '7',
    sketch: 'IO6 · A6 · T6 · BAT_SENSE',
    safety: 'caution',
    useFor: 'Analog, touch, digital, or battery sense',
    note: 'Shared with BAT_SENSE. If solder jumper JP3 is bridged (open by default) do not use IO6 for anything else.',
  },
  {
    pin: 'SDA / SCL',
    gpio: '8 / 9',
    sketch: 'SDA · SCL (A8/A9, T8/T9)',
    safety: 'caution',
    useFor: 'I2C on the header and the Qwiic connector',
    note: '4.7 kΩ pull-ups are already on the board. Avoid touch or other loads on these pins when I2C is in use.',
  },
  {
    pin: 'Tx / Rx',
    gpio: '43 / 44',
    sketch: 'TX · RX',
    safety: 'safe',
    useFor: 'UART to external devices',
    note: 'Serial Monitor uses native USB (USB CDC), so these header pins are free for a second UART.',
  },
  {
    pin: 'CS / MOSI / CLK / MISO',
    gpio: '34 / 35 / 36 / 37',
    sketch: 'SS(CS) · MOSI · SCK(CLK) · MISO',
    safety: 'safe',
    useFor: 'SPI on the header (default SPI bus)',
    note: 'Separate from the microSD bus. The ESP32-S3FN8 has no PSRAM, so these GPIOs are free.',
  },
  {
    pin: 'PWM1',
    gpio: '14',
    sketch: 'PWM1 · T10',
    safety: 'caution',
    useFor: 'PWM output, or touch',
    note: 'PWM1 and T10 are the same pin: use it for touch or PWM, never both.',
  },
  {
    pin: 'PWM2 / PWM3',
    gpio: '47 / 48',
    sketch: 'PWM2 · PWM3',
    safety: 'safe',
    useFor: 'PWM, digital in/out',
    note: 'Follow the silkscreen. Not yet checked against a board: tell Moovma if you find them swapped.',
  },
  {
    pin: 'BOOT button',
    gpio: '0',
    sketch: 'BOOT_BUTTON',
    safety: 'reserved',
    useFor: 'Reads LOW when pressed',
    note: 'Strapping pin. Holding it low at reset enters download mode. Do not drive it externally at boot.',
  },
  {
    pin: 'RGB LED red / green / blue',
    gpio: '39 / 38 / 33',
    sketch: 'LED_RED · LED_GREEN (LED_BUILTIN) · LED_BLUE',
    safety: 'reserved',
    useFor: 'On-board RGB LED (active high, 330 Ω)',
    note: 'GPIO39 is also the JTAG clock: the red LED lights during uploads. This is normal.',
  },
  {
    pin: 'microSD socket',
    gpio: '10 / 11 / 12 / 13',
    sketch: 'SD_CS · SD_MOSI · SD_SCK · SD_MISO',
    safety: 'reserved',
    useFor: 'microSD on its own SPI bus',
    note: 'Wired to the socket on the back of the board; not on the header.',
  },
  {
    pin: 'IMU (LSM6DS3TR-C)',
    gpio: '17 / 18 / 21',
    sketch: 'SDA_gyro · SCL_gyro · INT_gyro',
    safety: 'reserved',
    useFor: 'Internal I2C bus (Wire1), address 0x6A',
    note: 'If a sketch also uses Wire1, call Wire1.begin(SDA1, SCL1, 400000) before elyssa_imu_begin().',
  },
  {
    pin: 'USB D− / D+',
    gpio: '19 / 20',
    sketch: '(not exposed)',
    safety: 'reserved',
    useFor: 'Native USB-C',
    note: 'Used by the USB port (chip fact). Not routed to the header.',
  },
];

export interface PowerRow {
  item: string;
  value: string;
  note: string;
  source: 'repo' | 'chip' | 'schematic';
}

export const POWER_ROWS: PowerRow[] = [
  { item: 'Logic level', value: '3.3 V', note: 'ESP32-S3 pins are not 5 V tolerant. Level-shift any 5 V signal.', source: 'chip' },
  { item: 'Current per GPIO', value: '< 20 mA recommended', note: 'The chip absolute maximum is 40 mA per pin. Use a transistor or driver for anything heavier.', source: 'chip' },
  { item: 'Analog inputs', value: '0 – 3.3 V · 12-bit (0 – 4095)', note: 'Use analogReadMilliVolts() for a calibrated reading in mV. Only ADC1 pins (IO0–IO6) are on the header.', source: 'repo' },
  { item: 'USB-C input', value: '5 V', note: 'Programming, serial monitor and power over one cable. Use a data cable.', source: 'repo' },
  { item: 'LiPo charger', value: 'BQ24092', note: 'On-board charge and power-path management. No GPIO: the CHG output only drives the red charge LED.', source: 'repo' },
  { item: 'Battery voltage sense', value: 'VBAT / 2 on GPIO7', note: 'Only with solder jumper JP3 bridged. vbat = analogReadMilliVolts(BAT_SENSE) × 2 / 1000.', source: 'repo' },
  { item: 'RGB LED resistors', value: '330 Ω per channel', note: 'Green looks brighter than red and blue; balance mixes with setLedRGB().', source: 'repo' },
  { item: 'I2C pull-ups', value: '4.7 kΩ to 3.3 V', note: 'Header + Qwiic share GPIO8 / GPIO9. IMU runs on its own bus at 400 kHz.', source: 'repo' },
  { item: 'Wi-Fi transmit power', value: '11 dBm (default)', note: 'Set by the board package for reliable links. Above 12 dBm the connection can fail or slow down; above 14 dBm it fails on every router tested.', source: 'repo' },
  { item: 'Bluetooth LE', value: '−12 to +20 dBm', note: 'Advertising power range tested on Elyssa.', source: 'repo' },
  { item: 'Vin pin range · buck output · charge current', value: 'See schematic', note: 'These values are not listed in the public repo. Check the schematic PDF before feeding Vin from an external supply.', source: 'schematic' },
];

export const NOT_TESTED = [
  'microSD with a card',
  'Battery charging and BAT_SENSE',
  'External I2C devices (header and Qwiic)',
  'PWM2 / PWM3 against the silkscreen',
  'Deep-sleep current',
];

export const REPO_LINKS = [
  { label: 'README: pinout, IDE setup, examples', href: `${REPO_BLOB}/README.md` },
  { label: 'Tips and known issues', href: `${REPO_BLOB}/TIPS_AND_KNOWN_ISSUES.md` },
  { label: 'ElyssaIMU library reference', href: `${REPO_URL}/tree/main/platform/libraries/ElyssaIMU` },
  { label: 'pins_arduino.h (pin constants)', href: `${REPO_BLOB}/platform/variants/elyssa/pins_arduino.h` },
  { label: 'Changelog', href: `${REPO_BLOB}/CHANGELOG.md` },
];

/** CSV of the full pin table, built in the browser for download. */
export function pinTableCsv(): string {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = ['Pin', 'GPIO', 'Sketch names', 'Status', 'Use for', 'Notes'].map(q).join(',');
  const rows = PIN_SAFETY.map((p) =>
    [p.pin, p.gpio, p.sketch, p.safety, p.useFor, p.note].map(q).join(',')
  );
  return [header, ...rows].join('\r\n');
}
