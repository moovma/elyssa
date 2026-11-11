import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShopGallery from '../../components/ShopGallery';
import ScrollReveal from '../../components/ScrollReveal';
import { getProductImages } from '../../lib/moovma';
import { CONTACT_EMAIL } from '../../lib/elyssa-docs';
import Gfx, { CONTENT_RIGHT } from '../../components/Gfx';

export const metadata: Metadata = {
  title: 'Shop: Elyssa, the first Tunisian dev board',
  description: 'Reserve Elyssa, the first Tunisian dev board. Wi-Fi, Bluetooth 5, motion sensing and LiPo charging on one open-source board. No payment now.',
};

const HIGHLIGHTS = [
  'Wi-Fi and Bluetooth LE 5: connect to the cloud, your phone or your own network',
  'Dual-core 240 MHz ESP32-S3 with 8 MB flash: fast enough for real projects',
  'Built-in motion sensor: tap, tilt, shake and step detection out of the box',
  'LiPo charger on board: run from a battery and charge over USB-C',
  'microSD slot and Qwiic connector: store data and add sensors without soldering',
  'Works with Arduino IDE 2, with LED and motion functions already built in',
  'Open source: the schematic, code and docs are yours to read and remix',
];

const STEPS = [
  { n: '1', title: 'Reserve', text: 'Fill in the short form and pick how many boards you want. It takes about a minute.' },
  { n: '2', title: 'We get in touch', text: 'You pay nothing now. We contact you before any charge to confirm your order.' },
  { n: '3', title: 'Start building', text: 'Your Elyssa arrives ready for the Arduino IDE, with a four-step quick start waiting for you.' },
];

const INCLUDED = [
  '1× Elyssa ESP32-S3FN8 dev board (tested and verified)',
  '2× 14-pin breadboard headers',
  'Official ElyssaIMU library and Arduino board package',
  'Full schematics and hardware documentation',
];

export default function ShopPage() {
  const images = getProductImages();

  return (
    <main className="shop-page">
      <ScrollReveal />
      <Navbar variant="moovma" />

      <section className="shop-hero">
        <div className="section-wrap">
          <nav className="shop-crumbs" aria-label="Breadcrumb">
            <Link href="/">Moovma</Link><span>/</span><span>Shop</span>
          </nav>

          <article className="shop-product">
            <ShopGallery images={images} />

            <div className="shop-info">
              <p className="eyebrow">The first Tunisian dev board · Batch 01</p>
              <h1>Elyssa</h1>
              <p className="shop-desc">
                Elyssa is the first Tunisian dev board, and it is built for people like you: curious, hands-on and ready to create. Wi-Fi, Bluetooth, motion sensing and battery charging all come ready on one tiny board.
              </p>

              <ul className="shop-list">
                {HIGHLIGHTS.map((h) => <li key={h}>{h}</li>)}
              </ul>

              <div className="shop-links">
                <Link href="/preorder" className="button button-acid">Reserve your Elyssa</Link>
                <Link href="/elyssa" className="button button-dark">Discover Elyssa</Link>
              </div>

              <ol className="shop-steps" aria-label="How pre-ordering works">
                {STEPS.map((s) => (
                  <li key={s.n}>
                    <b>{s.n}</b>
                    <span><strong>{s.title}</strong>{s.text}</span>
                  </li>
                ))}
              </ol>

              <div className="shop-sublinks">
                <Link href="/elyssa" className="text-link">Overview: explore it in 3D, see the specs, follow the quick start →</Link>
                <Link href="/preorder" className="text-link">Reserve: secure your board in a minute →</Link>
                <Link href="/docs" className="text-link">Technical docs: schematic, pinout and safe power ranges →</Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mv-band mv-dark shop-included">
      <Gfx shape="wave" color="d2" size={170} right={CONTENT_RIGHT} top={110} />
        <div className="section-wrap">
          <div className="section-label reveal"><span>In the box</span><span>Batch 01</span></div>
          <h2 className="reveal">Open the box.<br /><em>Start building.</em></h2>
          <ul className="spec-list shop-incl-list reveal">
            {INCLUDED.map((x, i) => (
              <li key={x} className="shop-incl-row"><small>{String(i + 1).padStart(2, '0')}</small><span>{x}</span></li>
            ))}
          </ul>
          <p className="mv-lead reveal">
            Questions before you order? <a className="text-link" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Elyssa] Shop question')}`}>Email us</a>{' '}
            or use the <Link className="text-link" href="/#contact">contact form</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
