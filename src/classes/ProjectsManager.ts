import { IProject, Project } from "./Project";
import { ToDo } from "./ToDo";

export class ProjectsManager {
  list: Project[] = [];
  onProjectCreated = (project: Project) => {};
  onProjectDeleted = () => {};

  constructor() {
    const project = this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      role: "architect",
      date: new Date(),
    });
  }

  initiateToDoList(project: Project, todoList: ToDo[]) {
    todoList.map((todo) => {
      const { taskId, task, deadline, status } = todo;
      project.newToDo({ task, deadline, status, taskId });
    });
  }

  checkEditNameInUse(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name;
    });
    const nameInUse = projectNames.includes(data.name);
    return nameInUse;
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
    this.list.push(project);
    this.onProjectCreated(project);
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
    this.onProjectDeleted();
  }

  getTotalCost() {
    const totalCost = this.list.reduce((cost, project) => {
      return (cost += project.cost);
    }, 0);
    return totalCost;
  }

  exportToJSON(fileName: string = "projects") {
    const json = JSON.stringify(this.list, null, 2);
    console.log(json);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
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

      const projects: Project[] = JSON.parse(json as string); //id'si olmayan bir projeyi JSON içinde oluşturup import etmeyi denemeliyim.
      for (const project of projects) {
        try {
          if (!this.checkIdInUse(project)) {
            const newProject = this.newProject(project);
            for (const key in project) {
              console.log(
                key,
                " data:",
                project[key],
                " project:",
                newProject[key]
              );
            }
            if (project.todoList)
              this.initiateToDoList(newProject, project.todoList);
          } else {
            console.log(project.id, "is updated");
            const existingProject = this.getProject(project.id) as Project;
            existingProject.editProject(project);
            if (project.todoList)
              this.initiateToDoList(existingProject, project.todoList);
          }
        } catch (error) {
          alert(error);
        }
      }
    });
    input.addEventListener("change", () => {
      const fileList = input.files;
      if (!fileList) {
        return;
      }
      const file = fileList[0];
      reader.readAsText(file);
    });
    input.click();
    console.log(this.list);
  }
}
