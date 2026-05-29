import { useState } from 'react'
import { nationalHelplines, stateHelplines, safetyApps } from '../data/helplines'
import '../styles/EmergencyContacts.css'

function EmergencyContacts() {
  const [selectedState, setSelectedState] = useState('delhi')
  const [copiedNumber, setCopiedNumber] = useState(null)

  const handleCopy = (number) => {
    navigator.clipboard.writeText(number)
    setCopiedNumber(number)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  const stateNames = {
    delhi: 'Delhi',
    maharashtra: 'Maharashtra',
    karnataka: 'Karnataka',
    tamilnadu: 'Tamil Nadu',
    rajasthan: 'Rajasthan',
    kerala: 'Kerala',
    goa: 'Goa'
  }

  return (
    <div className="emergency-contacts">
      {/* Header Section */}
      <div className="emergency-header">
        <div className="emergency-badge">🆘 IN EMERGENCY?</div>
        <h1>Emergency Contacts</h1>
        <p>Quick access to all essential helplines and safety resources across India</p>
      </div>

      {/* Danger Alert Section */}
      <section className="danger-alert">
        <div className="alert-warning">⚠️</div>
        <div className="alert-content">
          <h2>In Immediate Danger?</h2>
          <p>Call 112 - India's unified emergency number (equivalent to 911)</p>
          <button className="danger-btn">☎️ Call 112 Now</button>
        </div>
      </section>

      {/* National Helplines */}
      <section className="national-helplines">
        <h2>National Helplines</h2>
        <div className="helplines-grid">
          {nationalHelplines.map((helpline) => (
            <div key={helpline.id} className="helpline-card">
              <div className="helpline-icon">{helpline.icon}</div>
              <div className="helpline-info">
                <h3>{helpline.name}</h3>
                <p className="helpline-desc">{helpline.description}</p>
                <div className="helpline-number">{helpline.number}</div>
              </div>
              <button
                className={`copy-btn ${copiedNumber === helpline.number ? 'copied' : ''}`}
                onClick={() => handleCopy(helpline.number)}
              >
                {copiedNumber === helpline.number ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* State-wise Helplines */}
      <section className="state-helplines">
        <h2>State-wise Helplines</h2>
        
        <div className="state-selector">
          {Object.entries(stateNames).map(([key, name]) => (
            <button
              key={key}
              className={`state-btn ${selectedState === key ? 'active' : ''}`}
              onClick={() => setSelectedState(key)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="state-helplines-grid">
          {stateHelplines[selectedState]?.map((helpline, index) => (
            <div key={index} className="state-helpline-card">
              <div className="state-helpline-info">
                <h3>{helpline.name}</h3>
                <p>{helpline.description}</p>
                <div className="state-number">{helpline.number}</div>
              </div>
              <button
                className={`copy-btn ${copiedNumber === helpline.number ? 'copied' : ''}`}
                onClick={() => handleCopy(helpline.number)}
              >
                {copiedNumber === helpline.number ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Apps */}
      <section className="safety-apps">
        <h2>Safety Apps to Download</h2>
        <div className="apps-grid">
          {safetyApps.map((app) => (
            <div key={app.id} className="app-card">
              <div className="app-icon">{app.icon}</div>
              <h3>{app.name}</h3>
              <p>{app.description}</p>
              <div className="app-platforms">
                {app.platforms.map((platform) => (
                  <span key={platform} className="platform-badge">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default EmergencyContacts
