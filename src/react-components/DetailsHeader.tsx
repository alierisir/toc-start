import React from "react";
import { Project } from "../classes/Project";
interface Props {
  project: Project;
  deleteProject: () => void;
}

const DetailsHeader = ({ project, deleteProject }: Props) => {
  const style: React.CSSProperties = {
    background: "none",
    color: "black",
    border: "2px dotted black",
    borderRadius: "0",
  };
  return (
    <header>
      <div>
        <h2 data-project-info="headName">{project.name}</h2>
        <p data-project-info="headDescription">{project.description}</p>
      </div>

      <button onClick={deleteProject} style={style}>
        <span className="material-symbols-outlined">contract_delete</span>Delete Project
      </button>
    </header>
  );
};

export default DetailsHeader;
