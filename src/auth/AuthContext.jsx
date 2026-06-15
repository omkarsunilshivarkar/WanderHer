import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getMe, login, signup } from './authApi'

const LS_KEY = 'wanderher_auth_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => window.localStorage.getItem(LS_KEY))
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    async function refreshMe(nextToken = token) {
        if (!nextToken) {
            setUser(null)
            return
        }

        const { user: me } = await getMe(nextToken)
        setUser(me)
    }

    useEffect(() => {
        let cancelled = false

        async function init() {
            try {
                if (token) {
                    const { user: me } = await getMe(token)
                    if (!cancelled) setUser(me)
                }
            } catch {
                window.localStorage.removeItem(LS_KEY)
                setToken(null)
                setUser(null)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        init()
        return () => {
            cancelled = true
        }
    }, [])

    const value = useMemo(() => {
        return {
            token,
            user,
            loading,
            isAuthenticated: Boolean(token && user),
            signup: async ({ name, email, password }) => {
                const { token: newToken } = await signup({ name, email, password })
                window.localStorage.setItem(LS_KEY, newToken)
                setToken(newToken)
                await refreshMe(newToken)
            },
            login: async ({ email, password }) => {
                const { token: newToken } = await login({ email, password })
                window.localStorage.setItem(LS_KEY, newToken)
                setToken(newToken)
                await refreshMe(newToken)
            },
            logout: () => {
                window.localStorage.removeItem(LS_KEY)
                setToken(null)
                setUser(null)
            }
        }
    }, [token, user, loading])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}

