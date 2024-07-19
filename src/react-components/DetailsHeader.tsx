import React from "react";
import { Project } from "../classes/Project";
interface Props {
  project: Project;
  onDeleteClick?:()=>void
}

const DetailsHeader = ({ project,onDeleteClick }: Props) => {
  return (
    <header>
      <div>
        <h2 data-project-info="headName">{project.name}</h2>
        <p data-project-info="headDescription">{project.description}</p>
      </div>
      <div>
        <button style={{background:"none" , color:"black", border:"2px dashed black", borderRadius:"5px"}} onClick={onDeleteClick}>Delete Project</button>
      </div>
    </header>
  );
};

export default DetailsHeader;
