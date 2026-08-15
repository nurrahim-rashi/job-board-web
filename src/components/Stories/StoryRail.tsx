import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "../site/Icons";
import type { Story } from "./storiesData";
export function StoryRail({
  id,
  stories,
  tone,
}: {
  id: string;
  stories: Story[];
  tone: "light" | "dark";
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: 1 | -1) =>
    railRef.current?.scrollBy({ left: direction * 380, behavior: "smooth" });
  return (
    <div className={`story-rail ${tone}`}>
      <div className="story-rail-actions">
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll(-1)}
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll(1)}
        >
          <ArrowRight />
        </button>
      </div>
      <div id={id} ref={railRef} className="story-rail-track">
        {stories.map((story) => (
          <article key={story.name}>
            <Quote />
            <blockquote>{story.quote}</blockquote>
            <div className="story-stat">
              <b>{story.stat}</b>
              <span>{story.statLabel}</span>
            </div>
            <div className="story-person">
              <i>{story.initials}</i>
              <p>
                <b>{story.name}</b>
                <span>
                  {story.role} · {story.org} · {story.city}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
