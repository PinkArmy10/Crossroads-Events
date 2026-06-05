import { Link } from "react-router-dom";

function ServeOpportunityCard({ title, description, to, ctaLabel = "Sign up to help" }) {
  return (
    <Link to={to} className="serve-card">
      <h2 className="serve-card__title">{title}</h2>
      <p className="serve-card__description">{description}</p>
      <span className="serve-card__cta">{ctaLabel}</span>
    </Link>
  );
}

export default ServeOpportunityCard;
