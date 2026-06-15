import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'


dotenv.config()

const app = express()
const dbPath = process.env.DATABASE_PATH || './dev.db'

let db

async function initDb() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    })

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `)
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

            // Also allow any http://<ip>:5173 (useful when your PC gets a new LAN IP)
            const ipViteDev = /^http:\/\/(?:\d{1,3}\.){3}\d{1,3}:5173$/

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

    const existing = await db.get('SELECT id FROM users WHERE email = ?', email)
    if (existing) return res.status(409).json({ message: 'Email already in use' })


    const id = `u_${Date.now()}_${Math.random().toString(16).slice(2)}`
    const passwordHash = await bcrypt.hash(password, 12)
    const createdAt = new Date().toISOString()

    await db.run(
        'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
        id,
        email,
        name ?? null,
        passwordHash,
        createdAt
    )


    const token = signToken({ sub: id })
    return res.status(201).json({ token })
})

app.post('/api/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
        return res.status(400).json({ message: 'Invalid input', issues: parsed.error.issues })
    }

    const { email, password } = parsed.data

    const user = await db.get('SELECT id, password_hash FROM users WHERE email = ?', email)


    if (!user) return res.status(401).json({ message: 'Invalid email or password' })

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

    const token = signToken({ sub: user.id })
    return res.json({ token })
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
    const user = await db.get(
        'SELECT id, email, name, created_at FROM users WHERE id = ?',
        req.userId
    )

    if (!user) return res.status(404).json({ message: 'Not found' })
    res.json({ user })
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


