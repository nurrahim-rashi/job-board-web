import { useState, type FormEvent } from "react";

type HeroProps = {
  onSearch: (query: string) => void;
};

export default function Hero({ onSearch }: HeroProps) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch([keyword, location].filter(Boolean).join(" "));
    document.querySelector("#lowongan")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero" id="beranda">
      <div className="hero-copy">
        <span className="eyebrow reveal reveal-delay-1">✦ Platform karier untuk masa depanmu</span>
        <h1 className="reveal reveal-delay-2">Kerja yang tepat, untuk <em>hidup</em> yang kamu inginkan.</h1>
        <p className="reveal reveal-delay-3">Jelajahi ribuan peluang dari perusahaan terbaik Indonesia. Bangun kariermu dengan lebih percaya diri.</p>
        <form className="search-panel reveal reveal-delay-4" onSubmit={handleSubmit}>
          <label>
            <span>⌕</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Posisi atau kata kunci" />
          </label>
          <label>
            <span>⌖</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kota atau remote" />
          </label>
          <button className="button" type="submit">Cari pekerjaan <span>→</span></button>
        </form>
        <div className="popular-searches reveal reveal-delay-5"><span>Populer:</span><button onClick={() => onSearch("Product Designer")}>Product Designer</button><button onClick={() => onSearch("Marketing")}>Marketing</button><button onClick={() => onSearch("Software Engineer")}>Software Engineer</button></div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="sun art-enter art-delay-1" />
        <div className="orb orb-one float-orb-one art-enter art-delay-4" />
        <div className="orb orb-two float-orb-two art-enter art-delay-3" />
        <div className="portrait-card float-portrait art-enter art-delay-2"><div className="portrait-figure">👩🏽‍💻</div><div className="portrait-note"><span>Dream job found!</span><strong>Product Designer</strong><small>Jakarta · Hybrid</small></div></div>
        <div className="stat-card float-stat art-enter art-delay-5"><strong>12.5k+</strong><span>peluang tersedia</span></div>
        <div className="sparkle spin-sparkle art-enter art-delay-5">✦</div>
      </div>
    </section>
  );
}
