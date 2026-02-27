import React from 'react'
import { Trophy,Calendar,Users,Volleyball } from 'lucide-react'
import Card from './Card'

function Dashboard() {
  return (
     <section className='hero'>
          <div className='portada card'>
            <h1>Bienvenido a TourneyPro</h1>
            <p>Organiza, administra y celebra tus eventos con facilidad.</p>
          </div>

        
            <button className='btn-jugar'>Jugar Partido</button>

            <Card text="Torneos Activos" number="2" icon={<Trophy />} />
            <Card text="Partidos Pendientes" number="5" icon={<Calendar />} />
            <Card text="Equipos Registrados" number="3" icon={<Users />} />

    </section>
  )
}

export default Dashboard