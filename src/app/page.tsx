import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import dynamic from 'next/dynamic';
import Features from '../components/Features';
import Specs from '../components/Specs';
import QuickStart from '../components/QuickStart';
import PreorderSection from '../components/PreorderSection';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';

// Lazy-load the heavy 3D viewer on client side with no SSR overhead
const ThreeViewer = dynamic(() => import('../components/ThreeViewer'), {
  ssr: false,
});

export default function Home() {
  return (
    <main>
      <ScrollReveal />
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
