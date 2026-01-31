import { Link } from "react-router-dom";
import "./NotFound.scss";

export default function NotFound() {
  return (
    <section className="page page--notFound">
      <h1 className="page__title">Page not found</h1>
      <p className="page__lead">
        That route doesn’t exist. Go back <Link to="/">home</Link>.
      </p>
    </section>
  );
}
