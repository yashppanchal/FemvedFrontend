import "./PurchaseCard.scss";
import { useNavigate } from "react-router-dom";
import type { LibraryFeatureDto } from "../../api/library";
import { hasValidAccessToken, useAuth } from "../../auth/useAuth";

interface PurchaseCardProps {
  videoId: string;
  price: string;
  originalPrice?: string | null;
  features: LibraryFeatureDto[];
  isPurchased: boolean;
  videoSlug: string;
}

export default function PurchaseCard({
  videoId,
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
      <div className="purchaseCard__priceRow">
        <span className="purchaseCard__price">{price}</span>
        {originalPrice && (
          <span className="purchaseCard__originalPrice">{originalPrice}</span>
        )}
      </div>

      <p className="purchaseCard__access">One-time purchase. Lifetime access.</p>

      {isPurchased ? (
        <button type="button" className="purchaseCard__btn purchaseCard__btn--owned" disabled>
          Already purchased
        </button>
      ) : (
        <button type="button" className="purchaseCard__btn" onClick={handlePurchase}>
          Purchase now
        </button>
      )}

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
