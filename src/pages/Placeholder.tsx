import "./Placeholder.scss";
import RevealOnScroll from "../components/RevealOnScroll";

type Props = {
  title: string;
  description?: string;
};

export default function Placeholder({ title, description }: Props) {
  return (
    <section className="page">
      <RevealOnScroll className="page--placeholder">
        <h1 className="page__title">{title}</h1>
        <p className="page__lead">{description ?? "Coming Soon"}</p>
      </RevealOnScroll>
    </section>
  );
}
