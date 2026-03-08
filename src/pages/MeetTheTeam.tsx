import { FaLinkedinIn } from "react-icons/fa";
import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../cloudinary/image";
import "./MeetTheTeam.scss";

type Founder = {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  imageAlt: string;
  linkedinUrl: string;
};

const founders: Founder[] = [
  {
    id: "founder-1",
    name: "Aditi Ayare",
    role: "Founder & Director",
    imageUrl:
      "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772989984/Screenshot_2021-06-02_at_12_17_edited_pn_tycpbh.avif",
    imageAlt: "Portrait of aditi ayare, founder & director",
    linkedinUrl: "https://www.linkedin.com/in/aditiayare/",
  },
  {
    id: "founder-2",
    name: "Prathima Nagesh",
    role: "Partner & Head of services & experts",
    imageUrl:
      "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772971159/B074923PRANAG22_vkngig.jpg",
    imageAlt:
      "Portrait of prathima nagesh, Partner & Head of services and experts",
    linkedinUrl: "https://www.linkedin.com/in/prathima-nagesh/",
  },
  {
    id: "founder-3",
    name: "Mandira Chaudhary",
    role: "Partner & Head of Community",
    imageUrl:
      "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772989984/8b0352f2-3d85-4b79-8e71-af6b1d15b957_JPG_neqwtz.avif",
    imageAlt: "Portrait of mandira chaudhary, Partner & Head of Community",
    linkedinUrl: "https://www.linkedin.com/in/mandira-chaudhary/",
  },
];

export default function MeetTheTeam() {
  return (
    <section className="page meetTeam">
      <div className="meetTeam__hero">
        <p className="meetTeam__heroLabel">Meet the Team</p>
        <h1 className="meetTeam__heroTitle">
          Women building wellness for women.
        </h1>
      </div>

      <div className="meetTeam__intro">
        <p className="meetTeam__introText">
          FemVed is built by founders who deeply understand women&apos;s health
          journeys and are committed to making trusted, holistic wellness more
          accessible.
        </p>
      </div>

      <div className="meetTeam__gridWrap">
        <div className="meetTeam__grid" aria-label="Founders">
          {founders.map((founder) => (
            <article key={founder.id} className="meetTeam__card">
              <div className="meetTeam__media">
                <img
                  className="meetTeam__image"
                  src={optimizeCloudinaryImageUrl(founder.imageUrl, {
                    width: 720,
                    crop: "fill",
                  })}
                  srcSet={buildCloudinarySrcSet(
                    founder.imageUrl,
                    [320, 480, 640, 840],
                    { crop: "fill" },
                  )}
                  sizes="(max-width: 860px) 90vw, (max-width: 1200px) 45vw, 30vw"
                  alt={founder.imageAlt}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="meetTeam__content">
                <p className="meetTeam__name">{founder.name}</p>
                <p className="meetTeam__role">{founder.role}</p>
                <a
                  className="meetTeam__linkedin"
                  href={founder.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${founder.name} on LinkedIn`}
                >
                  <FaLinkedinIn aria-hidden="true" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
