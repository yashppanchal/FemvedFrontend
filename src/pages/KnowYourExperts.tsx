import { FaLinkedinIn } from "react-icons/fa";
import { PrimaryButton } from "../components/PrimaryButton";
import "./KnowYourExperts.scss";

type Expert = {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  image: string;
  linkedin: string;
};

const EXPERTS: Expert[] = [
  {
    name: "Dr. Ananya Sharma",
    title: "Ayurvedic Physician & Women's Health Specialist",
    bio: "With over 15 years of clinical experience, Dr. Sharma integrates traditional Ayurvedic healing with modern diagnostics to address hormonal imbalances.",
    specialties: ["Ayurveda", "Hormonal Health", "PCOS"],
    image:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Priya Menon",
    title: "Certified Yoga Therapist & Breathwork Coach",
    bio: "Priya specialises in therapeutic yoga sequences designed for women navigating stress, anxiety, and reproductive health challenges.",
    specialties: ["Yoga", "Breathwork", "Stress Relief"],
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Dr. Kavita Reddy",
    title: "Naturopathic Doctor & Gut Health Expert",
    bio: "Dr. Reddy combines naturopathy and functional nutrition to help women restore gut health—the foundation of overall wellbeing.",
    specialties: ["Naturopathy", "Nutrition", "Gut Health"],
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Meera Iyer",
    title: "Mental Wellness Counsellor & Mindfulness Practitioner",
    bio: "Meera guides women through evidence-based mindfulness and cognitive techniques to build emotional resilience and inner calm.",
    specialties: ["Mental Health", "Mindfulness", "Emotional Wellness"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Dr. Sunita Kapoor",
    title: "Endocrinologist & Fertility Consultant",
    bio: "A leading voice in women's endocrinology, Dr. Kapoor helps women understand and manage conditions like PCOS, thyroid disorders, and fertility concerns.",
    specialties: ["Endocrinology", "Fertility", "Thyroid"],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Ritu Desai",
    title: "Fitness Coach & Movement Therapist",
    bio: "Ritu designs personalised movement programs that support women through every life stage—from postpartum recovery to healthy ageing.",
    specialties: ["Fitness", "Movement Therapy", "Longevity"],
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
];

export default function KnowYourExperts() {
  return (
    <section className="page experts">
      {/* ── Hero ── */}
      <div className="experts__hero">
        <h1 className="page__title experts__title">Know Your Experts</h1>
        <p className="page__lead experts__lead">
          Every expert at FemVed is a trusted woman practitioner—carefully
          selected for her deep knowledge, empathy, and commitment to holistic
          women's health. Get to know the people guiding your wellness journey.
        </p>
      </div>

      {/* ── Expert grid ── */}
      <div className="experts__grid">
        {EXPERTS.map((expert) => (
          <article key={expert.name} className="expertCard">
            <div className="expertCard__imageWrap">
              <img
                className="expertCard__image"
                src={expert.image}
                alt={expert.name}
                loading="lazy"
              />
            </div>

            <div className="expertCard__body">
              <h2 className="expertCard__name">{expert.name}</h2>
              <p className="expertCard__title">{expert.title}</p>
              <p className="expertCard__bio">{expert.bio}</p>

              <div className="expertCard__specialties">
                {expert.specialties.map((s) => (
                  <span key={s} className="expertCard__tag">
                    {s}
                  </span>
                ))}
              </div>

              <a
                className="expertCard__linkedin"
                href={expert.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${expert.name} on LinkedIn`}
              >
                <FaLinkedinIn />
                <span>LinkedIn</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="experts__cta">
        <h2 className="experts__ctaTitle">
          Ready to begin your wellness journey?
        </h2>
        <p className="experts__ctaText">
          Our experts are here to guide you with personalised, holistic care
          rooted in ancient wisdom and modern understanding.
        </p>
        <PrimaryButton
          label="Explore Guided Programs"
          to="/guided/hormonal-health-support"
        />
      </div>
    </section>
  );
}
