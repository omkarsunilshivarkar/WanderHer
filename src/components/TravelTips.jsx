import { useEffect, useState } from 'react'
import { travelTips } from '../data/travelTips'
import '../styles/TravelTips.css'

function TravelTips() {
  const [selectedTip, setSelectedTip] = useState(null)

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedTip(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <div className="traveltips-wrapper">
      <div className="traveltips-header">
        <div className="header-badge">PRO TIPS</div>
        <h1>Essential Travel Tips</h1>
        <p>Practical advice from experienced women travelers to make your journey smoother</p>
      </div>

      <div className="travel-tips-grid">
        {travelTips.map(section => (
          <article key={section.id} className="travel-tip-card">
            <button className="travel-tip-summary" onClick={() => setSelectedTip(section)}>
              <div className="travel-tip-content">
                <h3>{section.title}</h3>
                <p>{section.subtitle}</p>
                <span className="travel-tip-action">View</span>
              </div>
            </button>
          </article>
        ))}
      </div>

      {selectedTip && (
        <div className="travel-tip-modal-backdrop" onClick={() => setSelectedTip(null)}>
          <div className="travel-tip-modal" role="dialog" aria-modal="true" aria-labelledby="travel-tip-modal-title" onClick={(event) => event.stopPropagation()}>
            <button className="travel-tip-modal-close" type="button" aria-label="Close travel tips" onClick={() => setSelectedTip(null)}>
              x
            </button>
            <div className="travel-tip-modal-header">
              <h2 id="travel-tip-modal-title">{selectedTip.title}</h2>
              <p>{selectedTip.subtitle}</p>
            </div>
            <div className="modal-tips-list">
              {selectedTip.items.map((item, idx) => (
                <div key={idx} className="modal-tip-item">
                  <span>+</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TravelTips
