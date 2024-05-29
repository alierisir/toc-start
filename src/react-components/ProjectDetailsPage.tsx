import React from "react";
import * as Router from "react-router-dom";
import { EProject, Project, Role, Status } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";
import ToDoComponent from "./ToDoComponent";
import { instance } from "three/examples/jsm/nodes/Nodes.js";
import IFCViewer from "./IFCViewer";

interface Props {
  manager: ProjectsManager;
}

const ProjectDetailsPage = ({ manager: projectsManager }: Props) => {
  const { id } = Router.useParams<{ id: string }>();
  if (!id) return <>{console.log(id, "project not found!")}</>;
  const project = projectsManager.getProject(id);
  if (!(project instanceof Project))
    return <>{console.log(project, "not valid")}</>;

  const [projectData, setProjectData] = React.useState(project);

  const onEditClicked = () => {
    const modal = document.getElementById(
      "edit-project-modal"
    ) as HTMLDialogElement;
    modal.showModal();
  };

  const onEditSubmitted = (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById(
      "edit-project-form"
    ) as HTMLFormElement;
    const formData = new FormData(form);
    const editData: EProject = {
      name: formData.get("edit-name") as string,
      description: formData.get("edit-description") as string,
      status: formData.get("edit-status") as Status,
      role: formData.get("edit-role") as Role,
      cost: Number(formData.get("edit-cost") as string),
      progress: Number(formData.get("edit-progress") as string),
      date:
        new Date(formData.get("edit-date") as string).toDateString() ===
        "Invalid Date"
          ? new Date()
          : new Date(formData.get("edit-date") as string),
    };
    try {
      project.editProject(editData);
      setProjectData(project);
      onCancelClicked();
    } catch (error) {
      console.warn(error);
    }
  };

  const onCancelClicked = () => {
    const modal = document.getElementById(
      "edit-project-modal"
    ) as HTMLDialogElement;
    modal.close();
    const form = document.getElementById(
      "edit-project-form"
    ) as HTMLFormElement;
    form.reset();
    setProjectData(project);
  };

  React.useEffect(() => {
    setProjectData(projectData);
  }, [projectData]);

  return (
    <div id="project-details" className="page">
      <dialog id="edit-project-modal" style={{ scale: "80%", margin: "auto" }}>
        <form
          id="edit-project-form"
          className="modal-container"
          onSubmit={(e) => {
            onEditSubmitted(e);
          }}
        >
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
              placeholder={projectData.name}
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
              placeholder={projectData.description}
              maxLength={120}
              defaultValue={undefined}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-status">
              <span className="material-symbols-outlined">pending_actions</span>
              Edit Status
            </label>
            <select
              name="edit-status"
              id="edit-status"
              defaultValue={projectData.status}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-role">
              <span className="material-symbols-outlined">school</span>Edit Role
            </label>
            <select
              name="edit-role"
              id="edit-role"
              defaultValue={projectData.role}
            >
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
              placeholder={"$" + projectData.cost.toString()}
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
              placeholder={projectData.progress.toString() + "%"}
              min={0}
              max={100}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-date">
              <span className="material-symbols-outlined">event</span>Edit
              Finishing Date
            </label>
            <input
              id="edit-date"
              name="edit-date"
              type="date"
              defaultValue={projectData.date.toDateString()}
            />
          </div>
          <div className="button-section">
            <button
              id="edit-form-cancel"
              type="button"
              className="cancel-btn"
              onClick={onCancelClicked}
            >
              <span className="material-symbols-outlined">cancel</span>
              Cancel
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
          <h2 data-project-info="headName">{projectData.name}</h2>
          <p data-project-info="headDescription">{projectData.description}</p>
        </div>
      </header>
      <div className="main-page-content">
        <div id="details-container">
          <div className="dashboard-card">
            <div className="info-header">
              <p
                data-project-info="initials"
                style={{ backgroundColor: projectData.boxColor }}
              >
                {projectData.initials}
              </p>
              <button
                project-info-btn="edit"
                id="p-edit"
                onClick={onEditClicked}
              >
                Edit
              </button>
            </div>
            <div className="info-title">
              <h3 data-project-info="name">{projectData.name}</h3>
              <p data-project-info="description">{projectData.description}</p>
            </div>
            <div className="info-property-field">
              <div className="info-properties">
                <p>Status</p>
                <p data-project-info="status">{projectData.status}</p>
              </div>
              <div className="info-properties">
                <p>Cost</p>
                <p data-project-info="cost">${projectData.cost}</p>
              </div>
              <div className="info-properties">
                <p>Role</p>
                <p data-project-info="role">{projectData.role}</p>
              </div>
              <div className="info-properties">
                <p>Finish Date</p>
                <p data-project-info="date">
                  {projectData.date.toDateString()}
                </p>
              </div>
            </div>
            <div className="info-bar">
              <div
                data-project-info="progress"
                className="info-progress"
                style={{ width: `${projectData.progress}%` }}
              >
                {projectData.progress}%
              </div>
            </div>
          </div>
          <ToDoComponent project={projectData} />
        </div>
        <IFCViewer />
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
