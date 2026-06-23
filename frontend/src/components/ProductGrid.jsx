import React from 'react'
import ProductCard from './ProductCard'

function ProductGrid({ products, loading, error }) {
  if (loading && products.length === 0) {
    return (
      <section className="grid" aria-live="polite">
        <div className="empty">Loading...</div>
      </section>
    )
  }

  if (error && products.length === 0) {
    return (
      <section className="grid" aria-live="polite">
        <div className="empty">Could not load products.</div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="grid" aria-live="polite">
        <div className="empty">No products found.</div>
      </section>
    )
  }

  return (
    <section className="grid" aria-live="polite">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  )
}

export default ProductGrid
