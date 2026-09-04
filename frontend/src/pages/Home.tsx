import Preloader from '../components/ui/Preloader';
import CustomCursor from '../components/ui/CustomCursor';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Skills from '../components/Skills/Skills';
import Projects from '../components/Projects/Projects';
import Certifications from '../components/Certifications/Certifications';
import Contact from '../components/Contact/Contact';
import Footer from '../components/Footer/Footer';
import ChatBot from '../components/ui/ChatBot';

export default function Home() {
  return (
    <>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
      <ChatBot />
    </>
  );
}
