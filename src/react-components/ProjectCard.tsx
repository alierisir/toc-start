import React from "react";
import { Project } from "../classes/Project";
import { ProjectsManager } from "../classes/ProjectsManager";

interface Props {
  project: Project;
}

const ProjectCard = ({ project }: Props) => {
  const { boxColor, name, cost, description, initials, role, progress, status } = project;

  return (
    <div className="project-card">
      <div className="card-header">
        <p style={{ backgroundColor: boxColor }}>{initials}</p>
        <div>
          <h2>{name}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p>Status</p>
          <p>{status}</p>
        </div>
        <div className="card-property">
          <p>Role</p>
          <p>{role}</p>
        </div>
        <div className="card-property">
          <p>Cost</p>
          <p>${cost}</p>
        </div>
        <div className="card-property">
          <p>Estimated Progress</p>
          <p>{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
