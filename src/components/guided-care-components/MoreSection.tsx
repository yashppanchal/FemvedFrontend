type MoreSectionProps = {
  whatsIncluded: string[];
};

export function MoreSection({ whatsIncluded }: MoreSectionProps) {
  return (
    <div className="guidedProgramDetail__more">
      <div className="guidedProgramDetail__moreContent">
        <h2 className="guidedProgramDetail__moreTitle">
          You're getting more than advice or a one-time consultation.
        </h2>
        <p className="guidedProgramDetail__moreBody">
          Care that feels human, not formulaic. Our independent, deeply
          specialised experts offer truly personalised support shaped around
          your life, not trends or algorithms. With experience guiding thousands
          of women, we bring empathetic, meaningful care to you online, making
          support simple and accessible
        </p>
      </div>

      <aside className="guidedProgramDetail__included card">
        <h3 className="guidedProgramDetail__includedTitle">What's included:</h3>

        {whatsIncluded.length ? (
          <ul className="guidedProgramDetail__includedList">
            {whatsIncluded.map((item, idx) => (
              <li className="guidedProgramDetail__includedItem" key={idx}>
                <span
                  className="guidedProgramDetail__includedCheck"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="guidedProgramDetail__includedText">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="guidedProgramDetail__includedEmpty">
            What's included details will be shared soon.
          </p>
        )}
      </aside>
    </div>
  );
}
