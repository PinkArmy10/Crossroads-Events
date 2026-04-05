import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import "./Layout.css";

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="nav-left">
            <img
              src="/images/Christus.png"
              alt="Crossroads Ward Christus"
              className="nav-logo"
            />
            <div className="brand-area">
              <h1 className="site-title">Crossroads Ward Announcements</h1>
              <p className="site-subtitle">Ward news, events, and updates</p>
            </div>
          </div>

          <button
            className={`hamburger ${menuOpen ? "active" : ""}`}
            type="button"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul
            id="main-navigation"
            className={`nav-links ${menuOpen ? "show-menu" : ""}`}
          >
            <li>
              <NavLink
                to="/"
                end
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/events"
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                Submission
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                Contact
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/admin"
                onClick={closeMenu}
                className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}
              >
                Admin
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;