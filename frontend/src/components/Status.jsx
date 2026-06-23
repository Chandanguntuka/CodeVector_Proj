import React from 'react'

function Status({ loading, error, count, page }) {
  let countText = 'Loading...'
  
  if (error) {
    countText = 'Error'
  } else if (count > 0) {
    countText = `${count.toLocaleString()} products`
  }

  return (
    <section className="status">
      <span id="count">{countText}</span>
      <span id="page">Page {page}</span>
    </section>
  )
}

export default Status
