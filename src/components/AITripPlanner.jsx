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
    const [downloadFormat, setDownloadFormat] = useState('html')

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

    const formatItinerary = (text) => {
        if (!text) return null;

        const lines = text.split('\n');
        const elements = [];
        let listItems = [];
        let currentSection = null;

        lines.forEach((line, idx) => {
            const trimmedLine = line.trim();

            // Skip empty lines but preserve spacing
            if (trimmedLine === '') {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${idx}`} className="formatted-list">
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    listItems = [];
                }
                elements.push(<div key={`space-${idx}`} className="spacing" />);
                return;
            }

            // H2 headings (## or bold lines)
            if (trimmedLine.startsWith('##') || (trimmedLine.startsWith('**') && trimmedLine.endsWith('**'))) {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${idx}`} className="formatted-list">
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    listItems = [];
                }
                const title = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                elements.push(
                    <h2 key={`h2-${idx}`} className="formatted-heading-2">
                        {title}
                    </h2>
                );
                return;
            }

            // H3 headings
            if (trimmedLine.startsWith('###')) {
                if (listItems.length > 0) {
                    elements.push(
                        <ul key={`list-${idx}`} className="formatted-list">
                            {listItems.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    );
                    listItems = [];
                }
                const title = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                elements.push(
                    <h3 key={`h3-${idx}`} className="formatted-heading-3">
                        {title}
                    </h3>
                );
                return;
            }

            // List items
            if (trimmedLine.startsWith('-')) {
                const itemText = trimmedLine.substring(1).trim();
                // Format bold text within list items
                const formatted = itemText.split(/\*\*(.*?)\*\*/).map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                );
                listItems.push(formatted);
                return;
            }

            // Numbered items
            if (/^\d+\./.test(trimmedLine)) {
                const itemText = trimmedLine.replace(/^\d+\.\s*/, '');
                const formatted = itemText.split(/\*\*(.*?)\*\*/).map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                );
                listItems.push(formatted);
                return;
            }

            // Regular paragraphs with potential bold formatting
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${idx}`} className="formatted-list">
                        {listItems.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                );
                listItems = [];
            }

            const formatted = trimmedLine.split(/\*\*(.*?)\*\*/).map((part, i) =>
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            );
            elements.push(
                <p key={`p-${idx}`} className="formatted-paragraph">
                    {formatted}
                </p>
            );
        });

        // Push remaining list items
        if (listItems.length > 0) {
            elements.push(
                <ul key={`list-final`} className="formatted-list">
                    {listItems.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        }

        return elements;
    }

    const downloadItinerary = async () => {
        if (downloadFormat === 'html') {
            downloadAsHTML()
        } else if (downloadFormat === 'pdf') {
            downloadAsPDF()
        } else {
            downloadAsText()
        }
    }

    const downloadAsHTML = () => {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.destination} - WanderHer Itinerary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.8;
            color: #2c3e50;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .header-meta {
            display: flex;
            gap: 30px;
            justify-content: center;
            margin-top: 20px;
            flex-wrap: wrap;
            font-size: 0.95rem;
            opacity: 0.95;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .content {
            padding: 40px;
        }
        
        h2 {
            font-size: 1.8rem;
            color: #667eea;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        h3 {
            font-size: 1.3rem;
            color: #764ba2;
            margin: 20px 0 10px 0;
            padding-left: 15px;
            border-left: 4px solid #764ba2;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
        }
        
        strong {
            color: #764ba2;
            font-weight: 600;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 0;
        }
        
        li {
            margin: 8px 0 8px 30px;
            line-height: 1.6;
        }
        
        li:before {
            content: '✓';
            color: #667eea;
            font-weight: bold;
            margin-right: 10px;
            margin-left: -25px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 20px 40px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            .footer {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗺️ ${formData.destination}</h1>
            <div class="header-meta">
                <div class="meta-item">
                    <span>⏱️ Duration:</span>
                    <strong>${formData.duration} days</strong>
                </div>
                <div class="meta-item">
                    <span>💰 Budget:</span>
                    <strong>${formData.budget}</strong>
                </div>
                <div class="meta-item">
                    <span>👥 Travelers:</span>
                    <strong>${formData.travelers}</strong>
                </div>
                <div class="meta-item">
                    <span>🎯 Style:</span>
                    <strong>${formData.travelStyle}</strong>
                </div>
            </div>
        </div>
        
        <div class="content">
            ${itinerary.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed === '') return '<p></p>';
            if (trimmed.startsWith('##')) {
                return '<h2>' + trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '') + '</h2>';
            }
            if (trimmed.startsWith('###')) {
                return '<h3>' + trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '') + '</h3>';
            }
            if (trimmed.startsWith('-')) {
                const item = trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return '<li>' + item + '</li>';
            }
            if (/^\d+\./.test(trimmed)) {
                const item = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return '<li>' + item + '</li>';
            }
            const paragraph = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return '<p>' + paragraph + '</p>';
        }).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Generated by WanderHer - Travel Smarter. Travel Safer.</strong></p>
            <p>Created on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Safe travels! 🌍</p>
        </div>
    </div>
</body>
</html>
        `

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${formData.destination}-itinerary.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    const downloadAsPDF = async () => {
        try {
            // Create a new window for printing
            const printWindow = window.open('', '_blank')
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.destination} - WanderHer Itinerary</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.8;
            color: #2c3e50;
            padding: 0;
            background: white;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 0;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
            page-break-after: avoid;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }
        
        .header-meta {
            display: flex;
            gap: 40px;
            justify-content: center;
            margin-top: 25px;
            flex-wrap: wrap;
            font-size: 1rem;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        h2 {
            font-size: 1.8rem;
            color: #667eea;
            margin: 35px 0 15px 0;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
            page-break-after: avoid;
        }
        
        h3 {
            font-size: 1.3rem;
            color: #764ba2;
            margin: 20px 0 10px 0;
            padding-left: 12px;
            border-left: 4px solid #764ba2;
            page-break-after: avoid;
        }
        
        p {
            margin: 12px 0;
            text-align: justify;
            line-height: 1.8;
        }
        
        strong {
            color: #764ba2;
            font-weight: 700;
        }
        
        .list-item {
            margin: 10px 0 10px 35px;
            line-height: 1.7;
        }
        
        .list-item:before {
            content: '✓ ';
            color: #667eea;
            font-weight: bold;
            margin-left: -25px;
            margin-right: 8px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            border-top: 2px solid #ecf0f1;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.95rem;
            page-break-before: avoid;
        }
        
        .footer p {
            margin: 6px 0;
        }
        
        .download-button {
            background: #27ae60;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            margin: 20px;
        }
        
        .download-button:hover {
            background: #229954;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                max-width: 100%;
                margin: 0;
            }
            .download-button {
                display: none;
            }
            h2 {
                page-break-inside: avoid;
            }
            h3 {
                page-break-inside: avoid;
            }
            .footer {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🗺️ ${formData.destination}</h1>
            <div class="header-meta">
                <div class="meta-item">
                    <span>⏱️ Duration:</span>
                    <strong>${formData.duration} days</strong>
                </div>
                <div class="meta-item">
                    <span>💰 Budget:</span>
                    <strong>${formData.budget}</strong>
                </div>
                <div class="meta-item">
                    <span>👥 Travelers:</span>
                    <strong>${formData.travelers}</strong>
                </div>
                <div class="meta-item">
                    <span>🎯 Style:</span>
                    <strong>${formData.travelStyle}</strong>
                </div>
            </div>
        </div>
        
        <div class="content">
            ${itinerary.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed === '') return '<p style="margin: 5px 0;"></p>';

                if (trimmed.startsWith('##')) {
                    const title = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                    return `<h2>${title}</h2>`;
                }

                if (trimmed.startsWith('###')) {
                    const title = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
                    return `<h3>${title}</h3>`;
                }

                if (trimmed.startsWith('-') || /^\d+\./.test(trimmed)) {
                    let item = trimmed;
                    if (item.startsWith('-')) {
                        item = item.substring(1).trim();
                    } else {
                        item = item.replace(/^\d+\.\s*/, '');
                    }
                    item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    return `<div class="list-item">${item}</div>`;
                }

                const paragraph = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return `<p>${paragraph}</p>`;
            }).join('')}
        </div>
        
        <div class="footer">
            <p><strong>Generated by WanderHer - Travel Smarter. Travel Safer.</strong></p>
            <p>📅 Created on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Safe travels! 🌍 Happy exploring with WanderHer</p>
        </div>
    </div>
    
    <div style="text-align: center; margin: 40px; color: #666;">
        <button class="download-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
    
    <script>
        window.addEventListener('load', function() {
            // Auto-focus print dialog for better UX
            setTimeout(() => window.print(), 500);
        });
    </script>
</body>
</html>
            `

            printWindow.document.write(htmlContent)
            printWindow.document.close()
        } catch (err) {
            console.error('Error opening print dialog:', err)
            downloadAsHTML()
        }
    }

    const downloadAsText = () => {
        const blob = new Blob([itinerary], { type: 'text/plain;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${formData.destination}-itinerary.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
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
                                <div className="download-options">
                                    <select
                                        value={downloadFormat}
                                        onChange={(e) => setDownloadFormat(e.target.value)}
                                        className="format-selector"
                                    >
                                        <option value="html">📄 Download as HTML</option>
                                        <option value="pdf">📕 Download as PDF</option>
                                        <option value="txt">📝 Download as Text</option>
                                    </select>
                                    <button onClick={downloadItinerary} className="download-btn">
                                        📥 Download
                                    </button>
                                </div>
                            </div>
                            <div className="itinerary-text">
                                {formatItinerary(itinerary)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
