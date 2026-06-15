import { useEffect, useMemo, useState } from 'react'
import { itineraries as seedItineraries } from '../data/itineraries'
import '../styles/Itinerary.css'
import '../styles/ItineraryShareForm.css'
import { useAuth } from '../auth/AuthContext'


const LS_KEY = 'wanderher_user_itineraries'

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeLineBreaks(text) {
  return (text || '').replace(/\r\n/g, '\n')
}

function Itinerary() {
  const { user, isAuthenticated } = useAuth()

  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [userItineraries, setUserItineraries] = useState([])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)


  const [shareForm, setShareForm] = useState({
    destination: '',
    title: '',
    duration: '',
    author: '',
    description: '',
    fullItinerary: ''
  })


  useEffect(() => {
    const raw = window.localStorage.getItem(LS_KEY)
    const parsed = safeJsonParse(raw, [])
    if (Array.isArray(parsed)) setUserItineraries(parsed)
  }, [])

  const allItineraries = useMemo(() => {
    const seed = seedItineraries.map((it) => ({
      ...it,
      _source: 'seed'
    }))

    const user = userItineraries.map((it) => ({
      ...it,
      _source: 'user'
    }))

    // user itineraries at top
    return [...user, ...seed]
  }, [userItineraries])

  const persistUserItineraries = (next) => {
    setUserItineraries(next)
    window.localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  const openModal = (itinerary) => {
    setSelectedItinerary(itinerary)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setSelectedItinerary(null)
    document.body.style.overflow = 'auto'
  }

  const openShareModal = () => {
    if (!isAuthenticated) {
      alert('Please login/signup to share itineraries.')
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

  const deleteItinerary = (itinerary) => {
    if (!isAuthenticated) {
      alert('Please login/signup to delete itineraries.')
      return
    }

    // Only delete user-shared itineraries stored in localStorage
    if (itinerary._source !== 'user') {
      alert('Seed itineraries cannot be deleted.')
      return
    }


    const ok = window.confirm(`Delete “${itinerary.title}” from your community itineraries?`)
    if (!ok) return

    const next = userItineraries.filter((x) => x.id !== itinerary.id)
    persistUserItineraries(next)

    if (selectedItinerary?.id === itinerary.id) {
      setSelectedItinerary(null)
      document.body.style.overflow = 'auto'
    }
  }



  const handleShareFormChange = (e) => {
    const { name, value } = e.target
    setShareForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddToCommunity = (e) => {
    e.preventDefault()

    const payload = {
      id: makeId(),
      destination: shareForm.destination.trim(),
      title: shareForm.title.trim(),
      duration: shareForm.duration.trim(),
      author: shareForm.author.trim() || 'Anonymous',
      description: shareForm.description.trim() || 'A user shared itinerary',
      fullItinerary: normalizeLineBreaks(shareForm.fullItinerary).trim(),
      createdAt: Date.now()
    }

    if (!payload.destination || !payload.title || !payload.duration || !payload.fullItinerary) {
      alert('Please fill: Destination, Title, Duration, and Full Itinerary')
      return
    }

    persistUserItineraries([payload, ...userItineraries])

    setShareForm({
      destination: '',
      title: '',
      duration: '',
      author: '',
      description: '',
      fullItinerary: ''
    })

    // Optional: open the newly added itinerary
    openModal(payload)
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

      {/* <div className="share-form-wrap" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        <div className="share-form-header" style={{ marginBottom: 16, alignItems: 'center' }}>
          <div>
            <h2>Contribute to the Community</h2>
            <p>Have a trip you've already done? Share your itinerary and help others plan with confidence.</p>
          </div>

          <div>
            <button type="button" className="action-btn primary-btn" onClick={openShareShareModal || openShareModal}>
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
                    <p>Add your own travel plan to the community. Stored locally in your browser.</p>
                  </div>
                </div>

                <form onSubmit={handleAddToCommunity}>
                  <div className="share-form-grid">
                    <div className="share-field">
                      <label htmlFor="destination">Destination *</label>
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
                      <label htmlFor="title">Title *</label>
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
                      <label htmlFor="duration">Duration *</label>
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
                      <label htmlFor="author">Your name</label>
                      <input
                        id="author"
                        name="author"
                        value={shareForm.author}
                        onChange={handleShareFormChange}
                        placeholder="e.g., Priya Sharma"
                      />
                    </div>

                    <div className="share-field share-wide">
                      <label htmlFor="description">Short description</label>
                      <input
                        id="description"
                        name="description"
                        value={shareForm.description}
                        onChange={handleShareFormChange}
                        placeholder="1-liner about your trip"
                      />
                    </div>

                    <div className="share-field share-wide">
                      <label htmlFor="fullItinerary">Full itinerary *</label>
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

      </div> */}




      <div className="itineraries-grid">
        {allItineraries.map((itinerary) => (
          <div
            key={itinerary.id}
            className="itinerary-card"
            onClick={() => openModal(itinerary)}
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

            {/* {itinerary._source === 'user' && isAuthenticated && (
              <button
                className="action-btn secondary-btn"
                style={{ width: '100%', marginTop: 10 }}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteItinerary(itinerary)
                }}
              >
                Delete
              </button>
            )} */}

          </div>

        ))}
      </div>

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




    </div >
  )
}

export default Itinerary

