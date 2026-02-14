import "./Footer.scss";
import { Link } from "react-router-dom";
import { useId } from "react";
import { useCountry, COUNTRY_LIST, type CountryCode } from "../country/useCountry";
import logo from "../assets/logo.png";
import footerImage from "../assets/footerimage.jpg";

export function Footer() {
  const countrySelectId = useId();
  const { country, setCountry } = useCountry();

  return (
    <div className="footer">
      <div className="footer__top">
        <div className="footer__left">
          <div className="footer__columns" aria-label="Footer links">
            <div className="footer__col">
              <div className="footer__heading">WHO WE ARE</div>
              <ul className="footer__list">
                <li className="footer__item">
                  <Link className="footer__link" to="/about">
                    About us
                  </Link>
                </li>
                <li className="footer__item">
                  <Link className="footer__link" to="/learn/founders-story">
                    Our story
                  </Link>
                </li>
                <li className="footer__item">
                  <Link className="footer__link" to="/learn/know-your-experts">
                    Meet the team
                  </Link>
                </li>
              </ul>
            </div>

            <div className="footer__col">
              <div className="footer__heading">FOLLOW US</div>
              <ul className="footer__list">
                <li className="footer__item">
                  <a
                    className="footer__link"
                    href="https://www.instagram.com/femvedwellness/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li className="footer__item">
                  <a
                    className="footer__link"
                    href="https://www.youtube.com/@FemvedWellness"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Youtube
                  </a>
                </li>
                <li className="footer__item">
                  <a
                    className="footer__link"
                    href="https://www.linkedin.com/company/femvedwellness/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Linkedin
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer__col">
              <div className="footer__heading">SUPPORT</div>
              <ul className="footer__list">
                <li className="footer__item">
                  <Link className="footer__link" to="/contact">
                    Get in touch
                  </Link>
                </li>
                <li className="footer__item">
                  <Link className="footer__link" to="/terms">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer__brandRow" aria-label="Femved">
            <img className="footer__logo" src={logo} alt="Femved" />
          </div>
        </div>

        <aside className="footer__promo" aria-label="Newsletter signup" style={{ backgroundImage: `url(${footerImage})` }}>
          <div className="footer__promoOverlay" aria-hidden="true" />
          <div className="footer__promoContent">
            <div className="footer__promoTitle">Sign up to our newsletter</div>
            <form
              className="footer__promoForm"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="footer__srOnly" htmlFor="footerEmail">
                Email
              </label>
              <div className="footer__promoRow">
                <input
                  id="footerEmail"
                  className="footer__promoInput"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                />
                <button className="footer__promoBtn" type="submit">
                  <span className="footer__srOnly">Submit</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </div>
        </aside>
      </div>

      <div className="footer__divider" aria-hidden="true" />

      <div className="footer__below">
        <div className="footer__belowSpacer" aria-hidden="true" />

        <div className="footer__meta footer__meta--center">
          <span className="footer__copyright">
            © {new Date().getFullYear()} Femved
          </span>
        </div>

        <div className="footer__country footer__country--bottom">
          <label className="footer__srOnly" htmlFor={countrySelectId}>
            Country
          </label>
          <div className="footer__countryControl">
            <span className="footer__countryCode" aria-hidden="true">
              {country}
            </span>
            <select
              id={countrySelectId}
              className="footer__countrySelect"
              value={country}
              onChange={(e) => setCountry(e.target.value as CountryCode)}
              aria-label="Select country"
            >
              {COUNTRY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
