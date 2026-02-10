import "./Placeholder.scss";

type Props = {
  title: string;
  description?: string;
};

export default function Placeholder({ title, description }: Props) {
  return (
    <section className="page page--placeholder">
      <h1 className="page__title">{title}</h1>
      <p className="page__lead">{description ?? "Coming Soon"}</p>
    </section>
  );
}
