import { ApplicantStoriesSection } from "../components/Stories/ApplicantStoriesSection";
import { StoriesCtaSection } from "../components/Stories/StoriesCtaSection";
import { StoriesHero } from "../components/Stories/StoriesHero";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CompanyStoriesSection } from "../components/Stories/CompanyStoriesSection";
export default function StoriesPage() {
  return (
    <div id="top" className="stories-page">
      <Navbar />
      <main>
        <StoriesHero />
        <ApplicantStoriesSection />
        <CompanyStoriesSection />
        <StoriesCtaSection />
      </main>
      <Footer />
    </div>
  );
}
