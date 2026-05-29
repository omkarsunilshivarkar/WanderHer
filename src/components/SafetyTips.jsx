import { useState } from 'react'
import { safetyTips } from '../data/safetyTips'
import '../styles/SafetyTips.css'

const categories = [
  { key: 'general', label: 'General Safety' },
  { key: 'transportation', label: 'Transportation Safety' },
  { key: 'accommodation', label: 'Accommodation Safety' },
  { key: 'cultural', label: 'Cultural Awareness' },
  { key: 'digital', label: 'Digital Safety' }
]

function SafetyTips() {
  const [selected, setSelected] = useState('general')

  const tips = safetyTips[selected] || []

  return (
    <div className="safetytips-wrapper">
      <div className="safetytips-header">
        <div className="header-badge">STAY PROTECTED</div>
        <h1>Essential Safety Tips</h1>
        <p>Comprehensive safety guidelines curated specifically for women solo travelers in India</p>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`category-tab ${selected === cat.key ? 'active' : ''}`}
            onClick={() => setSelected(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="tips-grid">
        {tips.map(tip => (
          <article key={tip.id} className="tip-card">
            <h3>{tip.title}</h3>
            <p>{tip.description}</p>
            <div className={`priority-badge priority-${tip.priority.toLowerCase()}`}>{tip.priority} Priority</div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default SafetyTips
