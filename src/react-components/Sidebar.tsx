import React from "react";
import * as Router from "react-router-dom";

const Sidebar = () => {
  return (
    <aside id="sidebar">
      <img id="company-logo" src="/assets/image1.svg" alt="company logo" />
      <ul id="nav-buttons">
        <Router.Link to="/">
          <li id="nav-project">
            <span className="material-symbols-outlined">store</span>Projects
          </li>
        </Router.Link>
        <Router.Link to="/users">
          <li id="nav-user">
            <span className="material-symbols-outlined">person</span>Users
          </li>
        </Router.Link>
      </ul>
    </aside>
  );
};

export default Sidebar;
