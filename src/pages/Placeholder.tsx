import "./Placeholder.scss";

type Props = {
  title: string;
  description?: string;
};

export default function Placeholder({ title, description }: Props) {
  return (
    <section className="page page--placeholder">
      <h1 className="page__title">{title}</h1>
      <p className="page__lead">{description ?? "This page is coming soon."}</p>
      <div className="card">
        <p className="card__text">
          We’ll connect this to your backend and render real content (experts,
          programs, sessions, events, retreats) when the APIs are ready.
        </p>
      </div>
    </section>
  );
}
