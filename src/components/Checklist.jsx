import { useEffect, useState } from 'react'
import { checklistData } from '../data/checklistItems'
import '../styles/Checklist.css'

function Checklist() {
  const [checkedItems, setCheckedItems] = useState({})
  const [activeTab, setActiveTab] = useState('beforeTrip')

  useEffect(() => {
    const saved = localStorage.getItem('checklistItems')
    if (saved) {
      setCheckedItems(JSON.parse(saved))
    }
  }, [])

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

  const checklistTabs = [
    {
      key: 'beforeTrip',
      title: 'Before Your Trip',
      items: checklistData.beforeTrip,
      progress: beforeProgress
    },
    {
      key: 'duringTrip',
      title: 'During Your Trip',
      items: checklistData.duringTrip,
      progress: duringProgress
    },
    {
      key: 'packingEssentials',
      title: 'Packing Essentials',
      items: checklistData.packingEssentials,
      progress: packingProgress
    }
  ]

  const activeSection = checklistTabs.find(tab => tab.key === activeTab) || checklistTabs[0]

  const ChecklistSection = ({ title, items, progress }) => (
    <div className="checklist-section">
      <div className="section-header">
        <div className="section-title">
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
      <div className="checklist-header">
        <div className="header-badge">GET PREPARED</div>
        <h1>Travel Safety Checklist</h1>
        <p>Interactive checklist to ensure you're fully prepared for your solo adventure</p>
      </div>

      <div className="overall-progress">
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <span className="progress-text">Overall Progress: {overallProgress}%</span>
        </div>
        <button className="reset-all-btn" onClick={handleResetAll}>
          Reset All
        </button>
      </div>

      <div className="checklist-tabs">
        {checklistTabs.map(tab => (
          <button
            key={tab.key}
            className={`checklist-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.title}</span>
            <strong>{tab.progress}%</strong>
          </button>
        ))}
      </div>

      <div className="checklist-container">
        <ChecklistSection
          title={activeSection.title}
          items={activeSection.items}
          progress={activeSection.progress}
        />
      </div>
    </div>
  )
}

export default Checklist
