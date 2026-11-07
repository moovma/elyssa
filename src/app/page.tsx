import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ThreeViewer from '../components/ThreeViewer';
import Features from '../components/Features';
import Specs from '../components/Specs';
import QuickStart from '../components/QuickStart';
import PreorderSection from '../components/PreorderSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ThreeViewer />
      <Features />
      <Specs />
      <QuickStart />
      <PreorderSection />
      <Footer />
    </main>
  );
}
