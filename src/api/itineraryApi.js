const getApiBase = () => {
    if (import.meta.env.VITE_API_BASE) {
        return import.meta.env.VITE_API_BASE
    }
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    // If accessing via LAN IP, automatically target the same IP on backend port 8080
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return `http://${hostname}:8080`
    }
    return 'http://localhost:8080'
}

const API_BASE = getApiBase()

async function ensureCorsFriendlyFetch(url, options) {
    try {
        return await fetch(url, options)
    } catch (err) {
        throw new Error(
            'Network error / CORS blocked the request. Check backend CORS config.'
        )
    }
}

async function parseErrorMessage(res) {
    return res
        .json()
        .catch(() => ({}))
        .then((data) => data?.message || `Request failed (${res.status})`)
}

export async function getItineraries() {
    const res = await ensureCorsFriendlyFetch(`${API_BASE}/api/itineraries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    return await res.json()
}

export async function createItinerary(itinerary, token) {
    const res = await ensureCorsFriendlyFetch(`${API_BASE}/api/itineraries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itinerary)
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    return await res.json()
}

export async function deleteItinerary(id, token) {
    const res = await ensureCorsFriendlyFetch(`${API_BASE}/api/itineraries/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    return await res.json()
}
