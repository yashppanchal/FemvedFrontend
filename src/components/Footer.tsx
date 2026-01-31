import "./Footer.scss";

export function Footer() {
  return (
    <div className="footer">
      <span className="footer__text">© {new Date().getFullYear()} Femved</span>
      <span className="footer__sep" aria-hidden="true">
        •
      </span>
      <a className="footer__link" href="#/contact">
        Contact
      </a>
    </div>
  );
}
