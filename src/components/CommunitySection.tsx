import { FaWhatsapp } from "react-icons/fa";
import "./CommunitySection.scss";
import community1 from "../assets/homepage/community/1.png";
import community2 from "../assets/homepage/community/2.png";
import community3 from "../assets/homepage/community/3.png";
import community4 from "../assets/homepage/community/4.png";
import community5 from "../assets/homepage/community/5.png";
import community6 from "../assets/homepage/community/6.png";

const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/ESpk7Ruh6wWFlFuFfx423s";

const collageImages = [
  { id: "img6", src: community1, alt: "Community member story" },
  { id: "img2", src: community2, alt: "Wellness workshop" },
  { id: "img3", src: community3, alt: "Group discussion" },
  { id: "img4", src: community4, alt: "Community event" },
  { id: "img5", src: community5, alt: "Expert session" },
  { id: "img1", src: community6, alt: "Community gathering" },
];

export function CommunitySection() {
  return (
    <section className="communitySection">
      <div className="communitySection__inner">
        <div className="communitySection__header">
          <h2 className="communitySection__title">
            Healing was never meant to be quiet or alone.
          </h2>
          <p className="communitySection__subtext">
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
              <img
                src={img.src}
                alt={img.alt}
                className="communitySection__collageImg"
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
