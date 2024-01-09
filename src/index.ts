import { IProject, Status, Role } from "./classes/Project";
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
const projectsManager = new ProjectsManager(projectsListUi);

const projectForm = document.getElementById("new-project-form");
const formCancel = document.getElementById("form-cancel");

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

//page navigation tryouts

//
// function activePage(id) {
//   allPages.forEach((page) => (page.style.display = "none"));
//   document.getElementById(id).style.display = "flex";
// }
//
// const projectPageBtn = document.getElementById("nav-project");
// const userPageBtn = document.getElementById("nav-user");
//
// projectPageBtn.addEventListener("click", () => {
//   activePage("projects-page");
// });
//
// userPageBtn.addEventListener("click", () => {
//   activePage("users-page");
// });

/* Mock Functions for create buttons

const createUser={
    btnId:"new-user-btn",
    containerId:"users-list",
    cardTag:"ul",
    cardHtml:`
    <li class="w20 center">Cansu Tüfekci</li>
    <li class="w20 center">Developer</li>
    <li class="w20 center">Universal-ph3</li>
    <li class="w20 center">cc.tufekci@gmail.com</li>
    <li class="w20 center">Özgün Koçyiğit</li>
    `,
    cardClass:"user-row"
}



const createProject={
    btnId:"new-project-btn",
    containerId:"projects-list",
    cardTag:"div",
    cardHtml:`<div class="card-header">
    <p>HC</p>
    <div>
    <h2>Project Name</h2>
    <p >Project Description Lorem ipsum dolor sit amet.</p>
    </div>
    </div>
    <div class="card-content">
    <div class="card-property">
        <p>Status</p>
        <p>Active</p>
    </div>
    <div class="card-property">
        <p>Role</p>
        <p>Engineer</p>
    </div>
    <div class="card-property">
        <p>Cost</p>
        <p>20000TRY</p>
    </div>
    <div class="card-property">
        <p>Finishing Date</p>
        <p>26/12/2025</p>
    </div>
    </div>`,
    cardClass:"project-card"
}

function makeFunctional(createObject){
    const btn=document.getElementById(createObject.btnId)
    const container=document.getElementById(createObject.containerId)
    btn.addEventListener("click",()=>{
        const card = document.createElement(createObject.cardTag)
        card.innerHTML=createObject.cardHtml
        card.className=createObject.cardClass
        container.append(card)
    })
}

makeFunctional(createProject)
makeFunctional(createUser)

*/
