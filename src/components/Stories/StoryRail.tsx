import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "../site/Icons";
import type { Story } from "./storiesData";
import { Link, useNavigate } from "react-router-dom";
export function StoryRail({
  id,
  stories,
  tone,
  loading = false,
  error = "",
  emptyCopy = "No stories available yet.",
}: {
  id: string;
  stories: Story[];
  tone: "light" | "dark";
  loading?: boolean;
  error?: string;
  emptyCopy?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const scroll = (direction: 1 | -1) =>
    railRef.current?.scrollBy({ left: direction * 440, behavior: "smooth" });
  return (
    <div className={`story-rail ${tone}`}>
      <div className="story-rail-actions">
        <button
          type="button"
          aria-label="Scroll left"
          disabled={loading || stories.length === 0}
          onClick={() => scroll(-1)}
        >
          <ArrowLeft />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          disabled={loading || stories.length === 0}
          onClick={() => scroll(1)}
        >
          <ArrowRight />
        </button>
      </div>
      <div id={id} ref={railRef} className="story-rail-track">
        {loading ? (
          Array.from({ length: 3 }, (_, index) => (
            <article className="story-card-skeleton" key={index} aria-hidden="true">
              <i />
              <span />
              <span />
              <span />
              <footer><i /><span /></footer>
            </article>
          ))
        ) : error ? (
          <article className="story-rail-state">
            <strong>Stories could not be loaded</strong>
            <p>{error}</p>
          </article>
        ) : stories.length === 0 ? (
          <article className="story-rail-state">
            <strong>No stories yet</strong>
            <p>{emptyCopy}</p>
          </article>
        ) : stories.map((story) => (
          <article
            key={story.id}
            className={story.href ? "story-card-clickable" : undefined}
            role={story.href ? "link" : undefined}
            tabIndex={story.href ? 0 : undefined}
            onClick={(event) => {
              if (!story.href || (event.target as HTMLElement).closest("a, button")) return;
              navigate(story.href);
            }}
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (story.href && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                navigate(story.href);
              }
            }}
          >
            <Quote />
            <blockquote>{story.quote}</blockquote>
            <div className="story-stat">
              <b>{story.stat}</b>
              <span>{story.statLabel}</span>
            </div>
            <div className="story-person">
              <i>
                {story.logo ? (
                  <img src={story.logo} alt="" />
                ) : (
                  story.initials
                )}
              </i>
              <p>
                <b>{story.name}</b>
                <span>
                  {story.role} · {story.org} · {story.city}
                </span>
              </p>
            </div>
            {story.href && (
              <Link className="story-company-link" to={story.href}>
                View company profile <ArrowRight />
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
