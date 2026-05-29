import { useState, useEffect } from 'react'
import { checklistData } from '../data/checklistItems'
import '../styles/Checklist.css'

function Checklist() {
  const [checkedItems, setCheckedItems] = useState({})

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('checklistItems')
    if (saved) {
      setCheckedItems(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage whenever checkedItems changes
  useEffect(() => {
    localStorage.setItem('checklistItems', JSON.stringify(checkedItems))
  }, [checkedItems])

  const handleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all items?')) {
      setCheckedItems({})
    }
  }

  const calculateProgress = (items) => {
    const checked = items.filter(item => checkedItems[item.id]).length
    return Math.round((checked / items.length) * 100)
  }

  const beforeProgress = calculateProgress(checklistData.beforeTrip)
  const duringProgress = calculateProgress(checklistData.duringTrip)
  const packingProgress = calculateProgress(checklistData.packingEssentials)
  const overallProgress = calculateProgress([
    ...checklistData.beforeTrip,
    ...checklistData.duringTrip,
    ...checklistData.packingEssentials
  ])

  const ChecklistSection = ({ title, icon, items, progress }) => (
    <div className="checklist-section">
      <div className="section-header">
        <div className="section-title">
          <span className="section-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        <div className="progress-badge">{progress}%</div>
      </div>
      <div className="checklist-items">
        {items.map(item => (
          <label key={item.id} className="checklist-item">
            <input
              type="checkbox"
              checked={checkedItems[item.id] || false}
              onChange={() => handleCheck(item.id)}
              className="checkbox-input"
            />
            <span className={`checkbox-custom ${checkedItems[item.id] ? 'checked' : ''}`}>
              {checkedItems[item.id] && '✓'}
            </span>
            <span className={`item-text ${checkedItems[item.id] ? 'completed' : ''}`}>
              {item.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="checklist-wrapper">
      {/* Header */}
      <div className="checklist-header">
        <div className="header-badge">GET PREPARED</div>
        <h1>Travel Safety Checklist</h1>
        <p>Interactive checklist to ensure you're fully prepared for your solo adventure</p>
      </div>

      {/* Overall Progress */}
      <div className="overall-progress">
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <span className="progress-text">Overall Progress: {overallProgress}%</span>
        </div>
        <button className="reset-all-btn" onClick={handleResetAll}>
          ↻ Reset All
        </button>
      </div>

      {/* Checklist Sections */}
      <div className="checklist-container">
        <ChecklistSection
          title="Before Your Trip"
          icon="📋"
          items={checklistData.beforeTrip}
          progress={beforeProgress}
        />
        <ChecklistSection
          title="During Your Trip"
          icon="✈️"
          items={checklistData.duringTrip}
          progress={duringProgress}
        />
        <ChecklistSection
          title="Packing Essentials"
          icon="🎒"
          items={checklistData.packingEssentials}
          progress={packingProgress}
        />
      </div>

      {/* Pro Tip */}
      <div className="pro-tip">
        <span className="pro-tip-icon">💡</span>
        <div className="pro-tip-content">
          <strong>Pro Tip:</strong> Take a screenshot of your completed checklist and share it with a trusted friend or family member before your trip!
        </div>
      </div>
    </div>
  )
}

export default Checklist
