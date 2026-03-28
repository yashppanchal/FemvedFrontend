import "./WellnessLibrary.scss";

export function WellnessLibrary() {
  return (
    <section className="wellnessLibrary" aria-labelledby="wellness-library-heading">
      <div className="wellnessLibrary__inner">
        <h2 id="wellness-library-heading" className="wellnessLibrary__heading">
          Wellness Library
        </h2>
        <p className="wellnessLibrary__soon">Coming soon</p>
      </div>
    </section>
  );
}
