import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ShopGallery from '../../components/ShopGallery';
import ScrollReveal from '../../components/ScrollReveal';
import { getProductImages } from '../../lib/moovma';
import { CONTACT_EMAIL } from '../../lib/elyssa-docs';

export const metadata: Metadata = {
  title: 'Moovma shop: Elyssa dev board',
  description: 'Buy the Elyssa ESP32-S3 development board from Moovma. Pre-order the first production batch from Tunisia.',
};

const HIGHLIGHTS = [
  'ESP32-S3FN8: dual-core 240 MHz, Wi-Fi and Bluetooth LE 5, 8 MB flash',
  'Native USB-C: program and debug over one cable',
  '6-axis IMU (LSM6DS3TR-C) on its own I2C bus',
  'microSD slot on a dedicated SPI bus',
  'RGB LED, BOOT button, Qwiic connector',
  'LiPo charger (BQ24092) with optional battery sense',
  'Arduino IDE support with built-in LED and IMU functions',
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
              <p className="eyebrow">Dev board · Batch 01</p>
              <h1>Elyssa</h1>
              <p className="shop-desc">
                The first Tunisian ESP32-S3 development board by Moovma. Motion sensing, wireless connectivity and a
                documentation-first workflow, built for curious makers.
              </p>

              <ul className="shop-list">
                {HIGHLIGHTS.map((h) => <li key={h}>{h}</li>)}
              </ul>

              <div className="shop-links">
                <Link href="/preorder" className="button button-acid">Pre-order Elyssa</Link>
                <Link href="/elyssa" className="button button-dark">Overview</Link>
              </div>

              <div className="shop-sublinks">
                <Link href="/elyssa" className="text-link">Overview: 3D anatomy, specs, quick start →</Link>
                <Link href="/preorder" className="text-link">Pre-order: reserve your board →</Link>
                <Link href="/docs" className="text-link">Technical docs: schematic, pinout, power →</Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mv-band mv-dark shop-included">
        <div className="section-wrap">
          <div className="section-label reveal"><span>In the box</span><span>Batch 01</span></div>
          <h2 className="reveal">Everything to <em>start building.</em></h2>
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
