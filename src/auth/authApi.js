const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

function parseErrorMessage(res) {
    return res
        .json()
        .catch(() => ({}))
        .then((data) => data?.message || `Request failed (${res.status})`)
}

async function ensureCorsFriendlyFetch(url, options) {
    // If the browser blocks due to CORS, surface a clearer message.
    try {
        return await fetch(url, options)
    } catch (err) {
        throw new Error(
            'Network error / CORS blocked the request. Check backend CORS config.'
        )
    }
}


export async function signup({ name, email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    const data = await res.json()
    return data
}

export async function login({ email, password }) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    const data = await res.json()
    return data
}

export async function getMe(token) {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) throw new Error(await parseErrorMessage(res))
    const data = await res.json()
    return data
}

