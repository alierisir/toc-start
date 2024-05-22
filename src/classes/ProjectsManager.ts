import { IProject, Project } from "./Project";
import { correctDate } from "./CustomFunctions";

export class ProjectsManager {
  list: Project[] = [];

  constructor() {
    const project = this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      role: "architect",
      date: new Date(),
    });
  }

  private setPageDetails(project: Project) {
    const page = document.getElementById("project-details") as HTMLElement;
    const pageInfoDummy = {
      name: "name",
      description: "description",
      status: "status",
      cost: "cost",
      role: "role",
      date: "date",
      progress: "progress",
      initials: "initials",
    };
    const pageInfo = {};
    for (const key in pageInfoDummy) {
      const value = pageInfoDummy[key];
      const projectValue = project[key];
      pageInfo[key] = page.querySelector(`[data-project-info=${value}]`);
      pageInfo[key].textContent = projectValue;
      if (value === "name") {
        const headName = page.querySelector(`[data-project-info="headName"]`);
        if (headName) headName.textContent = projectValue;
      }
      if (value === "description") {
        const headDescription = page.querySelector(
          `[data-project-info="headDescription"]`
        );
        if (headDescription) headDescription.textContent = projectValue;
      }
      if (value === "initials") {
        pageInfo[key].style.backgroundColor = project.boxColor;
      }
      if (value === "progress") {
        pageInfo[key].textContent += "%";
        pageInfo[key].style.width = `${projectValue}%`;
      }
      if (value === "cost") {
        pageInfo[key].textContent = `$${projectValue}`;
      }
      if (value === "date") {
        const { day, month, year } = correctDate(projectValue);
        pageInfo[key].textContent = `${year}-${month}-${day}`;
      }
    }
  }

  setPage(project: Project) {
    const card = project.ui;
    card.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page");
      const detailsPage = document.getElementById("project-details");
      if (!(projectsPage && detailsPage)) {
        return;
      }
      projectsPage.style.display = "none";
      detailsPage.style.display = "flex";
      this.setPageDetails(project);
    });
  }

  checkNameInUse(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name;
    });
    const nameInUse = projectNames.includes(data.name);
    return nameInUse;
  }

  checkIdInUse(data: Project) {
    const projectIds = this.list.map((project) => {
      return project.id;
    });
    const idInUse = projectIds.includes(data.id);
    return idInUse;
  }

  newProject(data: IProject) {
    if (this.checkNameInUse(data)) {
      //bu noktada geri dönmek yerine, id'ler kontrol edilmeli, id mevcut ise proje update edilecek, değil ise yeni
      throw new Error("There is already a project with the same name!");
    }
    const project = new Project(data);
    this.setPage(project);
    this.list.push(project);

    return project;
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id;
    });
    return project;
  }

  getProjectByName(name: string) {
    const project = this.list.find((project) => {
      return project.name === name;
    });
    if (project) return this.getProject(project.id);
  }

  deleteProject(id: string) {
    const project = this.getProject(id);
    if (!project) {
      return;
    }
    project.ui.remove();
    const remaining = this.list.filter((project) => {
      return project.id !== id;
    });
    this.list = remaining;
  }

  getTotalCost() {
    const totalCost = this.list.reduce((cost, project) => {
      return (cost += project.cost);
    }, 0);
    return totalCost;
  }

  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const json = reader.result;
      if (!json) {
        return;
      }
      const projects: IProject[] = JSON.parse(json as string);
      for (const project of projects) {
        try {
          this.newProject(project);
        } catch (error) {}
      }
    });
    input.addEventListener("change", () => {
      const filesList = input.files;
      if (!filesList) {
        return;
      }
      reader.readAsText(filesList[0]);
    });
    input.click();
  }
}
