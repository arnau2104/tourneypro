import { Outlet } from "react-router-dom";
import Menu from "../components/Menu";

function Layout() {
  return (
    <>
      <Menu />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
