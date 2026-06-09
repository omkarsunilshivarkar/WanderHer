import { useState, useEffect } from 'react'
import EmergencyContacts from './components/EmergencyContacts'
import Checklist from './components/Checklist'
import SafetyTips from './components/SafetyTips'
import TravelTips from './components/TravelTips'
import Itinerary from './components/Itinerary'
import AITripPlanner from './components/AITripPlanner'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="page-content">
        <Hero />

        <section id="emergency" className="section-block">
          <EmergencyContacts />
        </section>
        
        <section id="tips" className="section-block tips-section">
          <SafetyTips />
          <TravelTips />
        </section>

        <section id="itinerary" className="section-block">
          <Itinerary />
        </section>

        <section id="ai-planner" className="section-block">
          <AITripPlanner />
        </section>

        <section id="checklist" className="section-block">
          <Checklist />
        </section>
      </div>
    </div>
  )
}

export default App
