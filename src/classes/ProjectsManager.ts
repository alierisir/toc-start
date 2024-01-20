import { ErrorManager } from "./ErrorManager";
import { IProject, Project, monthsAfter,EProject } from "./Project";
import { ToDo , formatDate, formatDateString} from "./ToDo";

export class ProjectsManager {
  list: Project[] = [];
  ui: HTMLElement;
  detailsPage: HTMLElement;
  todoContainer: HTMLElement;
  activeProject:Project;

  constructor(container: HTMLElement, page: HTMLElement) {
    this.ui = container;
    this.detailsPage = page;
    this.todoContainer = this.detailsPage.querySelector(
      `[todo-list-container]`
    ) as HTMLElement;
  }

  setPageDetails() {
    const page = this.detailsPage;
    const project=this.activeProject
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
        if (projectValue instanceof Date) {
          console.log("date type is Date")
          const {day,month,year}=formatDate(projectValue)
          pageInfo[key].textContent = `${year}-${month}-${day}`;
        }
        if (typeof projectValue === "string") {
          console.log("date type is string")
          const {day,month,year}=formatDateString(projectValue)
          pageInfo[key].textContent = `${year}-${month}-${day}`;
        }
      }
    }
    this.setTodoListUi(project);

    //Search Bar Function
    const searchBar=page.querySelector(`[todo-search]`)
    if(searchBar&&searchBar instanceof HTMLInputElement){
      console.log(searchBar)
      searchBar.addEventListener("change",()=>{
        const todoTasks=project.getToDoList().map(todo=>{
          return [todo.task,todo.taskId]
        })
        console.log(todoTasks)
      })
    }
  }

  setPage(project: Project) {
    const card = project.ui;
    card.addEventListener("click", () => {
      this.activeProject=project
      const page = this.ui.parentElement as HTMLElement;
      const details = this.detailsPage;
      page.style.display = "none";
      details.style.display = "flex";
      this.setPageDetails();
    });
  }

  initiateToDoList(project: Project, todoList: ToDo[]) {
    project.todoList = todoList;
  }

  setTodoListUi(project: Project) {
    const container = this.todoContainer;
    container.innerHTML = "";
    const list = project.getToDoList();
    for (const todo of list) {
      console.log(todo);
      container.prepend(todo.getUi());
    }
  }

  updateToDoList() {
    const project=this.activeProject
    const container = this.todoContainer;
    console.log(project.getToDoList());
    const list = project.getToDoList();
    const lastIndex = list.length - 1;
    const todo = list[lastIndex];
    container.prepend(todo.getUi());
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name;
    });
    const nameInUse = projectNames.includes(data.name);

    if (nameInUse) {
      throw new Error();
    }

    const project = new Project(data);
    this.ui.prepend(project.ui);
    this.list.push(project);

    //add event listener to project ui
    this.setPage(project);
    //here
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

      const projects: Project[] = JSON.parse(json as string);
      for (const project of projects) {
        try {
          this.newProject(project);
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
  }

  editProject(editted: EProject, current: Project) {
    // Eski ve yeni projeyi karşılaştıracak bir algorima yazılmalı, yeni projedeki boş veriler eskiden temin edilecek, eğer eski ve yeni proje verisi çakışıyorsa yeni olan seçilecek!
    console.log(editted);
  }
}
