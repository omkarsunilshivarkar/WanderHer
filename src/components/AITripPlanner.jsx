import { useState } from 'react'
import '../styles/AITripPlanner.css'

export default function AITripPlanner() {
    const [formData, setFormData] = useState({
        destination: '',
        duration: '',
        budget: '',
        travelers: '',
        interests: [],
        travelStyle: 'moderate'
    })

    const [itinerary, setItinerary] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const interestOptions = [
        'Adventure',
        'Culture & Heritage',
        'Beaches',
        'Temples & Spirituality',
        'Food & Cuisine',
        'Shopping',
        'Trekking & Nature',
        'Wildlife',
        'Photography',
        'Nightlife',
        'Historical Sites',
        'Yoga & Wellness'
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }))
    }

    const generateItinerary = async (e) => {
        e.preventDefault()

        if (!formData.destination || !formData.duration || !formData.budget || !formData.travelers) {
            setError('Please fill in all required fields')
            return
        }

        setLoading(true)
        setError('')
        setItinerary('')

        try {
            const apiKey = import.meta.env.VITE_GROQ_API_KEY

            if (!apiKey) {
                setError('Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file')
                setLoading(false)
                return
            }

            const prompt = `Create a detailed ${formData.duration}-day itinerary for a traveler (${formData.travelers}) visiting ${formData.destination} in India. 
      
Budget: ${formData.budget}
Travel Style: ${formData.travelStyle}
Interests: ${formData.interests.length > 0 ? formData.interests.join(', ') : 'General tourism'}

Please provide:
1. Day-by-day breakdown with specific activities and timings
2. Recommended accommodations and dining options (include prices in INR)
3. Safety tips specific to the destination and travel type
4. Local transportation guidance (local buses, autos, trains with estimated costs in INR)
5. Estimated costs per day in Indian Rupees (₹)
6. Local emergency helplines
7. Best time to visit
8. Local customs and etiquette
9. Group-friendly or solo-friendly activities based on travel type

Format the response clearly with headers and bullet points for easy reading. Use Indian Rupees (₹) for all costs.`

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
                throw new Error('Failed to generate itinerary')
            }

            const data = await response.json()
            const generatedText = data.choices[0].message.content
            setItinerary(generatedText)
        } catch (err) {
            setError(err.message || 'Error generating itinerary. Please try again.')
            console.error('Error:', err)
        } finally {
            setLoading(false)
        }
    }

    const downloadItinerary = () => {
        const element = document.createElement('a')
        const file = new Blob([itinerary], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `${formData.destination}-itinerary.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    return (
        <div className="ai-trip-planner">
            <div className="planner-container">
                <h2>🤖 AI Trip Planner</h2>
                <p className="subtitle">Get a personalized itinerary for your Indian adventure</p>

                <div className="planner-content">
                    <form onSubmit={generateItinerary} className="planner-form">
                        <div className="form-group">
                            <label htmlFor="destination">Destination (Indian City/Town) *</label>
                            <input
                                type="text"
                                id="destination"
                                name="destination"
                                placeholder="e.g., Jaipur, Goa, Darjeeling, Kerala"
                                value={formData.destination}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="duration">Trip Duration (days) *</label>
                                <input
                                    type="number"
                                    id="duration"
                                    name="duration"
                                    placeholder="e.g., 7"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="30"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="budget">Budget *</label>
                                <select
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select budget</option>
                                    <option value="Budget">Budget (₹1,500-3,000/day)</option>
                                    <option value="Moderate">Moderate (₹3,000-7,000/day)</option>
                                    <option value="Luxury">Luxury (₹7,000+/day)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="travelStyle">Travel Style</label>
                            <select
                                id="travelStyle"
                                name="travelStyle"
                                value={formData.travelStyle}
                                onChange={handleInputChange}
                            >
                                <option value="relaxed">Relaxed</option>
                                <option value="moderate">Moderate</option>
                                <option value="adventurous">Adventurous</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="travelers">Traveling As *</label>
                            <select
                                id="travelers"
                                name="travelers"
                                value={formData.travelers}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select travel type</option>
                                <option value="Solo">Solo Traveler</option>
                                <option value="Couple">Couple</option>
                                <option value="Friends">Friends/Group</option>
                                <option value="Family">Family</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Interests (select multiple)</label>
                            <div className="interests-grid">
                                {interestOptions.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        className={`interest-tag ${formData.interests.includes(interest) ? 'active' : ''}`}
                                        onClick={() => handleInterestToggle(interest)}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="generate-btn"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Itinerary'}
                        </button>
                    </form>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {itinerary && (
                        <div className="itinerary-output">
                            <div className="output-header">
                                <h3>Your AI-Generated Itinerary</h3>
                                <button onClick={downloadItinerary} className="download-btn">
                                    📥 Download
                                </button>
                            </div>
                            <div className="itinerary-text">
                                {itinerary.split('\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
