import { IProject, EProject, Status, Role, Project } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ErrorManager } from "./classes/ErrorManager";
import { ISingleError } from "./classes/SingleError";

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

const editFormBtn = document.getElementById("p-edit");
if (editFormBtn && editFormBtn instanceof HTMLButtonElement) {
  editFormBtn.addEventListener("click", () => {
    toggleModal("edit-project-modal");
    const page = projectsManager.detailsPage;
    const projectName = page.querySelector(
      `[data-project-info="name"]`
    )?.textContent;
    //get project parameters
    if (
      projectName &&
      editForm &&
      editFormCancel &&
      editForm instanceof HTMLFormElement
    ) {
      const project = projectsManager.getProjectByName(projectName);
      //Get current project values as placeholder for new inputs
      if (project) {
        const name = document.getElementById("edit-name") as HTMLInputElement;
        name.placeholder = project.name;
        const description = document.getElementById(
          "edit-description"
        ) as HTMLInputElement;
        description.placeholder = project.description;
        const date = document.getElementById("edit-date") as HTMLInputElement;
        date.value = project.date.toString().split("T")[0];
        const role = document.getElementById("edit-role") as HTMLSelectElement;
        role.value = project.role;
        const status = document.getElementById(
          "edit-status"
        ) as HTMLSelectElement;
        status.value = project.status;
        const cost = document.getElementById("edit-cost") as HTMLInputElement;
        cost.placeholder = `$${project.cost}`;
        const progress = document.getElementById(
          "edit-progress"
        ) as HTMLInputElement;
        progress.placeholder = `${project.progress}%`;
      }
      //Cancel button functionality
      editFormCancel.addEventListener("click", () => {
        const dia = document.getElementById(
          "edit-project-modal"
        ) as HTMLDialogElement;
        dia?.close();
        editForm.reset();
      });
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const editData = new FormData(editForm);
        const edittedProjectData: EProject = {
          name: editData.get("edit-name") as string,
          description: editData.get("edit-description") as string,
          status: editData.get("edit-status") as Status,
          role: editData.get("edit-role") as Role,
          date: new Date(editData.get("edit-date") as string),
          cost: Number(editData.get("edit-cost") as string),
          progress: Number(editData.get("edit-progress") as string),
        };
        if (project) projectsManager.editProject(edittedProjectData, project);
        const dia = document.getElementById(
          "edit-project-modal"
        ) as HTMLDialogElement;
        dia?.close();
        editForm.reset();
      });
    }
  });
}

const addTodoBtn = projectDetailsPage.querySelector(`[todo-add]`);
const todoContainer = projectDetailsPage.querySelector(`[todo-list-container]`);
if (
  addTodoBtn &&
  addTodoBtn instanceof HTMLElement &&
  todoContainer &&
  todoContainer instanceof HTMLElement
) {
  addTodoBtn.addEventListener("click", () => {
    const projectName = projectsManager.detailsPage.querySelector(
      `[data-project-info="name"]`
    )?.textContent;
    if (projectName) {
      const project = projectsManager.getProjectByName(projectName);
      if (project && project instanceof Project) {
        project.addDummyToDo();
        projectsManager.updateToDoList(project);
      }
    } else {
      return console.log(
        projectName,
        " cannot be found. Check the project name!"
      );
    }
  });
} else {
  console.log("check the HTML elements for ToDo List Functionality");
}
