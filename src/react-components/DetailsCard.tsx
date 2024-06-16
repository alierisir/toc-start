import React from "react";
import { IProject, Project, Role, Status } from "../classes/Project";
import * as CF from "../classes/CustomFunctions";
import { ProjectsManager } from "../classes/ProjectsManager";
import { updateCollection } from "../firebase";
import * as Router from "react-router-dom";

interface Props {
  projectsManager: ProjectsManager;
  id: string;
}

const DetailsCard = ({ projectsManager, id }: Props) => {
  const project = projectsManager.getProject(id);
  if (!(project instanceof Project)) return <>Project not found</>;
  const [data, setData] = React.useState(project);

  const navigateTo = Router.useNavigate();

  projectsManager.onProjectEdited = async (data) => {
    const edited = projectsManager.getProject(id);
    if (!(edited instanceof Project)) return;
    setData(edited);
    await updateCollection<Partial<IProject>>("projects", id, data);
    navigateTo("/");
  };

  const onEditClick = () => {
    const modal = document.getElementById("edit-project-modal") as HTMLDialogElement;
    modal.showModal();
  };

  const onCancelClick = () => {
    const modal = document.getElementById("edit-project-modal") as HTMLDialogElement;
    modal.close();
    const form = document.getElementById("edit-project-form") as HTMLFormElement;
    form.reset();
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById("edit-project-form") as HTMLFormElement;
    const formData = new FormData(form);
    const date =
      new Date(formData.get("edit-date") as string).toDateString() === "Invalid Date"
        ? project.date
        : new Date(formData.get("edit-date") as string);
    const editedProject: IProject = {
      name: formData.get("edit-name") ? (formData.get("edit-name") as string) : project.name,
      description: formData.get("edit-description")
        ? (formData.get("edit-description") as string)
        : project.description,
      cost: formData.get("edit-cost") ? Number(formData.get("edit-cost")) : project.cost,
      progress: formData.get("edit-progress") ? Number(formData.get("edit-progress")) : project.progress,
      date,
      role: formData.get("edit-role") ? (formData.get("edit-role") as Role) : project.role,
      status: formData.get("edit-status") ? (formData.get("edit-status") as Status) : project.status,
    };
    try {
      console.log("DATE:", editedProject.date.toString());
      projectsManager.editProject(id, editedProject);
      onCancelClick();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard-card">
      <dialog id="edit-project-modal" style={{ maxHeight: "fit-content", scale: "90%" }}>
        <form
          id="edit-project-form"
          className="modal-container"
          onSubmit={(e) => {
            onFormSubmit(e);
          }}
        >
          <h2 className="modal-header">
            <span className="material-symbols-outlined">tune</span>Edit Project
          </h2>
          <div className="project-properties">
            <label htmlFor="edit-name">
              <span className="material-symbols-outlined">label</span>Edit Name
            </label>
            <input type="text" name="edit-name" id="edit-name" placeholder={data.name} />
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
              placeholder={data.description}
              maxLength={120}
              defaultValue={""}
            />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-status">
              <span className="material-symbols-outlined">pending_actions</span>Edit Status
            </label>
            <select name="edit-status" id="edit-status" defaultValue={data.status}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="finished">Finished</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-role">
              <span className="material-symbols-outlined">school</span>Edit Role
            </label>
            <select name="edit-role" id="edit-role" defaultValue={data.role}>
              <option value="architect">Architect</option>
              <option value="engineer">Engineer</option>
              <option value="developer">Developer</option>
            </select>
          </div>
          <div className="project-properties">
            <label htmlFor="edit-cost">
              <span className="material-symbols-outlined">payments</span>Edit Cost
            </label>
            <input type="number" name="edit-cost" id="edit-cost" placeholder={"$" + data.cost.toString()} min={0} />
          </div>
          <div className="project-properties">
            <label htmlFor="edit-progress">
              <span className="material-symbols-outlined">donut_large</span>Edit Progress
            </label>
            <input
              type="number"
              name="edit-progress"
              id="edit-progress"
              placeholder={data.cost.toString() + "%"}
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
            <button id="edit-form-cancel" type="button" className="cancel-btn" onClick={onCancelClick}>
              <span className="material-symbols-outlined">cancel</span>Cancel
            </button>
            <button type="submit" className="accept-btn">
              <span className="material-symbols-outlined">check_circle</span>Accept
            </button>
          </div>
        </form>
      </dialog>
      <div className="info-header">
        <p data-project-info="initials" style={{ backgroundColor: data.boxColor }}>
          {data.initials}
        </p>
        <button project-info-btn="edit" id="p-edit" onClick={onEditClick}>
          Edit
        </button>
      </div>
      <div className="info-title">
        <h3 data-project-info="name">{data.name}</h3>
        <p data-project-info="description">{data.description}</p>
      </div>
      <div className="info-property-field">
        <div className="info-properties">
          <p>Status</p>
          <p data-project-info="status">{data.status}</p>
        </div>
        <div className="info-properties">
          <p>Cost</p>
          <p data-project-info="cost">${data.cost}</p>
        </div>
        <div className="info-properties">
          <p>Role</p>
          <p data-project-info="role">{data.role}</p>
        </div>
        <div className="info-properties">
          <p>Finish Date</p>
          <p data-project-info="date">{data.date.toLocaleDateString()}</p>
        </div>
      </div>
      <div className="info-bar">
        <div data-project-info="progress" className="info-progress" style={{ width: `${data.progress}%` }}>
          {data.progress}%
        </div>
      </div>
    </div>
  );
};

export default DetailsCard;
