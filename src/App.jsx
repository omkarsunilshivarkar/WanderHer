import EmergencyContacts from './components/EmergencyContacts'
import Checklist from './components/Checklist'
import SafetyTips from './components/SafetyTips'
import TravelTips from './components/TravelTips'
import Navbar from './components/Navbar'

const featuredDestinations = [
  {
    title: 'Island Retreats',
    description: 'Safe, scenic escapes with community guides and wellness tips.',
    tag: 'Relax'
  },
  {
    title: 'City Adventures',
    description: 'Cultural solo travel itineraries designed for women travelers.',
    tag: 'Explore'
  },
  {
    title: 'Mountains & Trails',
    description: 'Empowering outdoor trips with local experts and safety resources.',
    tag: 'Adventure'
  }
]

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />

      <div className="page-content">
        <section id="home" className="app-shell home-section">
          <header className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Solo travel safety hub</span>
              <h1>Explore the world with confidence beside you.</h1>
              <p>
                WanderHer brings emergency contacts, practical safety guidance, travel prep,
                and packing essentials into one calm space for women travelers.
              </p>
              <div className="hero-actions">
                <a className="primary-btn" href="#emergency">Get Help Fast</a>
                <a className="secondary-btn" href="#checklist">Open Checklist</a>
              </div>
              <div className="hero-highlights">
                <a className="hero-chip" href="#emergency">
                  <strong>Emergency Contacts</strong>
                  <span>Fast access to helplines</span>
                </a>
                <a className="hero-chip" href="#safety-tips">
                  <strong>Safety Tips</strong>
                  <span>Travel smart every step</span>
                </a>
                <a className="hero-chip" href="#checklist">
                  <strong>Pack Essentials</strong>
                  <span>Be ready for anything</span>
                </a>
              </div>
            </div>
            <div className="hero-image" aria-hidden="true">
              <div className="journey-card">
                <div className="route-map">
                  <span className="route-pin start"></span>
                  <span className="route-pin middle"></span>
                  <span className="route-pin end"></span>
                </div>
                <div className="status-card emergency-ready">
                  <span>112</span>
                  <strong>Emergency ready</strong>
                </div>
                <div className="status-card location-card">
                  <strong>Share live route</strong>
                  <span>Trusted contact synced</span>
                </div>
                <div className="status-card safety-score">
                  <span>92%</span>
                  <strong>Trip prep complete</strong>
                </div>
              </div>
            </div>
          </header>

          <section className="card-grid">
            {featuredDestinations.map((destination) => (
              <article key={destination.title} className="destination-card">
                <span className="tag">{destination.tag}</span>
                <h3>{destination.title}</h3>
                <p>{destination.description}</p>
              </article>
            ))}
          </section>

          <footer className="footer">
            <p>Built for women who love travel, freedom, and community.</p>
          </footer>
        </section>

        <section id="emergency" className="section-block">
          <EmergencyContacts />
        </section>

        <section id="safety-tips" className="section-block">
          <SafetyTips />
        </section>

        <section id="travel-tips" className="section-block">
          <TravelTips />
        </section>

        <section id="checklist" className="section-block">
          <Checklist />
        </section>
      </div>
    </div>
  )
}

export default App
