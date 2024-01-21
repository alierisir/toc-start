import { IProject, EProject, Status, Role, Project } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ErrorManager } from "./classes/ErrorManager";
import { ISingleError } from "./classes/SingleError";
import { IToDo, ToDoStatus } from "./classes/ToDo";
import { correctDate, dateAfterFromPoint } from "./classes/CustomFunctions";

//Page navigations
const pageIds = ["projects-page", "users-page", "project-details"];
const projectPageBtn = document.getElementById("nav-project");
const userPageBtn = document.getElementById("nav-user");

function openPage(id: string) {
  const pageId = pageIds.filter((elem) => elem === id)[0];
  const inactivePagesIds = pageIds.filter((elem) => elem !== id);
  inactivePagesIds.map((id) => {
    const inactivePage = document.getElementById(id);
    inactivePage
      ? (inactivePage.style.display = "none")
      : console.log("Inactive page is not found!");
  });
  const page = document.getElementById(pageId);
  page ? (page.style.display = "flex") : console.warn("Check page id: ", id);
}

if (projectPageBtn && userPageBtn) {
  projectPageBtn.addEventListener("click", () => {
    openPage("projects-page");
  });
  userPageBtn.addEventListener("click", () => {
    openPage("users-page");
  });
} else {
  console.warn("Navigation button is not found!");
}

const errContainer = document.getElementById("err-dialog") as HTMLDialogElement;
const errManager = new ErrorManager(errContainer);

function toggleModal(id: string) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    if (modal.open) modal.close();
    else modal.showModal();
  } else console.warn("Element id is not found!", id);
}

const newProjectBtn = document.getElementById("new-project-btn");
const newUserBtn = document.getElementById("new-user-btn");

if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    toggleModal("new-project-modal");
  });
} else console.log("Button cannot be found, check html ids!");

if (newUserBtn) {
  newUserBtn.addEventListener("click", () => {
    toggleModal("new-user-modal");
  });
} else console.log("Button cannot be found, check the ID!");

const projectsListUi = document.getElementById("projects-list") as HTMLElement;
const projectDetailsPage = document.getElementById(
  "project-details"
) as HTMLElement;

const projectsManager = new ProjectsManager(projectsListUi, projectDetailsPage);

const projectForm = document.getElementById("new-project-form");
const editForm = document.getElementById("edit-project-form");
const formCancel = document.getElementById("form-cancel");
const editFormCancel = document.getElementById("edit-form-cancel");

if (
  projectForm &&
  projectForm instanceof HTMLFormElement &&
  formCancel &&
  formCancel instanceof HTMLButtonElement
) {
  //Cancel button functionality
  formCancel.addEventListener("click", () => {
    projectForm.reset();
    toggleModal("new-project-modal");
  });
  //Form functionality
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as Status,
      role: formData.get("role") as Role,
      date: new Date(formData.get("date") as string),
    };
    try {
      projectsManager.newProject(projectData);
      projectForm.reset();
      toggleModal("new-project-modal");
    } catch (e) {
      const errDef: ISingleError = {
        code: "001",
        text: `A project with the name"${projectData.name}" already exists.`,
        header: "Input Error",
      };
      errManager.newError(errDef);
    }
  });
} else {
  console.warn("Form is not found or it is not an HTMLForm, check the ID");
}

//Import & Export Functionality

const importBtn = document.getElementById("import-from-json");
const exportBtn = document.getElementById("export-to-json");

if (
  importBtn &&
  importBtn instanceof HTMLButtonElement &&
  exportBtn &&
  exportBtn instanceof HTMLButtonElement
) {
  exportBtn.addEventListener("click", () => {
    projectsManager.exportToJSON();
  });
  importBtn.addEventListener("click", () => {
    projectsManager.importFromJSON();
  });
} else {
  console.warn("Buttons are not found. Check export and import button ids!");
}

//edit project form
const editProjectModal = document.getElementById("edit-project-modal");
const editFormBtn = document.getElementById("p-edit");
if (
  editProjectModal &&
  editProjectModal instanceof HTMLDialogElement &&
  editFormBtn &&
  editFormBtn instanceof HTMLButtonElement &&
  editForm &&
  editFormCancel &&
  editForm instanceof HTMLFormElement
) {
  editFormBtn.addEventListener("click", () => {
    editProjectModal.showModal();
    //Get current project values as placeholder for new inputs
    const project = projectsManager.activeProject;
    const name = document.getElementById("edit-name") as HTMLInputElement;
    name.placeholder = project.name;
    const description = document.getElementById(
      "edit-description"
    ) as HTMLInputElement;
    description.placeholder = project.description;
    const date = document.getElementById("edit-date") as HTMLInputElement;
    const { year, monthNumber, day } = correctDate(project.date);
    date.value = `${year}-${monthNumber}-${day}`;
    const role = document.getElementById("edit-role") as HTMLSelectElement;
    role.value = project.role;
    const status = document.getElementById("edit-status") as HTMLSelectElement;
    status.value = project.status;
    const cost = document.getElementById("edit-cost") as HTMLInputElement;
    cost.placeholder = `$${project.cost}`;
    const progress = document.getElementById(
      "edit-progress"
    ) as HTMLInputElement;
    progress.placeholder = `${project.progress}%`;
    //Cancel button functionality
    editFormCancel.addEventListener("click", () => {
      editProjectModal.close();
      editForm.reset();
    });

    //Form submit functionality
    editForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const edittedData = new FormData(editForm);
      const edittedProject: EProject = {
        name: edittedData.get("edit-name") as string,
        description: edittedData.get("edit-description") as string,
        status: edittedData.get("edit-status") as Status,
        role: edittedData.get("edit-role") as Role,
        date: new Date(edittedData.get("edit-date") as string),
        cost: Number(edittedData.get("edit-cost") as string),
        progress: Number(edittedData.get("edit-progress") as string),
      };
      if (project) projectsManager.editProject(edittedProject, project);
      editProjectModal.close();
      editForm.reset();
    });
  });
}

//ToDo Create Form
const todoModal = document.getElementById("new-todo-modal");
console.log("modal", todoModal);
const todoForm = document.getElementById("new-todo-form");
console.log("form", todoForm);
const todoCancel = document.getElementById("todo-cancel");
console.log("cancelbtn", todoCancel);
const addTodoBtn = projectDetailsPage.querySelector(`[todo-add]`);
console.log("addTodobtn", addTodoBtn);
const todoContainer = projectDetailsPage.querySelector(`[todo-list-container]`);
if (
  todoModal &&
  todoModal instanceof HTMLDialogElement &&
  todoForm &&
  todoForm instanceof HTMLFormElement &&
  todoCancel &&
  todoCancel instanceof HTMLButtonElement &&
  addTodoBtn &&
  addTodoBtn instanceof HTMLElement &&
  todoContainer &&
  todoContainer instanceof HTMLElement
) {
  //open dialog
  addTodoBtn.addEventListener("click", () => {
    todoModal.showModal();
  });

  //cancel button functionality
  todoCancel.addEventListener("click", () => {
    todoForm.reset();
    todoModal.close();
  });
  todoForm.addEventListener("submit", (e) => {
    //prevent default
    e.preventDefault();
    //gather todo parameters
    const formData = new FormData(todoForm);
    const dateInput = document.getElementById("todo-deadline");
    console.log("Date input element:", dateInput);

    const iTodo: IToDo = {
      task: formData.get("todo-task") as string,
      status: formData.get("todo-status") as ToDoStatus,
      deadline: new Date(formData.get("todo-deadline") as string),
    };
    //create new todo
    projectsManager.activeProject.newToDo(iTodo);
    //update Ui and Project
    projectsManager.updateToDoList();
    todoForm.reset();
    todoModal.close();
  });
}
