import React from 'react'
import confetti from 'canvas-confetti'
function launchConfetti() {
  return confetti({
    particleCount: 100,
    spread: 70,
    origin: {  y: 0.6 }
  })
}

export default launchConfetti