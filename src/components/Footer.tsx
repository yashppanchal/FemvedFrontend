import "./Footer.scss";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <div className="footer">
      <span className="footer__text">© {new Date().getFullYear()} Femved</span>
      <span className="footer__sep" aria-hidden="true">
        •
      </span>
      <Link className="footer__link" to="/contact">
        Contact
      </Link>
    </div>
  );
}
