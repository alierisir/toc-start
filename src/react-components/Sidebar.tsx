import React from "react";

const Sidebar = () => {
  return (
    <aside id="sidebar">
      <img id="company-logo" src="/assets/image1.svg" alt="company logo" />
      <ul id="nav-buttons">
        <li id="nav-project">
          <span className="material-symbols-outlined">store</span>Projects
        </li>
        <li id="nav-user">
          <span className="material-symbols-outlined">person</span>Users
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
