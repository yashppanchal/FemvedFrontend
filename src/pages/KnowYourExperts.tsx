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
    name: "Prathima Nagesh",
    title: "Ayurvedic & Yoga Expert",
    bio: "A distinguished and compassionate BAMS, MD, Ayurvedic doctor with 18 years of experience with an exceptional focus on women's health and well-being. She is also a trained clinical Researcher (GCSRT) from Harvard Medical School.  She has successfully treated and managed an extensive array of conditions affecting women, including menstrual irregularities, hormonal imbalances, fertility challenges etc.",
    specialties: ["Ayurveda", "Hormonal Health", "PCOS"],
    image:
      "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Mandira Chaudhary",
    title: "Yoga Expert",
    bio: "Expertise gained over 10 yrs of experience. She is a passionate yoga teacher who loves to share her knowledge and inspire people to grow into their best versions through the practice of yoga and mindfulness. Mandira is certified 500hrs Ashtanga yoga teacher from IndeaYoga Mysore, has done her 200hrs YIC in hatha yoga from S-VYASA university Bangalore. She has also done her MSc in Yoga from S-VYASA university Bangalore.",
    specialties: ["Yoga", "Breathwork", "Stress Relief"],
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Vibhuti Rao",
    title: "Ayurvedic & Yoga Expert",
    bio: "Vibhuti Rao is an Ayurveda clinician and researcher with over 12 years of experience in the field of women's health. In addition to her clinical practice, Dr. Rao is also an active researcher. She is pursuing her PhD from Australia's first University based integrative health centre (University of Western Sydney, Australia), where she is exploring the role of Ayurveda diet and yoga therapy in women of Indian ethnicity with PCOS.",
    specialties: ["Ayurveda", "Yoga", "PCOS"],
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Khyati Chheda",
    title: "Ayurvedic & Yoga Expert",
    bio: "She is an Experienced BAMS ayurvedic doctor with 15 years of experience. In the United Kingdom, she has intensively studied the diverse impact of culture, food and lifestyle to develop holistic wellness.",
    specialties: ["Ayurveda", "Yoga", "Holistic Wellness"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Ines Chyla",
    title: "Ayurvedic & Yoga Expert",
    bio: "She strongly believes that Ayurveda delivers the best preventive health care and works towards raising the awareness for holistic wellness. She is an active board member of the Association of European Ayurvedic Physicians and Therapists (VEAT) and office manager at Umbrella Association for Ayurveda Germany (ADAVED, established 2019).",
    specialties: ["Ayurveda", "Yoga", "Preventive Health"],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Dr. Deepa",
    title: "Ayurvedic & Yoga Expert",
    bio: "Ayurvedic practitioner and a qualified Yoga teacher. Deepa is a former external Examiner for a Masters degree accredited by Middlesex University. She is also a former director for education at Ayurvedic Professionals Association, UK. She lectures widely on Ayurveda and Yoga (both in the UK and Germany) and now actively runs her practice in London.",
    specialties: ["Ayurveda", "Yoga", "Education"],
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Tanmanyee Ranade",
    title: "Ayurvedic & Yoga Expert",
    bio: "Tanmayee Ranade is a skilled Ayurveda practitioner with extensive experience in both India and the United Kingdom with a deep-rooted passion for holistic health. She currently is researching on medicinal herbs. She is exploring the therapeutic properties of various plants, aiming to uncover new possibilities for treating ailments and promoting optimal health.",
    specialties: ["Ayurveda", "Yoga", "Herbal Medicine"],
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Aditi Kulkarni",
    title: "Ayurvedic Expert",
    bio: "Dr. Aditi Kulkarni, MD (Ayurveda), founder of OncoVeda, blends modern medicine with Ayurveda to offer holistic, evidence-based care for women. Specializing in women's oncology, hormonal health, and stress management, she provides personalized treatments, including Panchakarma, to promote well-being.",
    specialties: ["Ayurveda", "Oncology", "Hormonal Health"],
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Natalie Smyth",
    title: "Holistic Wellness Expert",
    bio: "Natalie Smyth, BSc in Naturopathy and 300-hour Yoga Teacher Alliance certified. Natalie's training in mindfulness under the world-renowned Thich Nhat Hanh assists her innate ability to heal, empathise, and offer solutions. She's led global retreats and mentored in healing arts since age 15.",
    specialties: ["Naturopathy", "Yoga", "Mindfulness"],
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Pooja Sheoran",
    title: "Ayurvedic Expert",
    bio: "Pooja Sheoran, BAMS degree, is an experienced Ayurvedic doctor with over 3 years of expertise in clinical dietetics and functional medicine. She offers personalized care for PCOD, hormonal imbalances, menopause, weight management, thyroid disorders, skin issues, and mental well-being.",
    specialties: ["Ayurveda", "Clinical Dietetics", "Hormonal Health"],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Anushree Mahajan",
    title: "PCOS & Fertility Health Coach",
    bio: "Anushree is a PCOS & Fertility Health Coach, Entrepreneur, and Registered Yoga Teacher with a B.S. in Biology, a Master's in Public Health, and ICF certification. Anushree has helped over 100 women conceive naturally through her PCOS Transformation Coaching Program, focusing on balanced nutrition, lifestyle changes, and mindset.",
    specialties: ["PCOS", "Fertility", "Nutrition"],
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Dr. Shubhangee Satam",
    title: "M.D (Ayurveda)",
    bio: "Dr. Shubhangee B. Satam, specialized in Ayurvedic Botanicals, has around 27 years of herbal industry experience in addition to her clinical experience for more than 30 years. She is currently working as an Independent Consultant to the Herbal / Ayurvedic / Nutraceutical Industry. She travels extensively globally to conduct lectures, workshops, and one-to-one health consultations. She has to her credit several articles related to Ayurveda and health published in National and International magazines.",
    specialties: ["Ayurveda", "Herbal Medicine", "Research"],
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400&h=400&fit=crop&crop=faces",
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
