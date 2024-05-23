import React from "react";
import * as Router from "react-router-dom";
import { Project, IProject, Role, Status } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";
import ProjectCard from "./ProjectCard";

interface Props {
  manager: ProjectsManager;
}

const ProjectsPage = ({ manager: projectsManager }: Props) => {
  const [projects, setProjects] = React.useState<Project[]>(
    projectsManager.list
  );
  projectsManager.onProjectCreated = (project) => {
    setProjects([...projectsManager.list]);
  };
  projectsManager.onProjectDeleted = () => {
    setProjects([...projectsManager.list]);
  };

  React.useEffect(() => {
    console.log("Projects State Updated:", projects);
  }, [projects]);

  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/details/${project.id}`} key={project.id}>
        <ProjectCard project={project} />
      </Router.Link>
    );
  });

  const onNewProjectClicked = () => {
    const modal = document.getElementById(
      "new-project-modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };

  const onFormCancel = () => {
    const projectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    const modal = document.getElementById(
      "new-project-modal"
    ) as HTMLDialogElement;
    projectForm.reset();
    modal.close();
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as Status,
      role: formData.get("role") as Role,
      date: new Date(formData.get("date") as string),
    };
    try {
      projectsManager.newProject(projectData);
      onFormCancel();
    } catch (e) {
      console.log("An Error Occured: ", e);
    }
  };

  const onImportClicked = () => {
    projectsManager.importFromJSON();
  };

  const onExportClicked = () => {
    projectsManager.exportToJSON();
  };

  return (
    <div id="projects-page" className="page">
      <dialog id="new-project-modal">
        <form
          onSubmit={(e) => {
            onFormSubmit(e);
          }}
          id="new-project-form"
          className="modal-container"
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">add_business</span>New
            Project
          </h2>
          <div className="project-properties">
            <label htmlFor="name">
              <span className="material-symbols-outlined">label</span>Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Name of the project"
              minLength={5}
              required={true}
            />
            <p className="modal-tips">TIP:Give it simple name</p>
          </div>
          <div className="project-properties">
            <label htmlFor="description">
              <span className="material-symbols-outlined">description</span>
              Description
            </label>
            <textarea
              name="description"
              id="description"
              cols={20}
              rows={5}
              placeholder="Describe your project (max:120 characters)"
              maxLength={120}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="status">
              <span className="material-symbols-outlined">pending_actions</span>
              Status
            </label>
            <select name="status" id="status">
              <option value="active" defaultValue={"active"}>
                Active
              </option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="role">
              <span className="material-symbols-outlined">school</span>Role
            </label>
            <select name="role" id="role">
              <option value="architect" defaultValue={"architect"}>
                Architect
              </option>
              <option value="engineer">Engineer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="date">
              <span className="material-symbols-outlined">event</span>Finishing
              Date
            </label>
            <input id="date-input" name="date" type="date" />
          </div>
          <div className="button-section">
            <button
              id="form-cancel"
              type="button"
              className="cancel-btn"
              onClick={onFormCancel}
            >
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>
              Accept
            </button>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Projects</h2>
        <div className="button-section">
          <button id="import-from-json" onClick={onImportClicked}>
            <span className="material-symbols-outlined">upload_2</span>
            Upload Projects
          </button>
          <button id="export-to-json" onClick={onExportClicked}>
            <span className="material-symbols-outlined">download_2</span>
            Download Projects
          </button>
          <button id="new-project-btn" onClick={onNewProjectClicked}>
            <span className="material-symbols-outlined">add_business</span>New
            Project
          </button>
        </div>
      </header>
      <div id="projects-list">{projectCards}</div>
    </div>
  );
};

export default ProjectsPage;
