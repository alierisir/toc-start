import * as OBC from "openbim-components";
import { FragmentsGroup } from "bim-fragment";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Sidebar from "./react-components/Sidebar";

import { IProject, Status, Role, EProject } from "./classes/Project";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ErrorManager } from "./classes/ErrorManager";
import { ISingleError } from "./classes/SingleError";
import { IToDo, ToDoStatus } from "./classes/ToDo";
import {
  editDummy,
  correctDate,
  dateAfterFromPoint,
  formatDate,
} from "./classes/CustomFunctions";
import { TodoCreator } from "./bim-components/TodoCreator";
import { SimpleQto } from "./bim-components/SimpleQto";

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(<Sidebar />);

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

const todoForm = document.getElementById("new-todo-form");

const todoCancel = document.getElementById("todo-cancel");

const addTodoBtn = projectDetailsPage.querySelector(`[todo-add]`);

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

//OPEN VIEWER

const viewer = new OBC.Components();

const sceneComponent = new OBC.SimpleScene(viewer);
sceneComponent.setup();
const scene = sceneComponent.get();
scene.background = null;

viewer.scene = sceneComponent;

const viewerContainer = document.getElementById(
  "viewer-container"
) as HTMLDivElement;
const rendererComponent = new OBC.PostproductionRenderer(
  viewer,
  viewerContainer
);

viewer.renderer = rendererComponent;

const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);

viewer.camera = cameraComponent;

const raycasterComponent = new OBC.SimpleRaycaster(viewer);
viewer.raycaster = raycasterComponent;
rendererComponent.postproduction.enabled = true;

viewer.init();
cameraComponent.updateAspect();

const fragmentManager = new OBC.FragmentManager(viewer);

const exportFragments = (model: FragmentsGroup) => {
  const fragmentsBinary = fragmentManager.export(model);
  const blob = new Blob([fragmentsBinary]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${model.name.replace(".ifc", "")}.frag`;
  link.click();
  URL.revokeObjectURL(url);
};

const exportToJSON = (model: FragmentsGroup) => {
  const json = JSON.stringify(model.properties, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${model.name.replace(".ifc", "")}-properties`;
  link.click();
  URL.revokeObjectURL(url);
};

const highlighter = new OBC.FragmentHighlighter(viewer);
highlighter.setup();

// const grid = new OBC.SimpleGrid(viewer);

const toolbar = new OBC.Toolbar(viewer, {
  name: "Top Toolbar",
  position: "top",
});

viewer.ui.addToolbar(toolbar);

const toggleViewBtn = new OBC.Button(viewer, {
  materialIconName: "visibility",
  tooltip: "Toggle View",
});

const toggleGridBtn = new OBC.Button(viewer, {
  materialIconName: "grid_4x4",
  tooltip: "Toggle Grid",
});

const simpleGrid = new OBC.SimpleGrid(viewer);
simpleGrid.visible = false;

toggleGridBtn.onClick.add(() => {
  toggleGridBtn.active = !toggleGridBtn.active;
  simpleGrid.visible = toggleGridBtn.active;
});

toggleViewBtn.onClick.add(() => {
  cameraComponent.toggleProjection();
  toggleViewBtn.active = !toggleViewBtn.active;
});

const cubeMap = new OBC.CubeMap(viewer);

const classifier = new OBC.FragmentClassifier(viewer);
const classifierWindow = new OBC.FloatingWindow(viewer);
classifierWindow.title = "Model Tree";
classifierWindow.visible = false;
viewer.ui.add(classifierWindow);

const ifcPropertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
highlighter.events.select.onClear.add(() => {
  ifcPropertiesProcessor.cleanPropertiesList();
});

const ifcLoader = new OBC.FragmentIfcLoader(viewer);
ifcLoader.settings.wasm = {
  absolute: true,
  path: "https://unpkg.com/web-ifc@0.0.44/",
};

const loaderBtn = new OBC.Button(viewer);
loaderBtn.tooltip = "Load File";
loaderBtn.materialIcon = "input";

const setupDepthTest = () => {
  const selectMat = highlighter.highlightMats.select
    ? highlighter.highlightMats.select[0]
    : undefined;
  const hoverMat = highlighter.highlightMats.hover
    ? highlighter.highlightMats.hover[0]
    : undefined;

  selectMat ? (selectMat.depthTest = false) : "Can't find the select material";
  hoverMat ? (hoverMat.depthTest = false) : "Can't find the hover material";
};

interface BTNProps {
  floatWindow: OBC.FloatingWindow;
  materialIconName?: string;
  tooltip?: string;
  bar?: OBC.Toolbar;
}

const createWindowBtn = ({
  floatWindow,
  materialIconName = "radio_button_unchecked",
  tooltip = "Tooltip",
  bar = toolbar,
}: BTNProps) => {
  const windowBtn = new OBC.Button(viewer);
  windowBtn.materialIcon = materialIconName;
  windowBtn.tooltip = tooltip;
  windowBtn.onClick.add(() => {
    windowBtn.active = !windowBtn.active;
    floatWindow.visible = windowBtn.active;
  });

  floatWindow.onHidden.add(() => {
    windowBtn.active = false;
  });

  bar.addChild(windowBtn);
};

const createModelTree = async () => {
  const fragmentTree = new OBC.FragmentTree(viewer);
  await fragmentTree.init();
  await fragmentTree.update(["model", "storeys", "entities"]);
  //setupDepthTest();
  fragmentTree.onHovered.add((fragmentMap) => {
    highlighter.highlightByID("hover", fragmentMap);
  });
  fragmentTree.onSelected.add((fragmentMap) => {
    highlighter.highlightByID("select", fragmentMap);
  });
  const tree = fragmentTree.get().uiElement.get("tree");
  return tree;
};

const fragmentLoadBtn = new OBC.Button(viewer, {
  materialIconName: "upload",
  tooltip: "Load Fragment",
});

fragmentLoadBtn.onClick.add(() => {
  loadFragment();
});

const importFromJson = (model: FragmentsGroup) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const json = reader.result;
    if (!json) {
      return;
    }
    model.properties = JSON.parse(json as string);
    await onModelLoaded(model);
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
};

const loadFragment = () => {
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
};

const getExpressID = (fragmentMap: OBC.FragmentIdMap) => {
  return Number([...Object.values(fragmentMap)[0]][0]);
};

const culler = new OBC.ScreenCuller(viewer);
cameraComponent.controls.addEventListener("sleep", () => {
  culler.needsUpdate = true;
});

const onModelLoaded = async (model: FragmentsGroup) => {
  highlighter.update();
  for (const fragment of model.items) {
    culler.add(fragment.mesh);
  }
  culler.needsUpdate = true;

  try {
    classifier.byModel(model.name, model);
    classifier.byEntity(model);
    classifier.byStorey(model);
    const tree = await createModelTree();
    await classifierWindow.slots.content.dispose(true);
    classifierWindow.addChild(tree);
    ifcPropertiesProcessor.process(model);
    highlighter.events.select.onHighlight.add(async (fragmentMap) => {
      const expressID = getExpressID(fragmentMap);
      await ifcPropertiesProcessor.renderProperties(model, expressID);
    });
  } catch (error) {
    alert("properties are missing");
  }
};

ifcLoader.onIfcLoaded.add(async (model) => {
  //exportFragments(model);
  //exportToJSON(model);
  await onModelLoaded(model);
});

fragmentManager.onFragmentsLoaded.add((model) => {
  importFromJson(model);
});

const todoCreator = new TodoCreator(viewer);
await todoCreator.setup();
todoCreator.onProjectCreated.add((todo) => {
  console.log(`Task:${todo.id} is successfully added to list`);
});

window.addEventListener("keydown", (e) => {
  if (!(e.key === "a" || e.key === "A")) return;
  console.log("getting fragment qtys..");
  todoCreator.fragmentQty;
  console.log("end");
});

const qtoManager = new SimpleQto(viewer);
await qtoManager.setup();

const propsFinder = new OBC.IfcPropertiesFinder(viewer);
await propsFinder.init();

const addTooltip = (btn: OBC.Button, str: string) => {
  btn.tooltip = str;
};

propsFinder.onFound.add(async (fragmentIdMap) => {
  await highlighter.highlightByID("select", fragmentIdMap);
});

addTooltip(propsFinder.uiElement.get("main"), "Find Properties");
addTooltip(qtoManager.uiElement.get("activationBtn"), "Summary");

toolbar.addChild(toggleGridBtn, toggleViewBtn);
toolbar.addChild(loaderBtn);
loaderBtn.addChild(ifcLoader.uiElement.get("main"));
loaderBtn.addChild(fragmentLoadBtn);

createWindowBtn({
  floatWindow: classifierWindow,
  materialIconName: "account_tree",
  tooltip: "Model Groups",
});

toolbar.addChild(ifcPropertiesProcessor.uiElement.get("main"));
toolbar.addChild(propsFinder.uiElement.get("main"));

toolbar.addChild(todoCreator.uiElement.get("activationButton"));
toolbar.addChild(qtoManager.uiElement.get("activationBtn"));
