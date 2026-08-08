import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Announcement from "./components/Announcement";
import JoinForm from "./components/JoinForm";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Announcement />
        <JoinForm />
      </main>
      <Footer />
    </div>
  );
}
