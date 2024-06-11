import React from "react";
import { Project } from "../classes/Project";
interface Props {
  project: Project;
}

const DetailsHeader = ({ project }: Props) => {
  return (
    <header>
      <div>
        <h2 data-project-info="headName">{project.name}</h2>
        <p data-project-info="headDescription">{project.description}</p>
      </div>
    </header>
  );
};

export default DetailsHeader;
