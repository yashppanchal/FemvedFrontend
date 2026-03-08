import { FaWhatsapp } from "react-icons/fa";
import "./CommunitySection.scss";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";
import RevealOnScroll from "./RevealOnScroll";
// import community1 from "../assets/homepage/community/1.png";
// import community2 from "../assets/homepage/community/2.png";
// import community3 from "../assets/homepage/community/3.png";
// import community4 from "../assets/homepage/community/4.png";
// import community5 from "../assets/homepage/community/5.png";
// import community6 from "../assets/homepage/community/6.png";

const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/ESpk7Ruh6wWFlFuFfx423s";

const community1 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965685/6_hd1noa.png";
const community2 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965688/2_kkkilf.png";
const community3 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965686/3_wbslya.png";
const community4 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965682/4_tnpyit.png";
const community5 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965683/5_gi6fxj.png";
const community6 =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965686/1_zjy3rp.png";

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
        <RevealOnScroll className="communitySection__header">
          <h2 className="communitySection__title">
            Healing was never meant to be quiet or alone.
          </h2>
          <p className="communitySection__subtext">
            Join our community of <strong>10,000+</strong> women sharing
            stories, strength, and guidance from experts who truly understand a
            woman’s rhythm.
          </p>
        </RevealOnScroll>

        <div className="communitySection__collage">
          {collageImages.map((img) => (
            <div
              key={img.id}
              className={`communitySection__collageItem communitySection__collageItem--${img.id}`}
            >
              <img
                src={optimizeCloudinaryImageUrl(img.src, {
                  width: 520,
                })}
                srcSet={buildCloudinarySrcSet(img.src, [220, 320, 420, 560])}
                sizes="(max-width: 720px) 33vw, 16vw"
                alt={img.alt}
                className="communitySection__collageImg"
                loading="lazy"
                decoding="async"
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
