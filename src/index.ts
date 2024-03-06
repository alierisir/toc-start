import * as THREE from "three";
import { Color } from "three";
import { IfcProperties } from "bim-fragment";
import * as OBC from "openbim-components";
import { IProject, Status, Role, EProject } from "./classes/Project";
import { FragmentsGroup } from "bim-fragment";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ErrorManager } from "./classes/ErrorManager";
import { ISingleError } from "./classes/SingleError";
import { IToDo, ToDoStatus } from "./classes/ToDo";
import { editDummy } from "./classes/CustomFunctions";
import { TodoCreator } from "./bim-components/ToDoCreator";

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

//edit project form elements, made sure they are exist in HTML
const editFormBtn = document.getElementById("p-edit") as HTMLButtonElement;
const editForm = document.getElementById(
  "edit-project-form"
) as HTMLFormElement;
const editFormCancel = document.getElementById(
  "edit-form-cancel"
) as HTMLButtonElement;

editFormBtn.addEventListener("click", () => {
  toggleModal("edit-project-modal");
  for (const key in editDummy) {
    const value = projectsManager.activeProject[key];
    const element = editForm.querySelector(
      `[name="edit-${key}"]`
    ) as HTMLInputElement;
    element.placeholder = value;
    if (key === "progress") element.placeholder += "%";
    if (key === "cost") element.placeholder = `$${value}`;
    if (key === "status" || key === "role") element.value = value;
    if (key === "date") element.valueAsDate = new Date(value);
  }
});

editFormCancel.addEventListener("click", () => {
  toggleModal("edit-project-modal");
  editForm.reset();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const editedData: EProject = {
    name: formData.get("edit-name") as string,
    description: formData.get("edit-description") as string,
    status: formData.get("edit-status") as Status,
    role: formData.get("edit-role") as Role,
    cost: Number(formData.get("edit-cost")),
    progress: Number(formData.get("edit-progress")),
    date: new Date(formData.get("edit-date") as string),
  };
  const nameIsAvailable = !projectsManager.checkEditNameInUse(editedData);
  if (nameIsAvailable) {
    projectsManager.activeProject.editProject(editedData);
    projectsManager.setPageDetails();
    toggleModal("edit-project-modal");
    editForm.reset();
  } else {
    console.warn("There is another project with the same name!");
    editForm.reset();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "a" || e.key === "A")
    console.log(
      projectsManager.activeProject.id,
      projectsManager.activeProject.name
    );
});

// //Open  Viewer
console.clear();
const viewer = new OBC.Components();
const sceneComponent = new OBC.SimpleScene(viewer);
viewer.scene = sceneComponent;
const scene = sceneComponent.get();
sceneComponent.setup();
scene.background = null;

const viewerContainer = document.getElementById(
  "viewer-container"
) as HTMLElement;
const rendererComponent = new OBC.PostproductionRenderer(
  viewer,
  viewerContainer
);
viewer.renderer = rendererComponent;

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
viewer.camera = cameraComponent;

const raycasterComponent = new OBC.SimpleRaycaster(viewer);
viewer.raycaster = raycasterComponent;

const grid = new THREE.GridHelper(100, 100);
grid.material.transparent = true;
grid.material.opacity = 0.4;
grid.material.color = new THREE.Color("#00ffff");
grid.visible = false;
scene.add(grid);

viewer.init();
cameraComponent.updateAspect();
rendererComponent.postproduction.enabled = true;

const fragmentManager = new OBC.FragmentManager(viewer);

function exportFragments(model: FragmentsGroup) {
  const fragmentBinary = fragmentManager.export(model);
  const blob = new Blob([fragmentBinary]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${model.name.replace(".ifc", "")}.frag`;
  link.click();
  URL.revokeObjectURL(url);
  const json = JSON.stringify(model.properties, null, 2);
  const propBlob = new Blob([json], { type: "application/json" });
  const propUrl = URL.createObjectURL(propBlob);
  const propLink = document.createElement("a");
  propLink.href = propUrl;
  propLink.download = `${model.name.replace(".ifc", "")}.json`;
  propLink.click();
  URL.revokeObjectURL(propUrl);
}

const fragmentHighlighter = new OBC.FragmentHighlighter(viewer);
fragmentHighlighter.setup();

const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
fragmentHighlighter.events.select.onClear.add(() => {
  propertiesProcessor.cleanPropertiesList();
});

const classifier = new OBC.FragmentClassifier(viewer);
const classifierWindow = new OBC.FloatingWindow(viewer);
viewer.ui.add(classifierWindow);
classifierWindow.title = "Model Groups";
classifierWindow.visible = false;

let fragmentIfcLoader = new OBC.FragmentIfcLoader(viewer);
fragmentIfcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.43/",
  absolute: true,
};

async function createModelTree() {
  const fragmentTree = new OBC.FragmentTree(viewer);
  await fragmentTree.init();
  await fragmentTree.update(["model", "storeys", "entities"]);
  fragmentTree.onHovered.add((fragmentMap) => {
    fragmentHighlighter.highlightByID("hover", fragmentMap);
  });
  fragmentTree.onSelected.add((fragmentMap) => {
    fragmentHighlighter.highlightByID("select", fragmentMap);
  });
  const tree = fragmentTree.get().uiElement.get("tree");
  return tree;
}

const culler = new OBC.ScreenCuller(viewer);
cameraComponent.controls.addEventListener("sleep", () => {
  culler.needsUpdate = true;
});

async function onModelLoad(model: FragmentsGroup) {
  fragmentHighlighter.update();
  for (const fragment of model.items) {
    culler.add(fragment.mesh);
  }
  culler.needsUpdate = true;

  try {
    classifier.byEntity(model);
    classifier.byStorey(model);
    classifier.byModel(model.name, model);
    const tree = await createModelTree();
    await classifierWindow.slots.content.dispose(true);
    // Individual buttons for toggle model visibility
    //const modelBtn = new OBC.Button(viewer);
    //modelBtn.materialIcon = "view_in_ar";
    //makeToggleBtn(modelBtn, model);
    classifierWindow.addChild(tree);

    propertiesProcessor.process(model);
    fragmentHighlighter.events.select.onHighlight.add((fragmentMap) => {
      const expressID = [...Object.values(fragmentMap)[0]][0];
      propertiesProcessor.renderProperties(model, Number(expressID));
    });
  } catch (error) {
    console.warn("properties couldn't be found.");
  }
}

fragmentIfcLoader.onIfcLoaded.add(async (model) => {
  exportFragments(model);
  onModelLoad(model);
});

fragmentManager.onFragmentsLoaded.add(async (model) => {
  await importFromJSON(model);
  console.log(model);
  for (const item of model.items) {
    if (item.id !== "0389b443-0c9d-41bd-be7c-d8c1be895ea3") {
      console.log(item.blocks.count);
    }
  }
  if (!fragmentManager.baseCoordinationModel) {
    fragmentManager.baseCoordinationModel = fragmentManager.groups[0].uuid;
  }
});

const todoCreator = new TodoCreator(viewer);

const mainToolBar = new OBC.Toolbar(viewer);
viewer.ui.addToolbar(mainToolBar);
mainToolBar.addChild(
  fragmentIfcLoader.uiElement.get("main"),
  propertiesProcessor.uiElement.get("main"),
  fragmentManager.uiElement.get("main"),
  todoCreator.uiElement.get("activationButton")
);

const classifierWindowBtn = new OBC.Button(viewer);
classifierWindowBtn.materialIcon = "account_tree";
classifierWindowBtn.tooltip = "Tree View";

const gridBtn = new OBC.Button(viewer);
gridBtn.materialIcon = "grid_4x4";
gridBtn.tooltip = "Toggle Grid";

const importFragmentBtn = new OBC.Button(viewer);
importFragmentBtn.materialIcon = "upload";
importFragmentBtn.tooltip = "Upload Fragment";

importFragmentBtn.onClick.add(() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".frag";
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const binary = reader.result;
    if (!(binary instanceof ArrayBuffer)) {
      return;
    }
    const fragmentBinary = new Uint8Array(binary);
    await fragmentManager.load(fragmentBinary);
  });

  input.addEventListener("change", () => {
    const fileList = input.files;
    if (!fileList) {
      return;
    }
    const file = fileList[0];
    reader.readAsArrayBuffer(file);
  });
  input.click();
});

mainToolBar.addChild(importFragmentBtn);

//custom function for CSS and  misc.

function makeToggleBtn(btn: OBC.Button, elem: any) {
  btn.onClick.add(() => {
    elem.visible ? (elem.visible = false) : (elem.visible = true);
  });
  mainToolBar.addChild(btn);
}

export function styleItUp(domElement: any) {
  domElement.style.background = "#000022";
  domElement.style.opacity = "0.7";
  domElement.style.color = "#54beff";
}

//custom function for CSS and  misc.

//make ui elements styled as i wish

styleItUp(propertiesProcessor.uiElement.get("propertiesWindow").domElement);
styleItUp(fragmentManager.uiElement.get("window").domElement);
styleItUp(classifierWindow.domElement);
styleItUp(mainToolBar.domElement);
styleItUp(todoCreator.uiElement.get("todoList").domElement);

//make ui elements styled as i wish

//changing default highlight materials
//const myColor = new Color(0.33, 0.33, 1);
//const [colorObj] = [
//  ...Object.values(fragmentHighlighter.highlightMats),
//] as unknown as THREE.Material[];
//colorObj[0].color = myColor;
//changing default highlight materials

makeToggleBtn(gridBtn, grid);
makeToggleBtn(classifierWindowBtn, classifierWindow);

//JSON import function

async function importFromJSON(model: FragmentsGroup) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const json = reader.result;
    if (!json) return;
    model.properties = JSON.parse(json as string);
    await onModelLoad(model);
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

addEventListener("keydown", (e) => {
  if (e.key === "m") console.log(fragmentManager);
});
