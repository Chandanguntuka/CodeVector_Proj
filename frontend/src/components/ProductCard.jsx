import React from 'react'

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
    new Date(dateString)
  )
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

function ProductCard({ product }) {
  return (
    <article className="product">
      <div>
        <h2>{product.name}</h2>
        <div className="category">{product.category}</div>
      </div>
      <div className="meta">
        <div className="price">{formatPrice(product.price)}</div>
        <div className="date">{formatDate(product.created_at)}</div>
      </div>
    </article>
  )
}

export default ProductCard
