import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Toolbar from './components/Toolbar'
import ProductGrid from './components/ProductGrid'
import Status from './components/Status'
import Pager from './components/Pager'
import Login from './components/Login'

const API_BASE = 'https://codevector-proj.onrender.com/api'
const STORED_AUTH_KEY = 'codevector_auth'

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORED_AUTH_KEY))
  } catch {
    return null
  }
}

function App() {
  const [auth, setAuth] = useState(readStoredAuth)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [isDark, setIsDark] = useState(false)

  const [cursor, setCursor] = useState(null)
  const [nextCursor, setNextCursor] = useState(null)
  const [history, setHistory] = useState([])
  const [page, setPage] = useState(1)
  const [totalHint, setTotalHint] = useState(0)

  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [isDark])

  useEffect(() => {
    if (!auth?.token) return
    loadCategories()
    loadProducts(null)
  }, [auth?.token])

  useEffect(() => {
    if (!auth?.token) return
    resetPagination()
    loadProducts(null)
  }, [category, minPrice, maxPrice])

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  })

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`, authConfig())
      setCategories(response.data)
      setError(null)
    } catch (err) {
      console.error('Failed to load categories:', err)
      handleRequestError(err)
      setError('Could not load categories')
    }
  }

  const buildProductsUrl = (paginationCursor) => {
    const params = new URLSearchParams({ limit: '20' })
    if (category) params.set('category', category)
    if (paginationCursor) params.set('cursor', paginationCursor)
    if (minPrice) params.set('min_price', minPrice)
    if (maxPrice) params.set('max_price', maxPrice)
    return `${API_BASE}/products?${params}`
  }

  const loadProducts = async (paginationCursor = null) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(buildProductsUrl(paginationCursor), authConfig())
      setProducts(response.data.items)
      setCursor(paginationCursor)
      setNextCursor(response.data.next_cursor)
      setTotalHint(response.data.total_hint)
      setError(null)
    } catch (err) {
      console.error('Failed to load products:', err)
      handleRequestError(err)
      setProducts([])
      setError('Could not load products')
    } finally {
      setLoading(false)
    }
  }

  const resetPagination = () => {
    setHistory([])
    setPage(1)
  }

  const handleApplyFilters = () => {
    resetPagination()
    loadProducts(null)
  }

  const handleNextPage = () => {
    if (!nextCursor) return
    setHistory([...history, cursor])
    setPage(page + 1)
    loadProducts(nextCursor)
  }

  const handlePrevPage = () => {
    if (history.length === 0) return
    const newHistory = [...history]
    const previousCursor = newHistory.pop()
    setHistory(newHistory)
    setPage(Math.max(1, page - 1))
    loadProducts(previousCursor)
  }

  const handleLogin = async (credentials) => {
    setAuthLoading(true)
    setAuthError(null)

    try {
      const response = await axios.post(`${API_BASE}/login`, credentials)
      const nextAuth = {
        token: response.data.token,
        user: response.data.user,
      }
      localStorage.setItem(STORED_AUTH_KEY, JSON.stringify(nextAuth))
      setAuth(nextAuth)
      setProducts([])
      setCategories([])
      resetPagination()
    } catch (err) {
      console.error('Failed to sign in:', err)
      setAuthError('Invalid email or password')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(STORED_AUTH_KEY)
    setAuth(null)
    setProducts([])
    setCategories([])
    resetPagination()
  }

  const handleRequestError = (err) => {
    if (err.response?.status === 401) {
      handleLogout()
      setAuthError('Your session expired. Please sign in again.')
    }
  }

  if (!auth?.token) {
    return <Login onLogin={handleLogin} loading={authLoading} error={authError} />
  }

  return (
    <main className="shell">
      <Toolbar
        category={category}
        setCategory={setCategory}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        categories={categories}
        onApply={handleApplyFilters}
        isDark={isDark}
        setIsDark={setIsDark}
        user={auth.user}
        onLogout={handleLogout}
      />

      <Status
        loading={loading}
        error={error}
        count={totalHint}
        page={page}
      />

      <ProductGrid
        products={products}
        loading={loading}
        error={error}
      />

      <Pager
        onNext={handleNextPage}
        onPrev={handlePrevPage}
        canNext={!!nextCursor}
        canPrev={history.length > 0}
      />
    </main>
  )
}

export default App
