import React from "react";
import { Project } from "../classes/Project";
interface Props {
  project: Project;
  onDeleteProject?: () => void;
}

const DetailsHeader = ({ project, onDeleteProject }: Props) => {
  return (
    <header>
      <div>
        <h2 data-project-info="headName">{project.name}</h2>
        <p data-project-info="headDescription">{project.description}</p>
      </div>
      <div className="button-section">
        <button id="delete-project-btn" className="delete-btn" onClick={onDeleteProject}>
          <span className="material-symbols-outlined">contract_delete</span>Delete Project
        </button>
      </div>
    </header>
  );
};

export default DetailsHeader;
