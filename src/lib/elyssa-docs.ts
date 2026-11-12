/**
 * Technical data for Elyssa, taken from the board schematic and the open-source repository
 * (https://github.com/moovma/Elyssa-dev-board: README, TIPS_AND_KNOWN_ISSUES, pins_arduino.h).
 */

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'moovmabh@gmail.com';
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
  { n: 22, label: 'Vin', kind: 'power', detail: '5 V, wired to USB (see the power rules)' },
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
    note: 'Shared with BAT_SENSE. If solder jumper JP3 is bridged (open by default) the battery voltage is on this pin, so do not use IO6 for anything else.',
  },
  {
    pin: 'SDA / SCL',
    gpio: '8 / 9',
    sketch: 'SDA · SCL (A8/A9, T8/T9)',
    safety: 'caution',
    useFor: 'I2C on the header and the Qwiic connector',
    note: '4.7 kΩ pull-ups are already on the board. Avoid touch or other loads on these pins while I2C is in use.',
  },
  {
    pin: 'Tx / Rx',
    gpio: '43 / 44',
    sketch: 'TX · RX',
    safety: 'safe',
    useFor: 'UART to external devices',
    note: 'They also drive the TX and RX indicator LEDs (D16, D17) through 1.5 kΩ resistors, so you see data flowing. Serial Monitor uses native USB, so these pins are free for a second UART.',
  },
  {
    pin: 'CS / MOSI / CLK / MISO',
    gpio: '34 / 35 / 36 / 37',
    sketch: 'SS(CS) · MOSI · SCK(CLK) · MISO',
    safety: 'safe',
    useFor: 'SPI on the header (default SPI bus)',
    note: 'Digital only: no analog input or touch on these pins. Separate from the microSD bus.',
  },
  {
    pin: 'PWM1',
    gpio: '14',
    sketch: 'PWM1 · T10',
    safety: 'caution',
    useFor: 'PWM output, or touch',
    note: 'PWM1 and T10 are the same pin: use it for touch or PWM, never both. Its analog input is on ADC2, which cannot be used while Wi-Fi is on.',
  },
  {
    pin: 'PWM2 / PWM3',
    gpio: '47 / 48',
    sketch: 'PWM2 · PWM3',
    safety: 'safe',
    useFor: 'PWM, digital in/out',
    note: 'Digital only: no analog input or touch on these pins.',
  },
  {
    pin: 'BOOT button',
    gpio: '0',
    sketch: 'BOOT_BUTTON',
    safety: 'reserved',
    useFor: 'Reads LOW when pressed',
    note: 'Strapping pin. Held LOW during reset it enters download mode. After boot it works as a normal input, but do not drive it externally at boot.',
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
    note: 'Used by the USB port. Not routed to the header.',
  },
];


export interface PowerRow {
  item: string;
  value: string;
  note: string;
}

/** The four rules worth reading before you plug anything in. */
export const POWER_RULES = [
  {
    n: '01',
    title: 'One power source on Vin',
    text: 'The USB line is wired to the Vin pin. Never connect USB and an external supply to Vin at the same time: it can backfeed and damage your setup or your computer.',
    warn: true,
  },
  {
    n: '02',
    title: '3.3 V logic only',
    text: 'Every GPIO works at 3.3 V and is not 5 V tolerant. Use a level shifter for 5 V signals.',
  },
  {
    n: '03',
    title: 'Go easy on the pins',
    text: 'Keep each GPIO under about 20 mA. For motors, relays and strips of LEDs, switch them with a transistor or driver.',
  },
  {
    n: '04',
    title: 'Single-cell batteries only',
    text: 'The charger is made for one 3.7 V Li-Ion or Li-Po cell, charged to 4.2 V. Never connect two cells or any other battery type.',
  },
];

export const POWER_ROWS: PowerRow[] = [
  { item: 'Main 3.3 V rail', value: 'Up to 2 A', note: 'A TLV62569DBVR step-down (buck) regulator with a 2.2 µH inductor drives the 3.3 V rail: efficient, steady, and plenty of headroom for sensors and modules.' },
  { item: 'USB-C input', value: '5 V', note: 'Programming, serial monitor and power over one cable. Use a data cable.' },
  { item: 'Vin pin', value: '5 V, wired to USB', note: 'Take 5 V out of this pin, or power the board from it when USB is unplugged. Never feed Vin while USB is connected.' },
  { item: 'Input protection', value: 'PMOS + Schottky diode', note: 'A power-OR stage protects the input and stops current flowing back between power sources.' },
  { item: 'LiPo charger', value: 'BQ24092 · about 540 mA', note: 'Charges one cell from the 5 V USB input. The 1 kΩ ISET resistor sets the current. There is no GPIO for it: the CHG output only drives the red charge LED.' },
  { item: 'Battery', value: '1S Li-Ion / Li-Po, 3.7 V', note: 'Charged to 4.2 V. A 1500 to 2000 mAh cell is a good balance between charging time and battery stress.' },
  { item: 'Charger temperature', value: 'Warm, up to about 125 °C', note: 'The charger chip can get noticeably warm. Around 125 °C its thermal regulation lowers the charging current automatically.' },
  { item: 'Battery voltage reading', value: 'VBAT / 2 on IO6 (GPIO7)', note: 'Only after bridging solder jumper JP3. In a sketch: vbat = analogReadMilliVolts(BAT_SENSE) × 2 / 1000.' },
  { item: 'Logic level', value: '3.3 V', note: 'GPIOs are not 5 V tolerant.' },
  { item: 'Current per GPIO', value: 'Under 20 mA', note: 'Use a transistor or driver for anything heavier.' },
  { item: 'Analog inputs', value: '0 – 3.3 V, 12-bit (0 – 4095)', note: 'ADC1 pins (IO0 to IO6, SDA, SCL) work with Wi-Fi on. PWM1 is on ADC2, which cannot be used while Wi-Fi is on. Use analogReadMilliVolts() for a calibrated reading.' },
  { item: 'RGB LED', value: '330 Ω per channel', note: 'Green looks brighter than red and blue. Balance mixed colours with setLedRGB().' },
  { item: 'I2C', value: '4.7 kΩ pull-ups to 3.3 V', note: 'The header and Qwiic share GPIO8 / GPIO9. The IMU runs on its own bus at 400 kHz.' },
  { item: 'Wi-Fi transmit power', value: '11 dBm by default', note: 'Set by the board package for a reliable link. Above 12 dBm the connection can fail or slow down.' },
  { item: 'Bluetooth LE', value: '−12 to +20 dBm', note: 'Advertising power range available on Elyssa.' },
];

/** Shown at the bottom of the docs page. */
export const DISCLAIMER =
  'Elyssa is an open-source development board, provided “as is”. Moovma is not responsible for any damage, loss or malfunction caused by using it, by connecting it incorrectly, or by going beyond the limits on this page. Always double-check your wiring and power before you plug anything in.';

/** What each header pin can do (from the schematic). Every digital pin can also do PWM, UART, SPI, I2C and I2S. */
export interface PinCap { pin: string; gpio: number; adc: string; touch: string }
const TOUCH: Record<number, string> = { 1: 'T0', 2: 'T1', 3: 'T2', 4: 'T3', 5: 'T4', 6: 'T5', 7: 'T6', 8: 'T8', 9: 'T9', 14: 'T10' };
const adcOf = (g: number) => (g >= 1 && g <= 9 ? 'ADC1' : g === 14 ? 'ADC2' : '');
export const PIN_CAPS: PinCap[] = HEADER_PINS.filter((p) => p.gpio !== undefined).map((p) => ({
  pin: p.label,
  gpio: p.gpio as number,
  adc: adcOf(p.gpio as number),
  touch: TOUCH[p.gpio as number] ?? '',
}));

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
