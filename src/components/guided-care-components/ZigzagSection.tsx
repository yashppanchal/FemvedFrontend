import {
  buildCloudinarySrcSet,
  optimizeCloudinaryImageUrl,
} from "../../cloudinary/image";

// import easyConnect from "../../assets/benefits-guided-care/easyconnect.jpg";
// import comprehensivePersonal from "../../assets/benefits-guided-care/comprehensive.jpg";
// import freedomToCoCreate from "../../assets/benefits-guided-care/cocreate.jpg";
// import completePrivacy from "../../assets/benefits-guided-care/privacy.jpg";

const easyConnect =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965678/easyconnect_jobypt.jpg";
const comprehensivePersonal =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965677/comprehensive_mdfokt.jpg";
const freedomToCoCreate =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965678/cocreate_bvlczm.jpg";
const completePrivacy =
  "https://res.cloudinary.com/dh8aj0hzw/image/upload/v1772965676/privacy_d9qkoo.jpg";

const ZIGZAG_ITEMS = [
  {
    title: "Easy to connect",
    body: "Choose a ready-to-start wellness program and book instantly, with no appointments or fixed timelines. You and your expert decide the pace and connect online at a time that fits your life.",
    imageAlt: "Booking flow on tablet",
    imageSrc: easyConnect,
  },
  {
    title: "Comprehensive and extremely personal",
    body: "Your journey starts with a one-on-one consultation and moves into a clear action plan, which may include tailored meals, routines, movement guidance, supplement recommendations, and a personalised shopping list, depending on the expert's guidance.",
    imageAlt: "Choose your specialist on tablet",
    imageSrc: comprehensivePersonal,
  },
  {
    title: "Freedom to co-create",
    body: "This isn't a fixed or algorithm-led plan. You meet the expert you choose, they understand your health and life stage, and together you co-create a wellness plan that fits you, not a mass solution.",
    imageAlt: "Online consultation on tablet",
    imageSrc: freedomToCoCreate,
  },
  {
    title: "Complete privacy",
    body: "Your program is shaped only between you and your expert. We don't store your personal health data, and your conversations remain fully private, protected by complete expert–client confidentiality.",
    imageAlt: "Next steps summary on tablet",
    imageSrc: completePrivacy,
  },
];

export function ZigzagSection() {
  return (
    <section
      className="guidedProgramDetail__zigzag"
      aria-labelledby="guidedProgramDetail-zigzag-title"
    >
      <div className="guidedProgramDetail__zigzagIntro">
        <h2
          id="guidedProgramDetail-zigzag-title"
          className="guidedProgramDetail__zigzagTitle"
        >
          Your wellness, your plan, guided by experts who understand
        </h2>
        <p className="guidedProgramDetail__zigzagSubtext">
          We offer 1-1 guidance by globally accredited experts and coaches to
          support your health with diet, lifestyle, and nutrition plans fully
          tailored to your lifestyle and medical history. But it is more than a
          personalised program. Here is what you can expect from our platform
          and our experts.
        </p>
      </div>

      <div className="guidedProgramDetail__zigzagRows">
        {ZIGZAG_ITEMS.map((item, idx) => (
          <article
            key={`${item.title}-${idx}`}
            className={`guidedProgramDetail__zigzagRow${
              idx % 2 ? " guidedProgramDetail__zigzagRow--reverse" : ""
            }`}
          >
            <div className="guidedProgramDetail__zigzagMedia">
              <img
                className="guidedProgramDetail__zigzagImage"
                src={optimizeCloudinaryImageUrl(item.imageSrc, {
                  width: 920,
                })}
                srcSet={buildCloudinarySrcSet(item.imageSrc, [480, 720, 920, 1200])}
                sizes="(max-width: 980px) 100vw, 50vw"
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="guidedProgramDetail__zigzagContent">
              <h3 className="guidedProgramDetail__zigzagItemTitle">
                {item.title}
              </h3>
              <p className="guidedProgramDetail__zigzagItemBody">{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
