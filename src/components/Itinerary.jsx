import { useState } from 'react'
import { itineraries } from '../data/itineraries'
import '../styles/Itinerary.css'

function Itinerary() {
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  const filteredItineraries = difficultyFilter === 'all'
    ? itineraries
    : itineraries.filter(it => it.difficulty === difficultyFilter)

  const openModal = (itinerary) => {
    setSelectedItinerary(itinerary)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedItinerary(null)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className="itinerary-wrapper">
      <div className="itinerary-header">
        <div className="header-badge">WANDERING STORIES</div>
        <h1>Community Itineraries</h1>
        <p>Explore pre-planned itineraries created by experienced women travelers from around the world</p>
      </div>

      <div className="filter-section">
        <span className="filter-label">Filter by Difficulty:</span>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDifficultyFilter('all')}
          >
            All Levels
          </button>
          <button
            className={`filter-btn ${difficultyFilter === 'Easy' ? 'active' : ''}`}
            onClick={() => setDifficultyFilter('Easy')}
          >
            Easy
          </button>
          <button
            className={`filter-btn ${difficultyFilter === 'Medium' ? 'active' : ''}`}
            onClick={() => setDifficultyFilter('Medium')}
          >
            Medium
          </button>
          <button
            className={`filter-btn ${difficultyFilter === 'Hard' ? 'active' : ''}`}
            onClick={() => setDifficultyFilter('Hard')}
          >
            Hard
          </button>
        </div>
      </div>

      <div className="itineraries-grid">
        {filteredItineraries.map(itinerary => (
          <div key={itinerary.id} className="itinerary-card" onClick={() => openModal(itinerary)}>
            <div className="card-header">
              <div className="destination-tag">{itinerary.destination}</div>
            </div>

            <h3 className="card-title">{itinerary.title}</h3>
            <p className="card-description">{itinerary.description}</p>

            <div className="card-meta">
              <span className="meta-item">{itinerary.duration}</span>
              <span className="author-name">by {itinerary.author}</span>
            </div>

            <button className="read-more-btn">Read Full Itinerary -&gt;</button>
          </div>
        ))}
      </div>

      {selectedItinerary && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="Close">x</button>

            <div className="modal-header">
              <div>
                <div className="modal-destination">{selectedItinerary.destination}</div>
                <h2>{selectedItinerary.title}</h2>
              </div>
            </div>

            <div className="modal-meta">
              <div className="meta-block">
                <span className="label">Duration</span>
                <span className="value">{selectedItinerary.duration}</span>
              </div>
              <div className="meta-block">
                <span className="label">Author</span>
                <span className="value author-info">{selectedItinerary.author}</span>
              </div>
            </div>

            <div className="modal-itinerary">
              <h3>Detailed Itinerary</h3>
              <div className="itinerary-content">
                {selectedItinerary.fullItinerary.split('\n').map((line, idx) => {
                  if (line.startsWith('**')) {
                    return <h4 key={idx} className="itinerary-subheading">{line.replace(/\*\*/g, '')}</h4>
                  }
                  if (line.startsWith('-')) {
                    return <li key={idx}>{line.substring(1).trim()}</li>
                  }
                  if (line.trim() === '') {
                    return null
                  }
                  return <p key={idx}>{line}</p>
                })}
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn primary-btn" onClick={() => alert('Feature coming soon: Save to My Itineraries!')}>
                Save This Itinerary
              </button>
              <button className="action-btn secondary-btn" onClick={() => alert('Feature coming soon: Share with friends!')}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Itinerary
