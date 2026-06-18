import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { createClient } from '@libsql/client'
import { seedItineraries } from './seedData.js'


dotenv.config()

const app = express()

let db

async function initDb() {
    db = createClient({
        url: process.env.TURSO_DATABASE_URL || 'file:dev.db',
        authToken: process.env.TURSO_AUTH_TOKEN
    })

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        author TEXT,
        author_image TEXT,
        duration TEXT NOT NULL,
        difficulty TEXT,
        safety_rating REAL,
        description TEXT,
        full_itinerary TEXT NOT NULL,
        created_at TEXT NOT NULL,
        user_id TEXT
      );
    `)

    const checkItineraries = await db.execute('SELECT COUNT(*) as count FROM itineraries')
    if (checkItineraries.rows[0].count === 0) {
        console.log('Seeding itineraries database...')
        for (const item of seedItineraries) {
            await db.execute({
                sql: `INSERT INTO itineraries (
                    id, title, destination, author, author_image, duration, difficulty, safety_rating, description, full_itinerary, created_at, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    item.id,
                    item.title,
                    item.destination,
                    item.author,
                    item.authorImage,
                    item.duration,
                    item.difficulty || 'Easy',
                    item.safetyRating || 5.0,
                    item.description,
                    item.fullItinerary,
                    new Date().toISOString(),
                    null
                ]
            })
        }
        console.log('Seeding completed successfully.')
    }
}



app.use(
    cors({
        origin: (origin, callback) => {
            // Allow browser requests from Vite dev servers (localhost + local network)
            if (!origin) return callback(null, true)

            const allowed = [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://192.168.29.249:5174',
                'https://wander-her-eight.vercel.app'
            ]

            // Also allow any http://<ip>:5173-5179 (useful when your PC gets a new LAN IP or Vite dev port changes)
            const ipViteDev = /^http:\/\/(?:\d{1,3}\.){3}\d{1,3}:517[3-9]$/

            if (allowed.includes(origin) || ipViteDev.test(origin)) {
                return callback(null, true)
            }

            return callback(new Error(`Not allowed by CORS: ${origin}`))
        },
        credentials: false
    })
)

app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function capitalizeName(name) {
    if (!name) return name
    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const signupSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    email: z.string().email(),
    password: z.string().min(8).max(72)
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(72)
})

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || ''
    const match = header.match(/^Bearer (.+)$/)
    const token = match?.[1]

    if (!token) return res.status(401).json({ message: 'Missing token' })

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.userId = decoded.sub
        next()
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

app.get('/health', (_req, res) => {
    res.json({ ok: true })
})

app.post('/api/auth/signup', async (req, res) => {
    const parsed = signupSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })
    }

    const { name, email, password } = parsed.data

    const existingResult = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [email]
    })
    const existing = existingResult.rows[0]
    if (existing) return res.status(409).json({ message: 'Email already in use' })


    const id = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const passwordHash = await bcrypt.hash(password, 12)
    const createdAt = new Date().toISOString()
    const formattedName = name ? capitalizeName(name) : null

    await db.execute({
        sql: 'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
        args: [id, email, formattedName, passwordHash, createdAt]
    })


    const token = signToken({ sub: id })
    return res.status(201).json({ token })
})

app.post('/api/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })
    }

    const { email, password } = parsed.data

    const userResult = await db.execute({
        sql: 'SELECT id, password_hash FROM users WHERE email = ?',
        args: [email]
    })
    const user = userResult.rows[0]


    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken({ sub: user.id })
    return res.json({ token })
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const userResult = await db.execute({
        sql: 'SELECT id, email, name, created_at FROM users WHERE id = ?',
        args: [req.userId]
    })
    const user = userResult.rows[0]

    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json({ user })
})


// --- ITINERARY ROUTES ---

app.get('/api/itineraries', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM itineraries ORDER BY created_at DESC')
        const itineraries = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            destination: row.destination,
            author: row.author,
            authorImage: row.author_image,
            duration: row.duration,
            difficulty: row.difficulty,
            safetyRating: row.safety_rating,
            description: row.description,
            fullItinerary: row.full_itinerary,
            createdAt: row.created_at,
            userId: row.user_id,
            _source: row.user_id ? 'user' : 'seed'
        }))
        res.json({ itineraries })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to fetch itineraries' })
    }
})

app.post('/api/itineraries', authMiddleware, async (req, res) => {
    const schema = z.object({
        destination: z.string().min(1),
        title: z.string().min(1),
        duration: z.string().min(1),
        author: z.string().optional(),
        description: z.string().optional(),
        fullItinerary: z.string().min(1)
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })
    }

    const { destination, title, duration, author, description, fullItinerary } = parsed.data
    const id = `it_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const createdAt = new Date().toISOString()
    
    const formattedDestination = capitalizeName(destination)
    const formattedTitle = capitalizeName(title)
    const formattedDuration = formatDuration(duration)
    const formattedDescription = description ? capitalizeName(description) : 'A user shared itinerary'

    let finalAuthor = author ? capitalizeName(author) : 'Anonymous'
    if (!author && req.userId) {
        try {
            const userResult = await db.execute({
                sql: 'SELECT name FROM users WHERE id = ?',
                args: [req.userId]
            })
            if (userResult.rows[0]?.name) {
                finalAuthor = capitalizeName(userResult.rows[0].name)
            }
        } catch (err) {
            console.error('Error fetching user name:', err)
        }
    }

    try {
        await db.execute({
            sql: `INSERT INTO itineraries (
                id, title, destination, author, author_image, duration, difficulty, safety_rating, description, full_itinerary, created_at, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                id,
                formattedTitle,
                formattedDestination,
                finalAuthor,
                '👩‍💻',
                formattedDuration,
                'Easy',
                5.0,
                formattedDescription,
                fullItinerary,
                createdAt,
                req.userId
            ]
        })

        res.status(201).json({
            message: 'Itinerary shared successfully',
            itinerary: {
                id,
                title: formattedTitle,
                destination: formattedDestination,
                author: finalAuthor,
                authorImage: '👩‍💻',
                duration: formattedDuration,
                difficulty: 'Easy',
                safetyRating: 5.0,
                description: formattedDescription,
                fullItinerary,
                createdAt,
                userId: req.userId,
                _source: 'user'
            }
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to create itinerary' })
    }
})

app.delete('/api/itineraries/:id', authMiddleware, async (req, res) => {
    const { id } = req.params
    try {
        const result = await db.execute({
            sql: 'SELECT user_id FROM itineraries WHERE id = ?',
            args: [id]
        })
        const row = result.rows[0]
        if (!row) {
            return res.status(404).json({ message: 'Itinerary not found' })
        }
        if (row.user_id === null) {
            return res.status(403).json({ message: 'Seed itineraries cannot be deleted' })
        }
        if (row.user_id !== req.userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this itinerary' })
        }

        await db.execute({
            sql: 'DELETE FROM itineraries WHERE id = ?',
            args: [id]
        })

        res.json({ message: 'Itinerary deleted successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete itinerary' })
    }
})


const PORT = Number(process.env.PORT) || 8080

async function start() {
    await initDb()
    app.listen(PORT, () => {
        console.log(`wanderher auth server running on http://localhost:${PORT}`)
    })
}

start().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
})


