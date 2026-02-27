import React from 'react'

function Card({text,number,icon}) {
  return (
    <div className="card">
        <div>
          <p>{text}</p>
          <p className='card-number'>{number}</p>
        </div>
        <div className='svg-container'>
          {icon}
        </div>

      </div>
  )
}

export default Card