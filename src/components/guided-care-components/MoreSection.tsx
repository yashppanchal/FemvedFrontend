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
          We promise care that is human, not formulaic. Our experts are
          independent, deeply specialised, and free from rigid, brand-led or
          algorithm-driven wellness formats, so what you receive is truly
          personalised and responsive to your life. Having guided thousands of
          women through different life stages, our experts offer experienced,
          empathetic support, delivered seamlessly online to make meaningful care
          accessible and stress-free.
        </p>
      </div>

      <aside className="guidedProgramDetail__included card">
        <h3 className="guidedProgramDetail__includedTitle">
          What's included:
        </h3>

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
