import { Outlet, Link } from "react-router-dom";
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
          <div className="brand-area">
            <h1 className="site-title">Crossroads Ward Announcements</h1>
            <p className="site-subtitle">Ward news, events, and updates</p>
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
              <Link to="/" onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>Contact</Link>
            </li>
            <li>
              <Link to="/events" onClick={closeMenu}>Events</Link>
            </li>
            <li>
              <Link to="/admin" onClick={closeMenu}>Admin</Link>
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