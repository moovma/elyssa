import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Specs from '../components/Specs';
import QuickStart from '../components/QuickStart';
import PreorderSection from '../components/PreorderSection';
import Footer from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import LazyThreeViewer from '../components/LazyThreeViewer';

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
      <PreorderSection />
      <Footer />
    </main>
  );
}
