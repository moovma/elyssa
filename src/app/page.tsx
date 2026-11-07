import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ThreeViewer from '../components/ThreeViewer';
import Features from '../components/Features';
import Specs from '../components/Specs';
import QuickStart from '../components/QuickStart';
import PreorderSection from '../components/PreorderSection';
import Documentation from '../components/Documentation';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <Hero />
      <ThreeViewer />
      <Features />
      <Specs />
      <QuickStart />
      <PreorderSection />
      <Documentation />
      <Footer />
    </main>
  );
}
