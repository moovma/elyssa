import type { Metadata } from 'next';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import Compare from '../../components/Compare';
import QuickStart from '../../components/QuickStart';
import DocsTeaser from '../../components/DocsTeaser';
import PreorderSection from '../../components/PreorderSection';
import Footer from '../../components/Footer';
import ScrollReveal from '../../components/ScrollReveal';
import LazyThreeViewer from '../../components/LazyThreeViewer';

export const metadata: Metadata = {
  title: 'Elyssa: the first Tunisian dev board (ESP32-S3)',
  alternates: { canonical: '/elyssa' },
  description: 'Elyssa is the first Tunisian dev board: ESP32-S3, Wi-Fi, Bluetooth 5, motion sensing and LiPo charging, open source and ready for the Arduino IDE. Reserve yours.',
};

export default function Home() {
  return (
    <>
    <main>
      <ScrollReveal />
      <Navbar />
      <Hero />
      <div className="three-viewer-wrapper">
        <LazyThreeViewer />
      </div>
      <Features />
      <Compare />
      <QuickStart />
      <DocsTeaser />
      <PreorderSection />
      <Footer />
    </main>
    </>
  );
}
