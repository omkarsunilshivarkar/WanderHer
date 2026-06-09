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
        <div className="emergency-badge">IN EMERGENCY ?</div>
        <h1>Emergency Contacts</h1>
        <p>Quick access to all essential helplines and safety resources across India</p>
      </div>

      {/* Danger Alert Section */}
      <section className="danger-alert">
        <div className="danger-left-section">
          <div className="danger-icon">⚠️</div>
          <div className="danger-content">
            <h2>In Immediate Danger?</h2>
            <p>India's unified emergency number</p>
          </div>
        </div>
        <div className="danger-right-section">
          <div className="danger-number">112</div>
          <a href="tel:112" className="danger-btn-call">
            <span>☎️</span>
          </a>
        </div>
      </section>

      {/* National Helplines */}
      <section className="national-helplines">
        <h2>National Helplines</h2>
        <div className="helplines-grid">
          {nationalHelplines.map((helpline) => (
            <div key={helpline.id} className="helpline-card-grid">
              <div className="helpline-left-section">
                <div className="helpline-content-grid">
                  <h3 className="helpline-title-grid">{helpline.name}</h3>
                </div>
              </div>
              <div className="helpline-actions-grid">
                <div className="helpline-number-grid">
                  {helpline.number}
                </div>
                <a
                  href={`tel:${helpline.number}`}
                  className="helpline-call-btn-grid"
                  title={`Call ${helpline.number}`}
                >
                  <span className="call-icon">☎️</span>
                </a>
              </div>
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
              <div className="helpline-left-section">
                <h3 className="state-helpline-title">{helpline.name}</h3>
                <p className="state-helpline-desc">{helpline.description}</p>
              </div>
              <div className="helpline-actions-grid">
                <div className="helpline-number-grid">
                  {helpline.number}
                </div>
                <a
                  href={`tel:${helpline.number}`}
                  className="helpline-call-btn-grid"
                  title={`Call ${helpline.number}`}
                >
                  <span className="call-icon">☎️</span>
                </a>
              </div>
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
              <div className="app-left-section">
                <div className="app-content">
                  <h3 className="app-name">{app.name}</h3>
                  <p className="app-desc">{app.description}</p>
                </div>
              </div>
              <div className="app-platforms">
                <div className="app-icon">{app.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default EmergencyContacts
