'use client';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import dynamic from 'next/dynamic';
import Features from '../components/Features';
import Specs from '../components/Specs';
import QuickStart from '../components/QuickStart';
import PreorderSection from '../components/PreorderSection';
import Footer from '../components/Footer';

// Lazy‑load the 3D viewer on the client only – the surrounding <div> ensures identical markup on server & client
const ThreeViewer = dynamic(() => import('../components/ThreeViewer'), { ssr: false });

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <div className="three-viewer-wrapper">
        <ThreeViewer />
      </div>
      <Features />
      <Specs />
      <QuickStart />
      <PreorderSection />
      <Footer />
    </main>
  );
}
