import React from "react";
import { ProjectsManager } from "../classes/ProjectsManager";
import { IProject, Role, Status } from "../classes/Project";

const ProjectsPage = () => {
  const projectsManager = new ProjectsManager();
  const onNewProjectClicked = () => {
    const modal = document.getElementById(
      "new-project-modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };
  const onCancelClicked = () => {
    const modal = document.getElementById(
      "new-project-modal"
    ) as HTMLDialogElement;
    modal.close();
    const form = document.getElementById("new-project-form") as HTMLFormElement;
    form.reset();
  };

  const onFormSubmitted = (e: React.FormEvent) => {
    const projectForm = document.getElementById(
      "new-project-form"
    ) as HTMLFormElement;
    e.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as Status,
      role: formData.get("role") as Role,
      date: new Date(formData.get("date") as string),
    };
    try {
      const project = projectsManager.newProject(projectData);
      console.log(project);
      onCancelClicked();
    } catch (e) {
      throw new Error(`Error adding new project: ${e}`);
    }
  };

  const onImport = () => {
    projectsManager.importFromJSON();
  };

  const onExport = () => {
    projectsManager.exportToJSON();
  };

  return (
    <div id="projects-page" className="page">
      <dialog id="new-project-modal">
        <form
          id="new-project-form"
          className="modal-container"
          onSubmit={(e) => {
            onFormSubmitted(e);
          }}
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
              onClick={onCancelClicked}
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
          <button id="import-from-json" onClick={onImport}>
            <span className="material-symbols-outlined">upload_2</span>
            Upload Projects
          </button>
          <button id="export-to-json" onClick={onExport}>
            <span className="material-symbols-outlined">download_2</span>
            Download Projects
          </button>
          <button id="new-project-btn" onClick={onNewProjectClicked}>
            <span className="material-symbols-outlined">add_business</span>New
            Project
          </button>
        </div>
      </header>
      <div id="projects-list"></div>
    </div>
  );
};

export default ProjectsPage;
