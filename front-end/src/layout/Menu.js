import React from "react";
import { Link } from "react-router-dom";

/**
 * Defines the menu for this application.
 *
 * @returns {JSX.Element}
 */
function Menu() {
  return (
    <nav className="navbar navbar-dark align-items-start p-0">
      {/* Container for navigation items */}
      <div className="container-fluid d-flex flex-column p-0">
        {/* Brand link to the home page */}
        <Link
          className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0"
          to="/"
        >
          <div className="sidebar-brand-text mx-3">
            {/* Title for the brand */}
            <span>Periodic Tables</span>
          </div>
        </Link>
        {/* Divider between the brand and navigation items */}
        <hr className="sidebar-divider my-0" />
        {/* List of navigation items */}
        <ul className="nav navbar-nav text-light" id="accordionSidebar">
          <li className="nav-item">
            {/* Link to the dashboard */}
            <Link className="nav-link" to="/dashboard">
              <span className="oi oi-dashboard" />
              &nbsp;Dashboard
            </Link>
          </li>
          <li className="nav-item">
            {/* Link to the search page */}
            <Link className="nav-link" to="/search">
              <span className="oi oi-magnifying-glass" />
              &nbsp;Search
            </Link>
          </li>
          <li className="nav-item">
            {/* Link to the new reservation page */}
            <Link className="nav-link" to="/reservations/new">
              <span className="oi oi-plus" />
              &nbsp;New Reservation
            </Link>
          </li>
          <li className="nav-item">
            {/* Link to the new table page */}
            <Link className="nav-link" to="/tables/new">
              <span className="oi oi-layers" />
              &nbsp;New Table
            </Link>
          </li>
        </ul>
        {/* Hidden toggle button for small screen devices */}
        <div className="text-center d-none d-md-inline">
          <button
            className="btn rounded-circle border-0"
            id="sidebarToggle"
            type="button"
          />
        </div>
      </div>
    </nav>
  );
}

export default Menu;
