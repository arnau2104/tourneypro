import React from 'react'
import Bracketry from '../hooks/Bracketry'
import { useParams } from "react-router-dom";
  

function Tournament() {
  const { tournamentId } = useParams();

  console.log("torneo id", tournamentId)

  return (
    <>
    <Bracketry tournamentId={tournamentId}/>
    </>
  )
}

export default Tournament