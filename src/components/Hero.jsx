import '../styles/Hero.css'
import heroImage from '../wanderHer_mascot.png'

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-label">TRAVEL SMARTER. TRAVEL SAFER.</span>
          <h1 className="hero-title">Explore the World with Confidence.</h1>
          <p className="hero-description">
            WanderHer brings personalized AI itineraries, real recommendations from women travelers, trusted accommodations, and much more—all in one app.
          </p>
          <div className="hero-buttons">
            <a href="#ai-planner" className="btn btn-primary">
              AI Trip Planner
            </a>
            <a href="#itinerary" className="btn btn-secondary">
              View Itineraries
            </a>
          </div>
        </div>

        <div className="hero-image-container">
          <img
            src={heroImage}
            alt="Woman traveling the world"
            className="hero-mascot"
          />
        </div>
      </div>
    </section>
  )
}
