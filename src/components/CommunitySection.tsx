import { FaWhatsapp } from "react-icons/fa";
import "./CommunitySection.scss";

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/YOUR_COMMUNITY_LINK";

const collageImages = [
  { id: "img1", alt: "Community member story" },
  { id: "img2", alt: "Wellness workshop" },
  { id: "img3", alt: "Group discussion" },
  { id: "img4", alt: "Community event" },
  { id: "img5", alt: "Expert session" },
  { id: "img6", alt: "Community gathering" },
];

export function CommunitySection() {
  return (
    <section className="communitySection">
      <div className="communitySection__inner">
        <div className="communitySection__header">
          <h2 className="communitySection__title">
            Join our community of women
          </h2>
          <p className="communitySection__subtext">
            Healing was never meant to be quiet or alone.
            <br />
            Join our community of <strong>10,000+</strong> women sharing
            stories, strength, and guidance from experts who truly understand a
            woman’s rhythm.
          </p>
        </div>

        <div className="communitySection__collage">
          {collageImages.map((img) => (
            <div
              key={img.id}
              className={`communitySection__collageItem communitySection__collageItem--${img.id}`}
            >
              <div
                className="communitySection__placeholder"
                aria-label={img.alt}
              />
            </div>
          ))}
        </div>

        <a
          href={WHATSAPP_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="communitySection__cta"
        >
          <FaWhatsapp className="communitySection__ctaIcon" />
          <span>Join the Community</span>
        </a>
      </div>
    </section>
  );
}
