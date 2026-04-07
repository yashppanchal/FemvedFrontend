import "./InstructorStrip.scss";

interface InstructorStripProps {
  name: string;
  title: string;
  bio?: string | null;
}

export default function InstructorStrip({ name, title, bio }: InstructorStripProps) {
  return (
    <section className="instructorStrip">
      <h2 className="instructorStrip__heading">Your Instructor</h2>
      <div className="instructorStrip__card">
        <div className="instructorStrip__avatar" aria-hidden="true">
          {name.charAt(0)}
        </div>
        <div className="instructorStrip__info">
          <h3 className="instructorStrip__name">{name}</h3>
          <p className="instructorStrip__title">{title}</p>
          {bio && <p className="instructorStrip__bio">{bio}</p>}
        </div>
      </div>
    </section>
  );
}
