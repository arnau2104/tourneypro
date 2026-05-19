import { useState,useContext,useEffect } from "react";
import { NavLink } from "react-router-dom";
import {AuthContext} from '../context/userContext'
import {
  LayoutDashboard,
  Trophy,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  X,
  Zap,
  Menu,
  User,
  ArrowUpRight,
  Volleyball
} from "lucide-react"


const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [showLogout, setShowLogout] = useState(false);
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    // console.log("user:", user);
  },[user]);

  function handleLogout() {
    console.log("logout");
    fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(async res => {
                 if(res.status === 401) {
    
                    const refreshOk = await refreshToken(); // intentar refrescar el token
    
                    if(!refreshOk) {
                        navigate('/login'); //redirigir al usuario a la página de login para que inicie sesión de nuevo
                        return;
                    }
    
                       // 🔥 IMPORTANTE: volver a intentar la petición original
                       const retryFetch = await fetch('/api/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
    
                        return retryFetch.json(); //devolvemos directamente el json
                }
    
                return res.json();
      }).then(data => {
        console.log("data:", data);
        if(data.error) return console.log("error:", data.error);

        console.log("logout hecho");
        setUser(null);
      }).catch(err => console.log(err));
  }

  return (
    <>
        <header className="mobile-header">
         {!mobileOpen ?  ( <Menu className="mobile-menu-icon" onClick={() => setMobileOpen(!mobileOpen)} /> ) :   (<X className="mobile-menu-icon" onClick={() => setMobileOpen(!mobileOpen)} /> )}
          <NavLink to="/" onClick={()=> {setMobileOpen(false); setActiveLink('/')}}> <h2 className="title"><Zap className="zap-icon" /> TourneyPro</h2> </NavLink>
         <div className="user-menu">
            {user ? (
              <>
                <div onClick={()=>setShowLogout(!showLogout)} className="avatar">{user.name.charAt(0)}</div>
                <div className={`logout-card ${showLogout ? "active" : ""}`}>
                  <button className="logout-btn" onClick={handleLogout}> Cerrar sesión </button>
                </div>
              </>
            ) : (
              <NavLink to="/login">
                <User className="mobile-user-icon" />
              </NavLink>
            )}
          </div>
        
        </header>
        <div  style={{ display: mobileOpen ? "block" : "none" }} className="overlay"> </div>
          
        <nav className={`mobile-sidebar ${mobileOpen ? "mobile-sidebar-open" : ""}`}>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/')}} to="/"><p className={`menu-button ${activeLink === '/' ? 'link-active' : ''}`}><LayoutDashboard /> Dashnoard</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/torneos')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/torneos"><p className={`menu-button ${activeLink === '/torneos' ? 'link-active' : ''}`}> <Trophy />Torneos</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/partidos')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/partidos"><p className={`menu-button ${activeLink === '/partidos' ? 'link-active' : ''}`}> <Volleyball />Partidos</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/equipos')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/equipos"><p className={`menu-button ${activeLink === '/equipos' ? 'link-active' : ''}`}> <Users /> Equipos</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/calendario')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/calendario"><p className={`menu-button ${activeLink === '/calendario' ? 'link-active' : ''}`}> <Calendar /> Calendario</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/clasificacion')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/clasificacion"><p className={`menu-button ${activeLink === '/clasificacion' ? 'link-active' : ''}`}> <BarChart3 /> Clasificación</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/inscripciones')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/inscripciones"><p className={`menu-button ${activeLink === '/clasificacion' ? 'link-active' : ''}`}> <ArrowUpRight /> Mis Inscripciones</p></NavLink>
         </nav>
      
    </>
  );
};

export default Sidebar;