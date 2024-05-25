import React from "react";
import { Project, Role, Status } from "../classes/Project";

interface Props {
  project: Project;
}

const ProjectCard = ({ project }: Props) => {
  return (
    <div className="project-card">
      <div className="card-header">
        <p style={{ backgroundColor: project.boxColor }}>{project.initials}</p>
        <div>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p>Status</p>
          <p>{project.status}</p>
        </div>
        <div className="card-property">
          <p>Role</p>
          <p>{project.role}</p>
        </div>
        <div className="card-property">
          <p>Cost</p>
          <p>${project.cost}</p>
        </div>
        <div className="card-property">
          <p>Estimated Progress</p>
          <p>{project.progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
