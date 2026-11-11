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

export const metadata: Metadata = {
  title: 'Elyssa: ESP32-S3 dev board by Moovma',
  description: "Elyssa is Moovma's open ESP32-S3 development board for makers, sensors and connected things.",
};

export default function Home() {
  return (
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
  );
}
