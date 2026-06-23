import React from 'react'

function Pager({ onNext, onPrev, canNext, canPrev }) {
  return (
    <section className="pager">
      <button 
        id="prev"
        disabled={!canPrev}
        onClick={onPrev}
        className="pager-button"
      >
        Previous
      </button>
      <button 
        id="next"
        disabled={!canNext}
        onClick={onNext}
        className="pager-button"
      >
        Next
      </button>
    </section>
  )
}

export default Pager
