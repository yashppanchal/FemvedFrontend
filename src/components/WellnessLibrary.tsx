import { useRef } from "react";
import { FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./WellnessLibrary.scss";

type Course = {
  id: string;
  title: string;
  instructor: string;
  category: string;
  duration: string;
  lessons: number;
  imageUrl: string;
};

const courses: Course[] = [
  {
    id: "hormonal-balance",
    title: "Restore Hormonal Balance Naturally",
    instructor: "Dr. Ananya Mehta",
    category: "Hormonal Health",
    duration: "4h 20m",
    lessons: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "yoga-fertility",
    title: "Yoga for Fertility & Reproductive Health",
    instructor: "Priya Sharma",
    category: "Yoga & Movement",
    duration: "3h 45m",
    lessons: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "mindful-eating",
    title: "Mindful Eating for Every Life Stage",
    instructor: "Kavita Rao",
    category: "Nutrition",
    duration: "2h 50m",
    lessons: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "stress-resilience",
    title: "Building Stress Resilience with Ayurveda",
    instructor: "Dr. Meera Joshi",
    category: "Ayurveda",
    duration: "3h 10m",
    lessons: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "perimenopause",
    title: "Navigating Perimenopause with Confidence",
    instructor: "Dr. Sunita Iyer",
    category: "Menopause",
    duration: "5h 15m",
    lessons: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1591228127121-c36a027e2a75?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "breathwork",
    title: "Breathwork & Pranayama for Daily Calm",
    instructor: "Isha Nair",
    category: "Breathwork",
    duration: "2h 30m",
    lessons: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=80",
  },
];

export function WellnessLibrary() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.querySelector<HTMLElement>(
      ".wellnessLibrary__card",
    )?.offsetWidth;
    const gap = 20;
    const amount = (cardWidth ?? 320) + gap;
    trackRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="wellnessLibrary">
      <div className="wellnessLibrary__inner">
        {/* Header row */}
        <div className="wellnessLibrary__header">
          <div className="wellnessLibrary__copy">
            <h2 className="wellnessLibrary__heading">Wellness Library</h2>
            <p className="wellnessLibrary__sub">
              Pre-recorded courses by accredited women practitioners — learn at
              your own pace, on your own terms.
            </p>
          </div>

          <div className="wellnessLibrary__arrows">
            <button
              type="button"
              className="wellnessLibrary__arrow"
              aria-label="Scroll left"
              onClick={() => scroll("left")}
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              className="wellnessLibrary__arrow"
              aria-label="Scroll right"
              onClick={() => scroll("right")}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Horizontal scroll track */}
        <div className="wellnessLibrary__track" ref={trackRef}>
          {courses.map((course) => (
            <a
              key={course.id}
              className="wellnessLibrary__card"
              href="#"
              aria-label={course.title}
            >
              {/* Thumbnail */}
              <div className="wellnessLibrary__thumb">
                <img
                  className="wellnessLibrary__img"
                  src={course.imageUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="wellnessLibrary__play" aria-hidden="true">
                  <FaPlay />
                </span>
                <span className="wellnessLibrary__badge">{course.category}</span>
              </div>

              {/* Info */}
              <div className="wellnessLibrary__info">
                <h3 className="wellnessLibrary__title">{course.title}</h3>
                <p className="wellnessLibrary__instructor">{course.instructor}</p>
                <div className="wellnessLibrary__meta">
                  <span>{course.lessons} lessons</span>
                  <span className="wellnessLibrary__dot" aria-hidden="true" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
