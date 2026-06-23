import React from 'react'

function Toolbar({
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categories,
  onApply,
  isDark,
  setIsDark,
  user,
  onLogout,
}) {
  return (
    <section className="toolbar">
      <div>
        <p className="eyebrow">CodeVector Catalog</p>
        <h1>Products</h1>
      </div>
      <div className="controls">
        <button
          className="theme-toggle"
          onClick={() => setIsDark(!isDark)}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="control-select"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Min price"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          className="control-input"
        />
        <input
          type="number"
          min="0"
          step="1"
          placeholder="Max price"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          className="control-input"
        />
        <button onClick={onApply} className="control-button">
          Apply
        </button>
        <div className="user-menu">
          <span>{user?.name}</span>
          <button onClick={onLogout} className="secondary-button">
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}

export default Toolbar
