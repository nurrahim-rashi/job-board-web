import { Footer } from "../components/Footer";
import { SubscribeSection } from "../components/LandingPage/SubscribeSection";
import { Navbar } from "../components/Navbar";

export default function PricingPage() {
  return (
    <div id="top" className="polaris-page pricing-page">
      <Navbar />
      <main>
        <SubscribeSection />
      </main>
      <Footer />
    </div>
  );
}
