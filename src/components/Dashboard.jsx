import {React,useEffect,useState} from 'react'
import { Trophy,Calendar,Users,Volleyball } from 'lucide-react'
import Card from './Card'
import { useNavigate, NavLink } from 'react-router-dom';
import { refreshToken } from '../services/refreshToken';

function Dashboard() {
  const navigate = useNavigate();
  const [games, setGames] = useState(0);
  const [teams, setTeams] = useState(0);
  const [tournaments, setTournaments] = useState(0);

  useEffect(() => {
      getDashboardData();
  },[]);

  function getDashboardData() {
          fetch('/api/getDashboardData', {
              method: 'GET',
              credentials: 'include'
          }).then(async res => {
              if(res.status === 401) {
              
                              const refreshOk = await refreshToken(); // intentar refrescar el token
              
                              if(!refreshOk) {
                                  navigate('/login'); //redirigir al usuario a la página de login para que inicie sesión de nuevo
                                  return;
                              }
              
                                 // 🔥 IMPORTANTE: volver a intentar la petición original
                                 const retryFetch = await fetch('/api/tournamentPageData', {
                                      method: 'GET',
                                      credentials: 'include'
                                  });
              
                                  return retryFetch.json(); //devolvemos directamente el json
                          }
              
                          return res.json();
              }).then(data => {
                  console.log("Data:", data);
                  
                  //  console.log("Sports", data.sports);
                  //  console.log("torneos", data.tournaments);
                  if(data.error) return console.log("no hay datos");
                  setGames(data.games);
                  setTeams(data.teams);
                  setTournaments(data.tournaments);
              }).catch(err => console.log("Error al obtener los partidos",err.message));
      }

  return (
     <section className='hero'>
          <div className='portada card'>
            <h1>Bienvenido a TourneyPro</h1>
            <p>Organiza, administra y celebra tus eventos con facilidad.</p>
          </div>

        
            <NavLink to="/torneos"><button className='btn-jugar'>Ver Torneos</button></NavLink>

            {tournaments > 0 && (
                <Card text="Torneos Activos" number={tournaments} icon={<Trophy />} />
            )}
            {games > 0 && (
                <Card text="Partidos Pendientes" number={games} icon={<Volleyball />} />
            )}
            {teams > 0 && (
                <Card text="Equipos Registrados" number={teams} icon={<Users />} />
            )}

    </section>
  )
}

export default Dashboard