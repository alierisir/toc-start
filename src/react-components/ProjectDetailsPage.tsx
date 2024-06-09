import * as React from "react";
import * as Router from "react-router-dom";
import { ProjectsManager } from "../classes/ProjectsManager";

interface Props {
  projectsManager: ProjectsManager;
}

const ProjectDetailsPage = ({ projectsManager }: Props) => {
  const routeParams = Router.useParams<{ id: string }>();
  if (!routeParams.id) return <>ID is invalid</>;
  const project = projectsManager.getProject(routeParams.id);
  if (!project) return <>Project is not found!</>;
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
            <input type="text" name="edit-name" id="edit-name" placeholder={project.name} />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-description">
              <span className="material-symbols-outlined">description</span>Edit Description
            </label>
            <textarea
              name="edit-description"
              id="edit-description"
              cols={20}
              rows={5}
              placeholder={project.description}
              maxLength={120}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-status">
              <span className="material-symbols-outlined">pending_actions</span>Edit Status
            </label>
            <select name="edit-status" id="edit-status" defaultValue={project.status}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-role">
              <span className="material-symbols-outlined">school</span>Edit Role
            </label>
            <select name="edit-role" id="edit-role" defaultValue={project.role}>
              <option value="architect">Architect</option>
              <option value="engineer">Engineer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-cost">
              <span className="material-symbols-outlined">payments</span>Edit Cost
            </label>
            <input type="number" name="edit-cost" id="edit-cost" placeholder={"$" + project.cost.toString()} min={0} />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-progress">
              <span className="material-symbols-outlined">donut_large</span>Edit Progress
            </label>
            <input
              type="number"
              name="edit-progress"
              id="edit-progress"
              placeholder={project.cost.toString() + "%"}
              min={0}
              max={100}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-date">
              <span className="material-symbols-outlined">event</span>Edit Finishing Date
            </label>
            <input id="edit-date" name="edit-date" type="date" />
          </div>
          <div className="button-section">
            <button id="edit-form-cancel" type="button" className="cancel-btn">
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>Accept
            </button>
          </div>
        </form>
      </dialog>
      <dialog id="new-todo-modal">
        <form id="new-todo-form" className="modal-container">
          <h2 className="modal-header">
            <span className="material-symbols-outlined">assignment_add</span>New ToDo
          </h2>
          <div className="project-properties">
            <label htmlFor="todo-task">
              <span className="material-symbols-outlined">assignment</span>Task
            </label>
            <textarea
              required={true}
              rows={5}
              cols={30}
              name="todo-task"
              id="todo-task"
              placeholder="Write the task to be done.(max. 270 characters)"
              maxLength={270}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="todo-status">
              <span className="material-symbols-outlined">assignment_late</span>
              Status
            </label>
            <select name="todo-status" id="todo-status">
              <option value="active" defaultValue="active">
                Active
              </option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="todo-deadline">
              <span className="material-symbols-outlined">event</span>Deadline
            </label>
            <input id="todo-deadline" name="todo-deadline" type="date" />
          </div>
          <div className="button-section">
            <button id="todo-cancel" type="button" className="cancel-btn">
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>Accept
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
              <p data-project-info="initials" style={{ backgroundColor: project.boxColor }}>
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
              <div data-project-info="progress" className="info-progress" style={{ width: `${project.progress}%` }}>
                {project.progress}%
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="todo-header">
              <h3>To-Do</h3>
              <div>
                <button project-info-btn="todo-search">
                  <span className="material-symbols-outlined">search</span>
                </button>
                <input todo-search="" type="text" placeholder="Search task by name" />
                <button project-info-btn="todo-add" todo-add="">
                  <span className="material-symbols-outlined">playlist_add</span>
                </button>
              </div>
            </div>
            <div todo-list-container="" className="todo-list"></div>
          </div>
        </div>
        <div id="viewer-container" className="dashboard-card" style={{ minWidth: 0, position: "relative" }} />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
