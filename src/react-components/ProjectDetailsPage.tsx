import React from "react";
import * as Router from "react-router-dom";
import { Project } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";
import ToDoComponent from "./ToDoComponent";

interface Props {
  manager: ProjectsManager;
}

const ProjectDetailsPage = ({ manager: projectsManager }: Props) => {
  const { id } = Router.useParams<{ id: string }>();
  if (!id) return <>{console.log(id, "project not found!")}</>;
  const project = projectsManager.getProject(id);
  if (!(project instanceof Project))
    return <>{console.log(project, "not valid")}</>;
  return (
    <div id="project-details" className="page">
      <dialog id="edit-project-modal" style={{ maxHeight: "fit-content" }}>
        <form id="edit-project-form" className="modal-container">
          <h2 className="modal-header">
            <span className="material-symbols-outlined">tune</span>Edit Project
          </h2>
          <div className="project-properties">
            <label htmlFor="edit-name">
              <span className="material-symbols-outlined">label</span>Edit Name
            </label>
            <input
              type="text"
              name="edit-name"
              id="edit-name"
              placeholder="Name of the project"
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-description">
              <span className="material-symbols-outlined">description</span>Edit
              Description
            </label>
            <textarea
              name="edit-description"
              id="edit-description"
              cols={20}
              rows={5}
              placeholder="Describe your project (max:120 characters)"
              maxLength={120}
              defaultValue={undefined}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-status">
              <span className="material-symbols-outlined">pending_actions</span>
              Edit Status
            </label>
            <select name="edit-status" id="edit-status">
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-role">
              <span className="material-symbols-outlined">school</span>Edit Role
            </label>
            <select name="edit-role" id="edit-role">
              <option value="architect">Architect</option>
              <option value="engineer">Engineer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-cost">
              <span className="material-symbols-outlined">payments</span>Edit
              Cost
            </label>
            <input
              type="number"
              name="edit-cost"
              id="edit-cost"
              placeholder="Cost of the project"
              min={0}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-progress">
              <span className="material-symbols-outlined">donut_large</span>Edit
              Progress
            </label>
            <input
              type="number"
              name="edit-progress"
              id="edit-progress"
              placeholder="Progress of the project"
              min={0}
              max={100}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-date">
              <span className="material-symbols-outlined">event</span>Edit
              Finishing Date
            </label>
            <input id="edit-date" name="edit-date" type="date" />
          </div>
          <div className="button-section">
            <button id="edit-form-cancel" type="button" className="cancel-btn">
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
        <div>
          <h2 data-project-info="headName">{project.name}</h2>
          <p data-project-info="headDescription">{project.description}</p>
        </div>
      </header>
      <div className="main-page-content">
        <div id="details-container">
          <div className="dashboard-card">
            <div className="info-header">
              <p
                data-project-info="initials"
                style={{ backgroundColor: project.boxColor }}
              >
                {project.initials}
              </p>
              <button project-info-btn="edit" id="p-edit">
                Edit
              </button>
            </div>
            <div className="info-title">
              <h3 data-project-info="name">{project.name}</h3>
              <p data-project-info="description">{project.description}</p>
            </div>
            <div className="info-property-field">
              <div className="info-properties">
                <p>Status</p>
                <p data-project-info="status">{project.status}</p>
              </div>
              <div className="info-properties">
                <p>Cost</p>
                <p data-project-info="cost">${project.cost}</p>
              </div>
              <div className="info-properties">
                <p>Role</p>
                <p data-project-info="role">{project.role}</p>
              </div>
              <div className="info-properties">
                <p>Finish Date</p>
                <p data-project-info="date">{project.date.toDateString()}</p>
              </div>
            </div>
            <div className="info-bar">
              <div
                data-project-info="progress"
                className="info-progress"
                style={{ width: `${project.progress}%` }}
              >
                {project.progress}%
              </div>
            </div>
          </div>
          <ToDoComponent project={project} />
        </div>
        <div
          id="viewer-container"
          className="dashboard-card"
          style={{ minWidth: 0, position: "relative" }}
        />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
