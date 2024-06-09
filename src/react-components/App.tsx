import React from "react";
import * as Router from "react-router-dom";
import Sidebar from "./Sidebar";
import ProjectsPage from "./ProjectsPage";
import ProjectDetailsPage from "./ProjectDetailsPage";
import { ProjectsManager } from "../classes/ProjectsManager";

const projectsManager = new ProjectsManager();

const App = () => {
  return (
    <>
      <Router.BrowserRouter>
        <Sidebar />
        <Router.Routes>
          <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager} />} />
          <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager} />} />
        </Router.Routes>
      </Router.BrowserRouter>
    </>
  );
};

export default App;
