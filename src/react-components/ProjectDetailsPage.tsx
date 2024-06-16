import * as React from "react";
import * as Router from "react-router-dom";
import { ProjectsManager } from "../classes/ProjectsManager";
import DetailsCard from "./DetailsCard";
import DetailsHeader from "./DetailsHeader";
import ToDoContainer from "./ToDoContainer";
import IFCViewer from "./IFCViewer";
import { deleteCollection } from "../firebase";

interface Props {
  projectsManager: ProjectsManager;
}

const ProjectDetailsPage = ({ projectsManager }: Props) => {
  const routeParams = Router.useParams<{ id: string }>();
  if (!routeParams.id) return <>ID is invalid</>;
  const project = projectsManager.getProject(routeParams.id);
  if (!project) return <>Project is not found!</>;

  const navigateTo = Router.useNavigate();

  projectsManager.onProjectDeleted = async (id) => {
    await deleteCollection("projects", id);
    navigateTo("/");
  };

  const onDeleteProject = () => {
    projectsManager.deleteProject(project.id);
  };

  return (
    <div id="project-details" className="page">
      <DetailsHeader project={project} deleteProject={onDeleteProject} />
      <div className="main-page-content">
        <div id="details-container">
          <DetailsCard projectsManager={projectsManager} id={routeParams.id} />
          <ToDoContainer project={project} />
        </div>
        <IFCViewer />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
