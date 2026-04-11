import "./PurchaseCard.scss";
import { useNavigate } from "react-router-dom";
import type { LibraryFeatureDto } from "../../api/library";
import { hasValidAccessToken, useAuth } from "../../auth/useAuth";

interface PurchaseCardProps {
  videoId: string;
  title: string;
  eyebrow: string;
  expertName: string;
  price: string;
  originalPrice?: string | null;
  features: LibraryFeatureDto[];
  isPurchased: boolean;
  videoSlug: string;
}

export default function PurchaseCard({
  videoId,
  title,
  eyebrow,
  expertName,
  price,
  originalPrice,
  features,
  isPurchased,
  videoSlug,
}: PurchaseCardProps) {
  const navigate = useNavigate();
  const { tokens } = useAuth();

  function handlePurchase() {
    if (!hasValidAccessToken(tokens)) {
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    navigate("/payment/select-provider", {
      state: {
        videoId,
        videoSlug,
        countryCode: "GB", // will be resolved by the backend
      },
    });
  }

  return (
    <aside className="purchaseCard">
      <p className="purchaseCard__eyebrow">{eyebrow}</p>
      <h2 className="purchaseCard__title">{title}</h2>
      <p className="purchaseCard__instructor">
        Led by <strong>{expertName}</strong>
      </p>

      {originalPrice && (
        <p className="purchaseCard__originalLine">
          <span className="purchaseCard__originalPrice">{originalPrice}</span>
        </p>
      )}

      {isPurchased ? (
        <button type="button" className="purchaseCard__btn purchaseCard__btn--owned" disabled>
          Already purchased
        </button>
      ) : (
        <button type="button" className="purchaseCard__btn" onClick={handlePurchase}>
          Purchase — {price}
        </button>
      )}

      <p className="purchaseCard__access">One-time purchase. Lifetime access.</p>

      {features.length > 0 && (
        <ul className="purchaseCard__features">
          {features.map((f, i) => (
            <li key={i} className="purchaseCard__feature">
              <span className="purchaseCard__featureIcon">{f.icon}</span>
              <span>{f.description}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
