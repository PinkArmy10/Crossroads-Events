import ServeOpportunityCard from "../components/ServeOpportunityCard";
import "./Serve.css";

function Serve() {
  return (
    <div className="serve-page">
      <div>
        <h1>Serve</h1>
        <p className="serve-page__intro">
          There are many ways to serve our ward community. Choose an opportunity
          below to sign up and make a difference.
        </p>
      </div>

      <div className="serve-grid">
        <ServeOpportunityCard
          title="Help Clean the Chapel"
          description="Serve the Lord and the ward by helping clean the chapel on Saturdays at 9:00 AM."
          to="/serve/cleaning"
        />
      </div>
    </div>
  );
}

export default Serve;
