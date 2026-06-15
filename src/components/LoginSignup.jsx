import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import '../styles/LoginSignup.css'

export default function LoginSignup() {
    const { login, signup, logout, user, isAuthenticated } = useAuth()

    const [mode, setMode] = useState('login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setBusy(true)

        try {
            if (mode === 'signup') {
                await signup({ name: name.trim() || undefined, email: email.trim(), password })
            } else {
                await login({ email: email.trim(), password })
            }
        } catch (err) {
            setError(err?.message || 'Something went wrong')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="auth-wrapper">
            <h2>{mode === 'signup' ? 'Create account' : 'Login'}</h2>
            <p className="auth-subtitle">Sign in to contribute to the community.</p>

            {isAuthenticated && user ? (
                <div className="auth-loggedin">
                    <div className="auth-user">Signed in as <strong>{user.email}</strong></div>
                    <button className="action-btn secondary-btn" type="button" onClick={logout}>
                        Logout
                    </button>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="auth-form">
                    {mode === 'signup' && (
                        <div className="auth-field">
                            <label htmlFor="name">Name</label>
                            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Optional" />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="At least 8 characters"
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button className="action-btn login-primary-btn" type="submit" disabled={busy}>
                        {busy ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}
                    </button>


                    <div className="auth-toggle">
                        {mode === 'signup' ? (
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => {
                                    setMode('login')
                                    setError('')
                                }}
                            >
                                Already have an account? Login
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="link-btn"
                                onClick={() => {
                                    setMode('signup')
                                    setError('')
                                }}
                            >
                                New here? Create account
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>

    )
}

