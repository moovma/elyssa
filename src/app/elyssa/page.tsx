import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import Specs from '../../components/Specs';
import QuickStart from '../../components/QuickStart';
import DocsTeaser from '../../components/DocsTeaser';
import PreorderSection from '../../components/PreorderSection';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import LazyThreeViewer from '../../components/LazyThreeViewer';
import JsonLd from '../../components/JsonLd';
import { SITE_URL } from '../../lib/site';

const PRODUCT = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Elyssa',
  alternateName: 'Elyssa dev board',
  description: 'Elyssa is the first Tunisian dev board: ESP32-S3FN8, Wi-Fi, Bluetooth LE 5, USB-C, RGB LED, 6-axis motion sensor, microSD and LiPo charger. Open source and ready for the Arduino IDE.',
  brand: { '@type': 'Brand', name: 'Moovma' },
  manufacturer: { '@type': 'Organization', name: 'Moovma', url: SITE_URL },
  category: 'Development board',
  image: [`${SITE_URL}/product_images/_opt/front_elyssa.webp`, `${SITE_URL}/product_images/_opt/back_elyssa.webp`],
  url: `${SITE_URL}/elyssa`,
};

export const metadata: Metadata = {
  title: 'Elyssa: the first Tunisian dev board (ESP32-S3)',
  alternates: { canonical: '/elyssa' },
  description: 'Elyssa is the first Tunisian dev board: ESP32-S3, Wi-Fi, Bluetooth 5, motion sensing and LiPo charging, open source and ready for the Arduino IDE. Reserve yours.',
};

export default function Home() {
  return (
    <>
    <JsonLd data={PRODUCT} />
    <main>
      <ScrollReveal />
      <Navbar />
      <Hero />
      <div className="three-viewer-wrapper">
        <LazyThreeViewer />
      </div>
      <Features />
      <Specs />
      <QuickStart />
      <DocsTeaser />
      <PreorderSection />
      <Footer />
    </main>
    </>
  );
}
