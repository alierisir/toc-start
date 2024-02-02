import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { IProject, Status, Role, EProject } from "./classes/Project";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ProjectsManager } from "./classes/ProjectsManager";
import { ErrorManager } from "./classes/ErrorManager";
import { ISingleError } from "./classes/SingleError";
import { IToDo, ToDoStatus } from "./classes/ToDo";
import { editDummy } from "./classes/CustomFunctions";

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

//ThreeJS Viewer

const viewerContainer = document.getElementById(
  "viewer-container"
) as HTMLElement;

//Create the scene

const scene = new THREE.Scene();

//Create the camera

const camera = new THREE.PerspectiveCamera(75);
camera.position.z = 5;
camera.position.y = 1;
camera.position.x = 2;

//Create the renderer

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
viewerContainer.append(renderer.domElement);

resizeViewer();
window.addEventListener("resize", resizeViewer);

function resizeViewer() {
  const containerDimensions = viewerContainer.getBoundingClientRect();
  renderer.setSize(containerDimensions.width, containerDimensions.height);
  const aspectRatio = containerDimensions.width / containerDimensions.height;
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();
}

//Create the object

const boxGeometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial();
const cube = new THREE.Mesh(boxGeometry, material);

//Create the lights

const directionalLight = new THREE.DirectionalLight();
const ambientLight = new THREE.AmbientLight("white", 0.2);

//Add to scene

scene.add(directionalLight, ambientLight);

//Add controls
const camCont = new OrbitControls(camera, renderer.domElement);
const dlHelper = new THREE.DirectionalLightHelper(directionalLight);

const axes = new THREE.AxesHelper();
const grid = new THREE.GridHelper();
grid.material.transparent = true;
grid.material.opacity = 0.4;
grid.material.color = new THREE.Color("#00ffff");
const gui = new GUI();

scene.add(axes, grid);

function lightFollowCube(light, object) {
  light.target.position.x = object.position.x;
  light.target.position.y = object.position.y;
  light.target.position.z = object.position.z;
}

const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const gltfLoader = new GLTFLoader();

let counter = 0;
window.addEventListener("keydown", (event) => {
  if (event.key === "s" && counter === 0) {
    mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
        scene.add(mesh);
        counter += 1;
      });
    });
  }
  if (event.key === "a") {
    try {
      scene.children[5].children[0].position.x += 1;
    } catch (error) {}
  }
  if (event.key === "d") {
    try {
      scene.children[5].children[0].position.x -= 1;
    } catch (error) {}
  }
  if (event.key === "g") {
    gltfLoader.load("../assets/glTF/ABeautifulGame.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.animations;
    });
  }
  if (event.key === "j") {
    gltfLoader.load("../assets/glTF/Sponza.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.x = 1;
      gltf.scene.scale.y = 1;
      gltf.scene.scale.z = 1;
      console.log(gltf.asset);
    });
  }
});

function renderScreen() {
  dlHelper.update();
  renderer.render(scene, camera);
  requestAnimationFrame(renderScreen);
}

renderScreen();

const dlControls = gui.addFolder("Directional Light");
dlControls.add(directionalLight.position, "x", -20, 20, 0.5);
dlControls.add(directionalLight.position, "y", -20, 20, 0.5);
dlControls.add(directionalLight.position, "z", -20, 20, 0.5);
dlControls.add(directionalLight, "visible");

const spotLight = new THREE.SpotLight();
spotLight.position.x = 15;
spotLight.position.y = 15;
spotLight.position.y = 15;

const slControls = gui.addFolder("Spot Light");
slControls.add(spotLight.position, "x", -20, 20, 0.5);
slControls.add(spotLight.position, "y", -20, 20, 0.5);
slControls.add(spotLight.position, "z", -20, 20, 0.5);
slControls.add(spotLight, "visible");

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLight);
