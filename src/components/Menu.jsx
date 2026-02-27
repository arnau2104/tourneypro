import { useState } from "react";
import { NavLink } from "react-router-dom";
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
  User
} from "lucide-react"

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Torneos", path: "/torneos", icon: Trophy },
  { label: "Equipos", path: "/equipos", icon: Users },
  { label: "Calendario", path: "/calendario", icon: Calendar },
  { label: "Resultados", path: "/resultados", icon: ClipboardList },
  { label: "Clasificación", path: "/clasificacion", icon: BarChart3 },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');

  return (
    <>
        <header className="mobile-header">
         {!mobileOpen ?  ( <Menu className="mobile-menu-icon" onClick={() => setMobileOpen(!mobileOpen)} /> ) :   (<X className="mobile-menu-icon" onClick={() => setMobileOpen(!mobileOpen)} /> )}
          <NavLink to="/" onClick={()=> {setMobileOpen(false); setActiveLink('/')}}> <h2 className="title"><Zap className="zap-icon" /> TourneyPro</h2> </NavLink>
         <NavLink to="/login">
           <User className="mobile-user-icon" />
          </NavLink>
        </header>
        <div  style={{ display: mobileOpen ? "block" : "none" }} className="overlay"> </div>
          
        <nav className={`mobile-sidebar ${mobileOpen ? "mobile-sidebar-open" : ""}`}>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/')}} to="/"><p className={`menu-button ${activeLink === '/' ? 'link-active' : ''}`}><LayoutDashboard /> Dashnoard</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/torneos')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/torneos"><p className={`menu-button ${activeLink === '/torneos' ? 'link-active' : ''}`}> <Trophy />Torneos</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/equipos')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/equipos"><p className={`menu-button ${activeLink === '/equipos' ? 'link-active' : ''}`}> <Users /> Equipos</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/calendario')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/calendario"><p className={`menu-button ${activeLink === '/calendario' ? 'link-active' : ''}`}> <Calendar /> Calendario</p></NavLink>
          <NavLink onClick={()=> {setMobileOpen(false); setActiveLink('/clasificacion')}} className={({ isActive }) => isActive ? 'link-active' : ''} to="/clasificacion"><p className={`menu-button ${activeLink === '/clasificacion' ? 'link-active' : ''}`}> <BarChart3 /> Clasificación</p></NavLink>
         </nav>
      
    </>
  );
};

export default Sidebar;