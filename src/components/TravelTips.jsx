import { useState } from 'react'
import { travelTips } from '../data/travelTips'
import '../styles/TravelTips.css'

function TravelTips() {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => setOpenId(openId === id ? null : id)

  return (
    <div className="traveltips-wrapper">
      <div className="traveltips-header">
        <div className="header-badge">PRO TIPS</div>
        <h1>Essential Travel Tips</h1>
        <p>Practical advice from experienced women travelers to make your journey smoother</p>
      </div>

      <div className="accordion">
        {travelTips.map(section => (
          <div key={section.id} className={`accordion-item ${openId === section.id ? 'open' : ''}`}>
            <button className="accordion-summary" onClick={() => toggle(section.id)}>
              <div className="summary-left">
                <div className="icon">📌</div>
                <div>
                  <div className="summary-title">{section.title}</div>
                  <div className="summary-sub">{section.subtitle}</div>
                </div>
              </div>
              <div className="summary-action">{openId === section.id ? '−' : '+'}</div>
            </button>

            {openId === section.id && (
              <div className="accordion-panel">
                <div className="panel-grid">
                  {section.items.map((it, idx) => (
                    <div key={idx} className="panel-item">✓ {it}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TravelTips
