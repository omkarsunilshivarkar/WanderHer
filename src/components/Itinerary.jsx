import { useEffect, useState } from 'react'
import {
  getItineraries as apiGetItineraries,
  createItinerary as apiCreateItinerary,
  deleteItinerary as apiDeleteItinerary
} from '../api/itineraryApi'
import '../styles/Itinerary.css'
import '../styles/ItineraryShareForm.css'
import { useAuth } from '../auth/AuthContext'


function normalizeLineBreaks(text) {
  return (text || '').replace(/\r\n/g, '\n')
}

function capitalizeName(name) {
  if (!name) return ''
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatDuration(duration) {
  if (!duration) return ''
  const trimmed = duration.trim()
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed} Days`
  }
  const match = trimmed.match(/^(\d+)\s*(days|day)?$/i)
  if (match) {
    const num = match[1]
    const unit = num === '1' ? 'Day' : 'Days'
    return `${num} ${unit}`
  }
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function Itinerary() {
  const { user, token, isAuthenticated } = useAuth()

  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [itineraryToDelete, setItineraryToDelete] = useState(null)
  const [isAuthRequiredModalOpen, setIsAuthRequiredModalOpen] = useState(false)


  const [shareForm, setShareForm] = useState({
    destination: '',
    title: '',
    duration: '',
    author: '',
    description: '',
    fullItinerary: ''
  })


  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await apiGetItineraries()
        setItineraries(data.itineraries || [])
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load itineraries')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openModal = (itinerary, e) => {
    if (e && e.target && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
      return
    }
    setSelectedItinerary(itinerary)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedItinerary(null)
    document.body.style.overflow = 'auto'
  }

  const openShareModal = () => {
    if (!isAuthenticated) {
      setIsAuthRequiredModalOpen(true)
      return
    }

    // Avoid overlap with itinerary-details modal
    if (selectedItinerary) return
    setIsShareModalOpen(true)
    document.body.style.overflow = 'hidden'
  }


  const closeShareModal = () => {
    setIsShareModalOpen(false)
    document.body.style.overflow = 'auto'
  }

  const confirmDeleteItinerary = async () => {
    if (!itineraryToDelete) return

    try {
      await apiDeleteItinerary(itineraryToDelete.id, token)
      setItineraries((prev) => prev.filter((x) => x.id !== itineraryToDelete.id))

      if (selectedItinerary?.id === itineraryToDelete.id) {
        setSelectedItinerary(null)
        document.body.style.overflow = 'auto'
      }
      setItineraryToDelete(null)
    } catch (err) {
      alert(err.message || 'Failed to delete itinerary')
    }
  }



  const handleShareFormChange = (e) => {
    const { name, value } = e.target
    setShareForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAIEnhance = async () => {
    if (!shareForm.fullItinerary.trim()) return

    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey) {
      alert('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env.local file')
      return
    }

    setIsEnhancing(true)

    try {
      const prompt = `You are an expert travel assistant. Analyze the following travel itinerary draft and enhance/format it.
Also, generate a catchy title (e.g. "Jaipur: Palaces & Desert Culture") and a brief 1-line short description (under 120 characters) for it.

Output the response strictly as a JSON object with the following keys:
1. "title": An engaging, properly capitalized title.
2. "description": A concise, engaging 1-liner description of the trip.
3. "fullItinerary": The polished, enhanced day-by-day itinerary.

CRITICAL FORMATTING RULES FOR "fullItinerary":
1. Every day or major section header MUST start with "**" and end with "**". Example: "**Day 1: Arrival & Exploring Jaipur**"
2. Every individual activity, morning/afternoon/evening plan, or specific action item MUST start with a dash "-". Example: "- Morning: Visit the Hawa Mahal"
3. Avoid raw HTML tags.
4. Keep the style encouraging, helpful, and safety-conscious.
5. Make it sequential and clean.

Original Draft to Enhance:
${shareForm.fullItinerary}`

      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to enhance itinerary with AI')
      }

      const data = await response.json()
      const content = data.choices[0].message.content.trim()

      let result
      try {
        result = JSON.parse(content)
      } catch (e) {
        console.error('Failed to parse JSON response from Groq, falling back to full text:', e)
        result = {
          title: shareForm.title,
          description: shareForm.description,
          fullItinerary: content
        }
      }

      setShareForm((prev) => {
        let finalFullItinerary = prev.fullItinerary
        if (result.fullItinerary) {
          if (Array.isArray(result.fullItinerary)) {
            finalFullItinerary = result.fullItinerary.join('\n')
          } else if (typeof result.fullItinerary === 'string') {
            finalFullItinerary = result.fullItinerary
          } else {
            finalFullItinerary = String(result.fullItinerary)
          }
        }
        return {
          ...prev,
          title: result.title ? capitalizeName(result.title) : prev.title,
          description: result.description ? capitalizeName(result.description) : prev.description,
          fullItinerary: finalFullItinerary.trim()
        }
      })
    } catch (err) {
      console.error(err)
      alert(err.message || 'Error enhancing itinerary. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleAddToCommunity = async (e) => {
    e.preventDefault()

    const payload = {
      destination: shareForm.destination.trim() ? capitalizeName(shareForm.destination) : '',
      title: shareForm.title.trim() ? capitalizeName(shareForm.title) : '',
      duration: shareForm.duration.trim() ? formatDuration(shareForm.duration) : '',
      author: shareForm.author.trim() ? capitalizeName(shareForm.author) : undefined,
      description: shareForm.description.trim() ? capitalizeName(shareForm.description) : undefined,
      fullItinerary: normalizeLineBreaks(shareForm.fullItinerary).trim()
    }

    if (!payload.destination || !payload.title || !payload.duration || !payload.fullItinerary) {
      alert('Please fill: Destination, Title, Duration, and Full Itinerary')
      return
    }

    try {
      const response = await apiCreateItinerary(payload, token)
      const newItinerary = response.itinerary

      setItineraries((prev) => [newItinerary, ...prev])

      setShareForm({
        destination: '',
        title: '',
        duration: '',
        author: '',
        description: '',
        fullItinerary: ''
      })

      closeShareModal()
      openModal(newItinerary)
    } catch (err) {
      alert(err.message || 'Failed to share itinerary')
    }
  }

  const getShareText = (it) => {
    const lines = [
      `WanderHer Itinerary: ${it.title}`,
      `Destination: ${it.destination}`,
      `Duration: ${it.duration}`,
      `Author: ${it.author}`,
      '',
      (it.fullItinerary || '').trim()
    ]

    return lines.join('\n')
  }

  const shareItinerary = async () => {
    if (!selectedItinerary) return

    const text = getShareText(selectedItinerary)

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        alert('Itinerary copied to clipboard!')
        return
      }
    } catch {
      // fallback below
    }

    // fallback: download as text
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedItinerary.title.replace(/\s+/g, '-').toLowerCase()}-itinerary.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const saveItinerary = () => {
    if (!selectedItinerary) return

    const text = getShareText(selectedItinerary)

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedItinerary.title.replace(/\s+/g, '-').toLowerCase()}-itinerary.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="itinerary-wrapper">
      <div className="itinerary-header">
        <div className="header-badge">WANDERING STORIES</div>
        <h1>Community Itineraries</h1>
        <p>Explore pre-planned itineraries created by experienced women travelers from around the world</p>
      </div>

      <div className="share-form-wrap" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        <div className="share-form-header" style={{ marginBottom: 16, alignItems: 'center' }}>
          <div>
            <h2>Contribute to the Community</h2>
            <p>Have a trip you've already done? Share your itinerary and help others plan with confidence.</p>
          </div>

          <div>
            <button type="button" className="action-btn primary-btn" onClick={openShareModal}>
              Share your Itinerary
            </button>
          </div>
        </div>

        {isShareModalOpen && (
          <div className="modal-overlay" onClick={closeShareModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeShareModal} aria-label="Close">
                x
              </button>


              <div className="share-form-wrap" style={{ border: 'none', boxShadow: 'none', padding: 0, margin: 0, maxWidth: 'none' }}>
                <div className="share-form-header">
                  <div>
                    <h2>Share Your Itinerary</h2>
                    <p>Add your own travel plan to the community.</p>
                  </div>
                </div>

                <form onSubmit={handleAddToCommunity}>
                  <div className="share-form-grid">
                    <div className="share-field">
                      <label htmlFor="destination">
                        Destination *
                        <span className="tooltip-trigger">
                          ⓘ
                          <span className="tooltip-text">Enter the city, region, or country (e.g. Jaipur, Goa). Title Case is applied automatically.</span>
                        </span>
                      </label>
                      <input
                        id="destination"
                        name="destination"
                        value={shareForm.destination}
                        onChange={handleShareFormChange}
                        placeholder="e.g., Jaipur, Goa, Kerala"
                        required
                      />
                    </div>

                    <div className="share-field">
                      <label htmlFor="title">
                        Title *
                        <span className="tooltip-trigger">
                          ⓘ
                          <span className="tooltip-text">Make it catchy and descriptive (e.g. Rajasthan Royal Tour) or click ✨ Enhance with AI.</span>
                        </span>
                      </label>
                      <input
                        id="title"
                        name="title"
                        value={shareForm.title}
                        onChange={handleShareFormChange}
                        placeholder="e.g., Rajasthan Royal Tour"
                        required
                      />
                    </div>

                    <div className="share-field">
                      <label htmlFor="duration">
                        Duration *
                        <span className="tooltip-trigger">
                          ⓘ
                          <span className="tooltip-text">Number of days (e.g. '5' or '5 days'). We will automatically format it to '5 Days'.</span>
                        </span>
                      </label>
                      <input
                        id="duration"
                        name="duration"
                        value={shareForm.duration}
                        onChange={handleShareFormChange}
                        placeholder="e.g., 5 days"
                        required
                      />
                    </div>

                    <div className="share-field">
                      <label htmlFor="author">
                        Your name
                        <span className="tooltip-trigger">
                          ⓘ
                          <span className="tooltip-text">Your display name or handle. Capitalized automatically.</span>
                        </span>
                      </label>
                      <input
                        id="author"
                        name="author"
                        value={shareForm.author}
                        onChange={handleShareFormChange}
                        placeholder="e.g., Priya Sharma"
                      />
                    </div>

                    <div className="share-field share-wide">
                      <label htmlFor="description">
                        Short description
                        <span className="tooltip-trigger">
                          ⓘ
                          <span className="tooltip-text">A brief 1-liner summary of your trip (under 120 characters). E.g. 'A relaxing weekend in sunny Goa'.</span>
                        </span>
                      </label>
                      <input
                        id="description"
                        name="description"
                        value={shareForm.description}
                        onChange={handleShareFormChange}
                        placeholder="1-liner about your trip"
                      />
                    </div>

                    <div className="share-field share-wide">
                      <div className="share-field-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label htmlFor="fullItinerary" style={{ margin: 0, display: 'inline-flex', alignItems: 'center' }}>
                          Full itinerary *
                          <span className="tooltip-trigger">
                            ⓘ
                            <span className="tooltip-text">Detailed day-by-day plan. You can write simple notes and click ✨ Enhance with AI to format it.</span>
                          </span>
                        </label>
                        <button
                          type="button"
                          className="ai-enhance-btn"
                          onClick={handleAIEnhance}
                          disabled={isEnhancing || !shareForm.fullItinerary.trim()}
                        >
                          {isEnhancing ? (
                            <>
                              <span className="spinner"></span>
                              Enhancing...
                            </>
                          ) : (
                            '✨ Enhance with AI'
                          )}
                        </button>
                      </div>
                      <textarea
                        id="fullItinerary"
                        name="fullItinerary"
                        value={shareForm.fullItinerary}
                        onChange={handleShareFormChange}
                        placeholder={`Use formatting like:\n**Day 1: ...**\n- Morning: ...\n- Evening: ...`}
                        required
                      />
                      <div className="share-helper">
                        Tip: Headings start with <code>**</code> and bullet points start with <code>-</code>.
                      </div>
                    </div>
                  </div>

                  <div className="share-actions">
                    <button type="submit" className="action-btn primary-btn">
                      Add to Community
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>




      {loading && (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>Loading community itineraries...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && itineraries.length === 0 && (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p>No community itineraries shared yet. Be the first to share one!</p>
        </div>
      )}

      {!loading && !error && itineraries.length > 0 && (
        <div className="itineraries-grid">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="itinerary-card"
              onClick={(e) => openModal(itinerary, e)}
              role="button"
              tabIndex={0}
            >
              <div className="card-header">
                <div className="destination-tag">{itinerary.destination}</div>
              </div>

              <h3 className="card-title">{itinerary.title}</h3>
              <p className="card-description">{itinerary.description}</p>

              <div className="card-meta">
                <span className="meta-item">{itinerary.duration}</span>
                <span className="author-name">by {itinerary.author}</span>
              </div>

              <button
                className="read-more-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  openModal(itinerary)
                }}
              >
                Read Full Itinerary -›
              </button>

              {itinerary._source === 'user' && isAuthenticated && user && itinerary.userId === user.id && (
                <button
                  className="action-btn secondary-btn"
                  style={{ width: '100%', marginTop: 10 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setItineraryToDelete(itinerary)
                  }}
                >
                  Delete
                </button>
              )}

            </div>

          ))}
        </div>
      )}

      {
        selectedItinerary && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Close">
                x
              </button>

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
                  {normalizeLineBreaks(selectedItinerary.fullItinerary)
                    .split('\n')
                    .map((line, idx) => {
                      if (line.startsWith('**')) {
                        return (
                          <h4 key={idx} className="itinerary-subheading">
                            {line.replace(/\*\*/g, '')}
                          </h4>
                        )
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
                <button className="action-btn primary-btn" onClick={saveItinerary}>
                  Save This Itinerary
                </button>
                <button className="action-btn secondary-btn" onClick={shareItinerary}>
                  Share
                </button>
              </div>
            </div>
          </div>
        )
      }

      {itineraryToDelete && (
        <div className="modal-overlay" onClick={() => setItineraryToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setItineraryToDelete(null)} aria-label="Close">
              x
            </button>
            <h2 style={{ color: '#1a3a52', marginBottom: '16px' }}>Confirm Delete</h2>
            <p style={{ color: '#4B5563', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>“{itineraryToDelete.title}”</strong> from the community?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="action-btn secondary-btn"
                onClick={() => setItineraryToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="action-btn primary-btn"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                onClick={confirmDeleteItinerary}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isAuthRequiredModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAuthRequiredModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="modal-close-btn" onClick={() => setIsAuthRequiredModalOpen(false)} aria-label="Close">
              x
            </button>
            <h2 style={{ color: '#1a3a52', marginBottom: '16px' }}>Authentication Required</h2>
            <p style={{ color: '#4B5563', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5' }}>
              You need to be logged in to contribute itineraries to the community. Please sign up or log in from the navbar to access this feature.
            </p>
            <button
              type="button"
              className="action-btn primary-btn"
              style={{ width: '100%' }}
              onClick={() => setIsAuthRequiredModalOpen(false)}
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </div >
  )
}

export default Itinerary

