import React, { useState } from 'react'

function Login({ onLogin, loading, error }) {
  const [email, setEmail] = useState('admin@codevector.local')
  const [password, setPassword] = useState('admin123')

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin({ email, password })
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">CodeVector Catalog</p>
        <h1>Sign in</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="control-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
