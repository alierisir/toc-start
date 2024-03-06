import * as THREE from "/node_modules/.vite/deps/three.js?v=ce537bd3";
import * as OBC from "/node_modules/.vite/deps/openbim-components.js?v=ce537bd3";
import { ProjectsManager } from "/src/classes/ProjectsManager.ts";
import { ErrorManager } from "/src/classes/ErrorManager.ts";
import { editDummy } from "/src/classes/CustomFunctions.ts";
const pageIds = ["projects-page", "users-page", "project-details"];
const projectPageBtn = document.getElementById("nav-project");
const userPageBtn = document.getElementById("nav-user");
function openPage(id) {
  const pageId = pageIds.filter((elem) => elem === id)[0];
  const inactivePagesIds = pageIds.filter((elem) => elem !== id);
  inactivePagesIds.map((id2) => {
    const inactivePage = document.getElementById(id2);
    inactivePage ? inactivePage.style.display = "none" : console.log("Inactive page is not found!");
  });
  const page = document.getElementById(pageId);
  page ? page.style.display = "flex" : console.warn("Check page id: ", id);
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
const errContainer = document.getElementById("err-dialog");
const errManager = new ErrorManager(errContainer);
function toggleModal(id) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    if (modal.open)
      modal.close();
    else
      modal.showModal();
  } else
    console.warn("Element id is not found!", id);
}
const newProjectBtn = document.getElementById("new-project-btn");
const newUserBtn = document.getElementById("new-user-btn");
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {
    toggleModal("new-project-modal");
  });
} else
  console.log("Button cannot be found, check html ids!");
if (newUserBtn) {
  newUserBtn.addEventListener("click", () => {
    toggleModal("new-user-modal");
  });
} else
  console.log("Button cannot be found, check the ID!");
const projectsListUi = document.getElementById("projects-list");
const projectDetailsPage = document.getElementById(
  "project-details"
);
const projectsManager = new ProjectsManager(projectsListUi, projectDetailsPage);
const projectForm = document.getElementById("new-project-form");
const formCancel = document.getElementById("form-cancel");
if (projectForm && projectForm instanceof HTMLFormElement && formCancel && formCancel instanceof HTMLButtonElement) {
  formCancel.addEventListener("click", () => {
    projectForm.reset();
    toggleModal("new-project-modal");
  });
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(projectForm);
    const projectData = {
      name: formData.get("name"),
      description: formData.get("description"),
      status: formData.get("status"),
      role: formData.get("role"),
      date: new Date(formData.get("date"))
    };
    try {
      projectsManager.newProject(projectData);
      projectForm.reset();
      toggleModal("new-project-modal");
    } catch (e2) {
      const errDef = {
        code: "001",
        text: `A project with the name"${projectData.name}" already exists.`,
        header: "Input Error"
      };
      errManager.newError(errDef);
    }
  });
} else {
  console.warn("Form is not found or it is not an HTMLForm, check the ID");
}
const importBtn = document.getElementById("import-from-json");
const exportBtn = document.getElementById("export-to-json");
if (importBtn && importBtn instanceof HTMLButtonElement && exportBtn && exportBtn instanceof HTMLButtonElement) {
  exportBtn.addEventListener("click", () => {
    projectsManager.exportToJSON();
  });
  importBtn.addEventListener("click", () => {
    projectsManager.importFromJSON();
  });
} else {
  console.warn("Buttons are not found. Check export and import button ids!");
}
const todoModal = document.getElementById("new-todo-modal");
console.log("modal", todoModal);
const todoForm = document.getElementById("new-todo-form");
console.log("form", todoForm);
const todoCancel = document.getElementById("todo-cancel");
console.log("cancelbtn", todoCancel);
const addTodoBtn = projectDetailsPage.querySelector(`[todo-add]`);
console.log("addTodobtn", addTodoBtn);
const todoContainer = projectDetailsPage.querySelector(`[todo-list-container]`);
if (todoModal && todoModal instanceof HTMLDialogElement && todoForm && todoForm instanceof HTMLFormElement && todoCancel && todoCancel instanceof HTMLButtonElement && addTodoBtn && addTodoBtn instanceof HTMLElement && todoContainer && todoContainer instanceof HTMLElement) {
  addTodoBtn.addEventListener("click", () => {
    todoModal.showModal();
  });
  todoCancel.addEventListener("click", () => {
    todoForm.reset();
    todoModal.close();
  });
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(todoForm);
    const dateInput = document.getElementById("todo-deadline");
    console.log("Date input element:", dateInput);
    const iTodo = {
      task: formData.get("todo-task"),
      status: formData.get("todo-status"),
      deadline: new Date(formData.get("todo-deadline"))
    };
    projectsManager.activeProject.newToDo(iTodo);
    projectsManager.updateToDoList();
    todoForm.reset();
    todoModal.close();
  });
}
const editFormBtn = document.getElementById("p-edit");
const editForm = document.getElementById(
  "edit-project-form"
);
const editFormCancel = document.getElementById(
  "edit-form-cancel"
);
editFormBtn.addEventListener("click", () => {
  toggleModal("edit-project-modal");
  for (const key in editDummy) {
    const value = projectsManager.activeProject[key];
    const element = editForm.querySelector(
      `[name="edit-${key}"]`
    );
    element.placeholder = value;
    if (key === "progress")
      element.placeholder += "%";
    if (key === "cost")
      element.placeholder = `$${value}`;
    if (key === "status" || key === "role")
      element.value = value;
    if (key === "date")
      element.valueAsDate = new Date(value);
  }
});
editFormCancel.addEventListener("click", () => {
  toggleModal("edit-project-modal");
  editForm.reset();
});
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const editedData = {
    name: formData.get("edit-name"),
    description: formData.get("edit-description"),
    status: formData.get("edit-status"),
    role: formData.get("edit-role"),
    cost: Number(formData.get("edit-cost")),
    progress: Number(formData.get("edit-progress")),
    date: new Date(formData.get("edit-date"))
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
const viewer = new OBC.Components();
const sceneComponent = new OBC.SimpleScene(viewer);
viewer.scene = sceneComponent;
const scene = sceneComponent.get();
sceneComponent.setup();
scene.background = null;
const viewerContainer = document.getElementById(
  "viewer-container"
);
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
scene.add(grid);
viewer.init();
cameraComponent.updateAspect();
rendererComponent.postproduction.enabled = true;
const classifier = new OBC.FragmentClassifier(viewer);
const classifierWindow = new OBC.FloatingWindow(viewer);
viewer.ui.add(classifierWindow);
classifierWindow.title = "Model Groups";
classifierWindow.domElement.style.background = "black";
classifierWindow.domElement.style.opacity = "0.8";
classifierWindow.domElement.style.background = "blur(100px)";
classifierWindow.domElement.style.color = "#a2ff42";
let fragments = new OBC.FragmentManager(viewer);
let fragmentIfcLoader = new OBC.FragmentIfcLoader(viewer);
fragmentIfcLoader.settings.wasm = {
  path: "https://unpkg.com/web-ifc@0.0.43/",
  absolute: true
};
fragmentIfcLoader.onIfcLoaded.add(async (model) => {
  console.clear();
  fragmentHighlighter.update();
  classifier.byEntity(model);
  classifier.byStorey(model);
  console.log(classifier.get());
  const fragmentTree = new OBC.FragmentTree(viewer);
  await fragmentTree.init();
  await fragmentTree.update(["entities", "storeys"]);
  const tree = fragmentTree.get().uiElement.get("tree");
  tree.name = model.name;
  await classifierWindow.slots.content.dispose(true);
  classifierWindow.addChild(tree);
});
const fragmentHighlighter = new OBC.FragmentHighlighter(viewer);
fragmentHighlighter.setup();
const mainToolBar = new OBC.Toolbar(viewer);
viewer.ui.addToolbar(mainToolBar);
mainToolBar.addChild(fragmentIfcLoader.uiElement.get("main"));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0ICogYXMgT0JDIGZyb20gXCJvcGVuYmltLWNvbXBvbmVudHNcIjtcbmltcG9ydCB7IElQcm9qZWN0LCBTdGF0dXMsIFJvbGUsIEVQcm9qZWN0IH0gZnJvbSBcIi4vY2xhc3Nlcy9Qcm9qZWN0XCI7XG5pbXBvcnQgeyBQcm9qZWN0c01hbmFnZXIgfSBmcm9tIFwiLi9jbGFzc2VzL1Byb2plY3RzTWFuYWdlclwiO1xuaW1wb3J0IHsgRXJyb3JNYW5hZ2VyIH0gZnJvbSBcIi4vY2xhc3Nlcy9FcnJvck1hbmFnZXJcIjtcbmltcG9ydCB7IElTaW5nbGVFcnJvciB9IGZyb20gXCIuL2NsYXNzZXMvU2luZ2xlRXJyb3JcIjtcbmltcG9ydCB7IElUb0RvLCBUb0RvU3RhdHVzIH0gZnJvbSBcIi4vY2xhc3Nlcy9Ub0RvXCI7XG5pbXBvcnQgeyBlZGl0RHVtbXkgfSBmcm9tIFwiLi9jbGFzc2VzL0N1c3RvbUZ1bmN0aW9uc1wiO1xuXG4vL1BhZ2UgbmF2aWdhdGlvbnNcbmNvbnN0IHBhZ2VJZHMgPSBbXCJwcm9qZWN0cy1wYWdlXCIsIFwidXNlcnMtcGFnZVwiLCBcInByb2plY3QtZGV0YWlsc1wiXTtcbmNvbnN0IHByb2plY3RQYWdlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYXYtcHJvamVjdFwiKTtcbmNvbnN0IHVzZXJQYWdlQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYXYtdXNlclwiKTtcblxuZnVuY3Rpb24gb3BlblBhZ2UoaWQ6IHN0cmluZykge1xuICBjb25zdCBwYWdlSWQgPSBwYWdlSWRzLmZpbHRlcigoZWxlbSkgPT4gZWxlbSA9PT0gaWQpWzBdO1xuICBjb25zdCBpbmFjdGl2ZVBhZ2VzSWRzID0gcGFnZUlkcy5maWx0ZXIoKGVsZW0pID0+IGVsZW0gIT09IGlkKTtcbiAgaW5hY3RpdmVQYWdlc0lkcy5tYXAoKGlkKSA9PiB7XG4gICAgY29uc3QgaW5hY3RpdmVQYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGluYWN0aXZlUGFnZVxuICAgICAgPyAoaW5hY3RpdmVQYWdlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIilcbiAgICAgIDogY29uc29sZS5sb2coXCJJbmFjdGl2ZSBwYWdlIGlzIG5vdCBmb3VuZCFcIik7XG4gIH0pO1xuICBjb25zdCBwYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGFnZUlkKTtcbiAgcGFnZSA/IChwYWdlLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIikgOiBjb25zb2xlLndhcm4oXCJDaGVjayBwYWdlIGlkOiBcIiwgaWQpO1xufVxuXG5pZiAocHJvamVjdFBhZ2VCdG4gJiYgdXNlclBhZ2VCdG4pIHtcbiAgcHJvamVjdFBhZ2VCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBvcGVuUGFnZShcInByb2plY3RzLXBhZ2VcIik7XG4gIH0pO1xuICB1c2VyUGFnZUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIG9wZW5QYWdlKFwidXNlcnMtcGFnZVwiKTtcbiAgfSk7XG59IGVsc2Uge1xuICBjb25zb2xlLndhcm4oXCJOYXZpZ2F0aW9uIGJ1dHRvbiBpcyBub3QgZm91bmQhXCIpO1xufVxuXG5jb25zdCBlcnJDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVyci1kaWFsb2dcIikgYXMgSFRNTERpYWxvZ0VsZW1lbnQ7XG5jb25zdCBlcnJNYW5hZ2VyID0gbmV3IEVycm9yTWFuYWdlcihlcnJDb250YWluZXIpO1xuXG5mdW5jdGlvbiB0b2dnbGVNb2RhbChpZDogc3RyaW5nKSB7XG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICBpZiAobW9kYWwgJiYgbW9kYWwgaW5zdGFuY2VvZiBIVE1MRGlhbG9nRWxlbWVudCkge1xuICAgIGlmIChtb2RhbC5vcGVuKSBtb2RhbC5jbG9zZSgpO1xuICAgIGVsc2UgbW9kYWwuc2hvd01vZGFsKCk7XG4gIH0gZWxzZSBjb25zb2xlLndhcm4oXCJFbGVtZW50IGlkIGlzIG5vdCBmb3VuZCFcIiwgaWQpO1xufVxuXG5jb25zdCBuZXdQcm9qZWN0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctcHJvamVjdC1idG5cIik7XG5jb25zdCBuZXdVc2VyQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctdXNlci1idG5cIik7XG5cbmlmIChuZXdQcm9qZWN0QnRuKSB7XG4gIG5ld1Byb2plY3RCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICB0b2dnbGVNb2RhbChcIm5ldy1wcm9qZWN0LW1vZGFsXCIpO1xuICB9KTtcbn0gZWxzZSBjb25zb2xlLmxvZyhcIkJ1dHRvbiBjYW5ub3QgYmUgZm91bmQsIGNoZWNrIGh0bWwgaWRzIVwiKTtcblxuaWYgKG5ld1VzZXJCdG4pIHtcbiAgbmV3VXNlckJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHRvZ2dsZU1vZGFsKFwibmV3LXVzZXItbW9kYWxcIik7XG4gIH0pO1xufSBlbHNlIGNvbnNvbGUubG9nKFwiQnV0dG9uIGNhbm5vdCBiZSBmb3VuZCwgY2hlY2sgdGhlIElEIVwiKTtcblxuY29uc3QgcHJvamVjdHNMaXN0VWkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2plY3RzLWxpc3RcIikgYXMgSFRNTEVsZW1lbnQ7XG5jb25zdCBwcm9qZWN0RGV0YWlsc1BhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgXCJwcm9qZWN0LWRldGFpbHNcIlxuKSBhcyBIVE1MRWxlbWVudDtcblxuY29uc3QgcHJvamVjdHNNYW5hZ2VyID0gbmV3IFByb2plY3RzTWFuYWdlcihwcm9qZWN0c0xpc3RVaSwgcHJvamVjdERldGFpbHNQYWdlKTtcblxuY29uc3QgcHJvamVjdEZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1wcm9qZWN0LWZvcm1cIik7XG5jb25zdCBmb3JtQ2FuY2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWNhbmNlbFwiKTtcblxuaWYgKFxuICBwcm9qZWN0Rm9ybSAmJlxuICBwcm9qZWN0Rm9ybSBpbnN0YW5jZW9mIEhUTUxGb3JtRWxlbWVudCAmJlxuICBmb3JtQ2FuY2VsICYmXG4gIGZvcm1DYW5jZWwgaW5zdGFuY2VvZiBIVE1MQnV0dG9uRWxlbWVudFxuKSB7XG4gIC8vQ2FuY2VsIGJ1dHRvbiBmdW5jdGlvbmFsaXR5XG4gIGZvcm1DYW5jZWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBwcm9qZWN0Rm9ybS5yZXNldCgpO1xuICAgIHRvZ2dsZU1vZGFsKFwibmV3LXByb2plY3QtbW9kYWxcIik7XG4gIH0pO1xuICAvL0Zvcm0gZnVuY3Rpb25hbGl0eVxuICBwcm9qZWN0Rm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNvbnN0IGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKHByb2plY3RGb3JtKTtcbiAgICBjb25zdCBwcm9qZWN0RGF0YTogSVByb2plY3QgPSB7XG4gICAgICBuYW1lOiBmb3JtRGF0YS5nZXQoXCJuYW1lXCIpIGFzIHN0cmluZyxcbiAgICAgIGRlc2NyaXB0aW9uOiBmb3JtRGF0YS5nZXQoXCJkZXNjcmlwdGlvblwiKSBhcyBzdHJpbmcsXG4gICAgICBzdGF0dXM6IGZvcm1EYXRhLmdldChcInN0YXR1c1wiKSBhcyBTdGF0dXMsXG4gICAgICByb2xlOiBmb3JtRGF0YS5nZXQoXCJyb2xlXCIpIGFzIFJvbGUsXG4gICAgICBkYXRlOiBuZXcgRGF0ZShmb3JtRGF0YS5nZXQoXCJkYXRlXCIpIGFzIHN0cmluZyksXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgcHJvamVjdHNNYW5hZ2VyLm5ld1Byb2plY3QocHJvamVjdERhdGEpO1xuICAgICAgcHJvamVjdEZvcm0ucmVzZXQoKTtcbiAgICAgIHRvZ2dsZU1vZGFsKFwibmV3LXByb2plY3QtbW9kYWxcIik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc3QgZXJyRGVmOiBJU2luZ2xlRXJyb3IgPSB7XG4gICAgICAgIGNvZGU6IFwiMDAxXCIsXG4gICAgICAgIHRleHQ6IGBBIHByb2plY3Qgd2l0aCB0aGUgbmFtZVwiJHtwcm9qZWN0RGF0YS5uYW1lfVwiIGFscmVhZHkgZXhpc3RzLmAsXG4gICAgICAgIGhlYWRlcjogXCJJbnB1dCBFcnJvclwiLFxuICAgICAgfTtcbiAgICAgIGVyck1hbmFnZXIubmV3RXJyb3IoZXJyRGVmKTtcbiAgICB9XG4gIH0pO1xufSBlbHNlIHtcbiAgY29uc29sZS53YXJuKFwiRm9ybSBpcyBub3QgZm91bmQgb3IgaXQgaXMgbm90IGFuIEhUTUxGb3JtLCBjaGVjayB0aGUgSURcIik7XG59XG5cbi8vSW1wb3J0ICYgRXhwb3J0IEZ1bmN0aW9uYWxpdHlcblxuY29uc3QgaW1wb3J0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbXBvcnQtZnJvbS1qc29uXCIpO1xuY29uc3QgZXhwb3J0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJleHBvcnQtdG8tanNvblwiKTtcblxuaWYgKFxuICBpbXBvcnRCdG4gJiZcbiAgaW1wb3J0QnRuIGluc3RhbmNlb2YgSFRNTEJ1dHRvbkVsZW1lbnQgJiZcbiAgZXhwb3J0QnRuICYmXG4gIGV4cG9ydEJ0biBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50XG4pIHtcbiAgZXhwb3J0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgcHJvamVjdHNNYW5hZ2VyLmV4cG9ydFRvSlNPTigpO1xuICB9KTtcbiAgaW1wb3J0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgcHJvamVjdHNNYW5hZ2VyLmltcG9ydEZyb21KU09OKCk7XG4gIH0pO1xufSBlbHNlIHtcbiAgY29uc29sZS53YXJuKFwiQnV0dG9ucyBhcmUgbm90IGZvdW5kLiBDaGVjayBleHBvcnQgYW5kIGltcG9ydCBidXR0b24gaWRzIVwiKTtcbn1cblxuLy9Ub0RvIENyZWF0ZSBGb3JtXG5jb25zdCB0b2RvTW9kYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy10b2RvLW1vZGFsXCIpO1xuY29uc29sZS5sb2coXCJtb2RhbFwiLCB0b2RvTW9kYWwpO1xuY29uc3QgdG9kb0Zvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy10b2RvLWZvcm1cIik7XG5jb25zb2xlLmxvZyhcImZvcm1cIiwgdG9kb0Zvcm0pO1xuY29uc3QgdG9kb0NhbmNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9kby1jYW5jZWxcIik7XG5jb25zb2xlLmxvZyhcImNhbmNlbGJ0blwiLCB0b2RvQ2FuY2VsKTtcbmNvbnN0IGFkZFRvZG9CdG4gPSBwcm9qZWN0RGV0YWlsc1BhZ2UucXVlcnlTZWxlY3RvcihgW3RvZG8tYWRkXWApO1xuY29uc29sZS5sb2coXCJhZGRUb2RvYnRuXCIsIGFkZFRvZG9CdG4pO1xuY29uc3QgdG9kb0NvbnRhaW5lciA9IHByb2plY3REZXRhaWxzUGFnZS5xdWVyeVNlbGVjdG9yKGBbdG9kby1saXN0LWNvbnRhaW5lcl1gKTtcbmlmIChcbiAgdG9kb01vZGFsICYmXG4gIHRvZG9Nb2RhbCBpbnN0YW5jZW9mIEhUTUxEaWFsb2dFbGVtZW50ICYmXG4gIHRvZG9Gb3JtICYmXG4gIHRvZG9Gb3JtIGluc3RhbmNlb2YgSFRNTEZvcm1FbGVtZW50ICYmXG4gIHRvZG9DYW5jZWwgJiZcbiAgdG9kb0NhbmNlbCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50ICYmXG4gIGFkZFRvZG9CdG4gJiZcbiAgYWRkVG9kb0J0biBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmXG4gIHRvZG9Db250YWluZXIgJiZcbiAgdG9kb0NvbnRhaW5lciBpbnN0YW5jZW9mIEhUTUxFbGVtZW50XG4pIHtcbiAgLy9vcGVuIGRpYWxvZ1xuICBhZGRUb2RvQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgdG9kb01vZGFsLnNob3dNb2RhbCgpO1xuICB9KTtcblxuICAvL2NhbmNlbCBidXR0b24gZnVuY3Rpb25hbGl0eVxuICB0b2RvQ2FuY2VsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgdG9kb0Zvcm0ucmVzZXQoKTtcbiAgICB0b2RvTW9kYWwuY2xvc2UoKTtcbiAgfSk7XG4gIHRvZG9Gb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgKGUpID0+IHtcbiAgICAvL3ByZXZlbnQgZGVmYXVsdFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAvL2dhdGhlciB0b2RvIHBhcmFtZXRlcnNcbiAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSh0b2RvRm9ybSk7XG4gICAgY29uc3QgZGF0ZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2RvLWRlYWRsaW5lXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiRGF0ZSBpbnB1dCBlbGVtZW50OlwiLCBkYXRlSW5wdXQpO1xuXG4gICAgY29uc3QgaVRvZG86IElUb0RvID0ge1xuICAgICAgdGFzazogZm9ybURhdGEuZ2V0KFwidG9kby10YXNrXCIpIGFzIHN0cmluZyxcbiAgICAgIHN0YXR1czogZm9ybURhdGEuZ2V0KFwidG9kby1zdGF0dXNcIikgYXMgVG9Eb1N0YXR1cyxcbiAgICAgIGRlYWRsaW5lOiBuZXcgRGF0ZShmb3JtRGF0YS5nZXQoXCJ0b2RvLWRlYWRsaW5lXCIpIGFzIHN0cmluZyksXG4gICAgfTtcbiAgICAvL2NyZWF0ZSBuZXcgdG9kb1xuICAgIHByb2plY3RzTWFuYWdlci5hY3RpdmVQcm9qZWN0Lm5ld1RvRG8oaVRvZG8pO1xuICAgIC8vdXBkYXRlIFVpIGFuZCBQcm9qZWN0XG4gICAgcHJvamVjdHNNYW5hZ2VyLnVwZGF0ZVRvRG9MaXN0KCk7XG4gICAgdG9kb0Zvcm0ucmVzZXQoKTtcbiAgICB0b2RvTW9kYWwuY2xvc2UoKTtcbiAgfSk7XG59XG5cbi8vZWRpdCBwcm9qZWN0IGZvcm0gZWxlbWVudHMsIG1hZGUgc3VyZSB0aGV5IGFyZSBleGlzdCBpbiBIVE1MXG5jb25zdCBlZGl0Rm9ybUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicC1lZGl0XCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuY29uc3QgZWRpdEZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgXCJlZGl0LXByb2plY3QtZm9ybVwiXG4pIGFzIEhUTUxGb3JtRWxlbWVudDtcbmNvbnN0IGVkaXRGb3JtQ2FuY2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gIFwiZWRpdC1mb3JtLWNhbmNlbFwiXG4pIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuXG5lZGl0Rm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICB0b2dnbGVNb2RhbChcImVkaXQtcHJvamVjdC1tb2RhbFwiKTtcbiAgZm9yIChjb25zdCBrZXkgaW4gZWRpdER1bW15KSB7XG4gICAgY29uc3QgdmFsdWUgPSBwcm9qZWN0c01hbmFnZXIuYWN0aXZlUHJvamVjdFtrZXldO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBlZGl0Rm9ybS5xdWVyeVNlbGVjdG9yKFxuICAgICAgYFtuYW1lPVwiZWRpdC0ke2tleX1cIl1gXG4gICAgKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGVsZW1lbnQucGxhY2Vob2xkZXIgPSB2YWx1ZTtcbiAgICBpZiAoa2V5ID09PSBcInByb2dyZXNzXCIpIGVsZW1lbnQucGxhY2Vob2xkZXIgKz0gXCIlXCI7XG4gICAgaWYgKGtleSA9PT0gXCJjb3N0XCIpIGVsZW1lbnQucGxhY2Vob2xkZXIgPSBgJCR7dmFsdWV9YDtcbiAgICBpZiAoa2V5ID09PSBcInN0YXR1c1wiIHx8IGtleSA9PT0gXCJyb2xlXCIpIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgICBpZiAoa2V5ID09PSBcImRhdGVcIikgZWxlbWVudC52YWx1ZUFzRGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcbiAgfVxufSk7XG5cbmVkaXRGb3JtQ2FuY2VsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gIHRvZ2dsZU1vZGFsKFwiZWRpdC1wcm9qZWN0LW1vZGFsXCIpO1xuICBlZGl0Rm9ybS5yZXNldCgpO1xufSk7XG5cbmVkaXRGb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgKGUpID0+IHtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YShlZGl0Rm9ybSk7XG4gIGNvbnN0IGVkaXRlZERhdGE6IEVQcm9qZWN0ID0ge1xuICAgIG5hbWU6IGZvcm1EYXRhLmdldChcImVkaXQtbmFtZVwiKSBhcyBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb246IGZvcm1EYXRhLmdldChcImVkaXQtZGVzY3JpcHRpb25cIikgYXMgc3RyaW5nLFxuICAgIHN0YXR1czogZm9ybURhdGEuZ2V0KFwiZWRpdC1zdGF0dXNcIikgYXMgU3RhdHVzLFxuICAgIHJvbGU6IGZvcm1EYXRhLmdldChcImVkaXQtcm9sZVwiKSBhcyBSb2xlLFxuICAgIGNvc3Q6IE51bWJlcihmb3JtRGF0YS5nZXQoXCJlZGl0LWNvc3RcIikpLFxuICAgIHByb2dyZXNzOiBOdW1iZXIoZm9ybURhdGEuZ2V0KFwiZWRpdC1wcm9ncmVzc1wiKSksXG4gICAgZGF0ZTogbmV3IERhdGUoZm9ybURhdGEuZ2V0KFwiZWRpdC1kYXRlXCIpIGFzIHN0cmluZyksXG4gIH07XG4gIGNvbnN0IG5hbWVJc0F2YWlsYWJsZSA9ICFwcm9qZWN0c01hbmFnZXIuY2hlY2tFZGl0TmFtZUluVXNlKGVkaXRlZERhdGEpO1xuICBpZiAobmFtZUlzQXZhaWxhYmxlKSB7XG4gICAgcHJvamVjdHNNYW5hZ2VyLmFjdGl2ZVByb2plY3QuZWRpdFByb2plY3QoZWRpdGVkRGF0YSk7XG4gICAgcHJvamVjdHNNYW5hZ2VyLnNldFBhZ2VEZXRhaWxzKCk7XG4gICAgdG9nZ2xlTW9kYWwoXCJlZGl0LXByb2plY3QtbW9kYWxcIik7XG4gICAgZWRpdEZvcm0ucmVzZXQoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLndhcm4oXCJUaGVyZSBpcyBhbm90aGVyIHByb2plY3Qgd2l0aCB0aGUgc2FtZSBuYW1lIVwiKTtcbiAgICBlZGl0Rm9ybS5yZXNldCgpO1xuICB9XG59KTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChlKSA9PiB7XG4gIGlmIChlLmtleSA9PT0gXCJhXCIgfHwgZS5rZXkgPT09IFwiQVwiKVxuICAgIGNvbnNvbGUubG9nKFxuICAgICAgcHJvamVjdHNNYW5hZ2VyLmFjdGl2ZVByb2plY3QuaWQsXG4gICAgICBwcm9qZWN0c01hbmFnZXIuYWN0aXZlUHJvamVjdC5uYW1lXG4gICAgKTtcbn0pO1xuXG4vLyAvL09wZW4gIFZpZXdlclxuXG5jb25zdCB2aWV3ZXIgPSBuZXcgT0JDLkNvbXBvbmVudHMoKTtcbmNvbnN0IHNjZW5lQ29tcG9uZW50ID0gbmV3IE9CQy5TaW1wbGVTY2VuZSh2aWV3ZXIpO1xudmlld2VyLnNjZW5lID0gc2NlbmVDb21wb25lbnQ7XG5jb25zdCBzY2VuZSA9IHNjZW5lQ29tcG9uZW50LmdldCgpO1xuc2NlbmVDb21wb25lbnQuc2V0dXAoKTtcbnNjZW5lLmJhY2tncm91bmQgPSBudWxsO1xuXG5jb25zdCB2aWV3ZXJDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgXCJ2aWV3ZXItY29udGFpbmVyXCJcbikgYXMgSFRNTEVsZW1lbnQ7XG5jb25zdCByZW5kZXJlckNvbXBvbmVudCA9IG5ldyBPQkMuUG9zdHByb2R1Y3Rpb25SZW5kZXJlcihcbiAgdmlld2VyLFxuICB2aWV3ZXJDb250YWluZXJcbik7XG52aWV3ZXIucmVuZGVyZXIgPSByZW5kZXJlckNvbXBvbmVudDtcblxuY29uc3QgY2FtZXJhQ29tcG9uZW50ID0gbmV3IE9CQy5PcnRob1BlcnNwZWN0aXZlQ2FtZXJhKHZpZXdlcik7XG52aWV3ZXIuY2FtZXJhID0gY2FtZXJhQ29tcG9uZW50O1xuXG5jb25zdCByYXljYXN0ZXJDb21wb25lbnQgPSBuZXcgT0JDLlNpbXBsZVJheWNhc3Rlcih2aWV3ZXIpO1xudmlld2VyLnJheWNhc3RlciA9IHJheWNhc3RlckNvbXBvbmVudDtcblxuY29uc3QgZ3JpZCA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwMCwgMTAwKTtcbmdyaWQubWF0ZXJpYWwudHJhbnNwYXJlbnQgPSB0cnVlO1xuZ3JpZC5tYXRlcmlhbC5vcGFjaXR5ID0gMC40O1xuZ3JpZC5tYXRlcmlhbC5jb2xvciA9IG5ldyBUSFJFRS5Db2xvcihcIiMwMGZmZmZcIik7XG5zY2VuZS5hZGQoZ3JpZCk7XG5cbnZpZXdlci5pbml0KCk7XG5jYW1lcmFDb21wb25lbnQudXBkYXRlQXNwZWN0KCk7XG5yZW5kZXJlckNvbXBvbmVudC5wb3N0cHJvZHVjdGlvbi5lbmFibGVkID0gdHJ1ZTtcblxuY29uc3QgY2xhc3NpZmllciA9IG5ldyBPQkMuRnJhZ21lbnRDbGFzc2lmaWVyKHZpZXdlcik7XG5jb25zdCBjbGFzc2lmaWVyV2luZG93ID0gbmV3IE9CQy5GbG9hdGluZ1dpbmRvdyh2aWV3ZXIpO1xudmlld2VyLnVpLmFkZChjbGFzc2lmaWVyV2luZG93KTtcbmNsYXNzaWZpZXJXaW5kb3cudGl0bGUgPSBcIk1vZGVsIEdyb3Vwc1wiO1xuY2xhc3NpZmllcldpbmRvdy5kb21FbGVtZW50LnN0eWxlLmJhY2tncm91bmQgPSBcImJsYWNrXCI7XG5jbGFzc2lmaWVyV2luZG93LmRvbUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IFwiMC44XCI7XG5jbGFzc2lmaWVyV2luZG93LmRvbUVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZCA9IFwiYmx1cigxMDBweClcIjtcbmNsYXNzaWZpZXJXaW5kb3cuZG9tRWxlbWVudC5zdHlsZS5jb2xvciA9IFwiI2EyZmY0MlwiO1xuXG5sZXQgZnJhZ21lbnRzID0gbmV3IE9CQy5GcmFnbWVudE1hbmFnZXIodmlld2VyKTtcbmxldCBmcmFnbWVudElmY0xvYWRlciA9IG5ldyBPQkMuRnJhZ21lbnRJZmNMb2FkZXIodmlld2VyKTtcbmZyYWdtZW50SWZjTG9hZGVyLnNldHRpbmdzLndhc20gPSB7XG4gIHBhdGg6IFwiaHR0cHM6Ly91bnBrZy5jb20vd2ViLWlmY0AwLjAuNDMvXCIsXG4gIGFic29sdXRlOiB0cnVlLFxufTtcblxuZnJhZ21lbnRJZmNMb2FkZXIub25JZmNMb2FkZWQuYWRkKGFzeW5jIChtb2RlbCkgPT4ge1xuICBjb25zb2xlLmNsZWFyKCk7XG4gIGZyYWdtZW50SGlnaGxpZ2h0ZXIudXBkYXRlKCk7XG4gIGNsYXNzaWZpZXIuYnlFbnRpdHkobW9kZWwpO1xuICBjbGFzc2lmaWVyLmJ5U3RvcmV5KG1vZGVsKTtcbiAgY29uc29sZS5sb2coY2xhc3NpZmllci5nZXQoKSk7XG4gIGNvbnN0IGZyYWdtZW50VHJlZSA9IG5ldyBPQkMuRnJhZ21lbnRUcmVlKHZpZXdlcik7XG4gIGF3YWl0IGZyYWdtZW50VHJlZS5pbml0KCk7XG4gIGF3YWl0IGZyYWdtZW50VHJlZS51cGRhdGUoW1wiZW50aXRpZXNcIiwgXCJzdG9yZXlzXCJdKTtcbiAgY29uc3QgdHJlZSA9IGZyYWdtZW50VHJlZS5nZXQoKS51aUVsZW1lbnQuZ2V0KFwidHJlZVwiKTtcbiAgdHJlZS5uYW1lID0gbW9kZWwubmFtZTtcbiAgYXdhaXQgY2xhc3NpZmllcldpbmRvdy5zbG90cy5jb250ZW50LmRpc3Bvc2UodHJ1ZSk7XG4gIGNsYXNzaWZpZXJXaW5kb3cuYWRkQ2hpbGQodHJlZSk7XG59KTtcblxuY29uc3QgZnJhZ21lbnRIaWdobGlnaHRlciA9IG5ldyBPQkMuRnJhZ21lbnRIaWdobGlnaHRlcih2aWV3ZXIpO1xuZnJhZ21lbnRIaWdobGlnaHRlci5zZXR1cCgpO1xuXG5jb25zdCBtYWluVG9vbEJhciA9IG5ldyBPQkMuVG9vbGJhcih2aWV3ZXIpO1xuXG52aWV3ZXIudWkuYWRkVG9vbGJhcihtYWluVG9vbEJhcik7XG5tYWluVG9vbEJhci5hZGRDaGlsZChmcmFnbWVudElmY0xvYWRlci51aUVsZW1lbnQuZ2V0KFwibWFpblwiKSk7XG4iXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksV0FBVztBQUN2QixZQUFZLFNBQVM7QUFFckIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxvQkFBb0I7QUFHN0IsU0FBUyxpQkFBaUI7QUFHMUIsTUFBTSxVQUFVLENBQUMsaUJBQWlCLGNBQWMsaUJBQWlCO0FBQ2pFLE1BQU0saUJBQWlCLFNBQVMsZUFBZSxhQUFhO0FBQzVELE1BQU0sY0FBYyxTQUFTLGVBQWUsVUFBVTtBQUV0RCxTQUFTLFNBQVMsSUFBWTtBQUM1QixRQUFNLFNBQVMsUUFBUSxPQUFPLENBQUMsU0FBUyxTQUFTLEVBQUUsRUFBRSxDQUFDO0FBQ3RELFFBQU0sbUJBQW1CLFFBQVEsT0FBTyxDQUFDLFNBQVMsU0FBUyxFQUFFO0FBQzdELG1CQUFpQixJQUFJLENBQUNBLFFBQU87QUFDM0IsVUFBTSxlQUFlLFNBQVMsZUFBZUEsR0FBRTtBQUMvQyxtQkFDSyxhQUFhLE1BQU0sVUFBVSxTQUM5QixRQUFRLElBQUksNkJBQTZCO0FBQUEsRUFDL0MsQ0FBQztBQUNELFFBQU0sT0FBTyxTQUFTLGVBQWUsTUFBTTtBQUMzQyxTQUFRLEtBQUssTUFBTSxVQUFVLFNBQVUsUUFBUSxLQUFLLG1CQUFtQixFQUFFO0FBQzNFO0FBRUEsSUFBSSxrQkFBa0IsYUFBYTtBQUNqQyxpQkFBZSxpQkFBaUIsU0FBUyxNQUFNO0FBQzdDLGFBQVMsZUFBZTtBQUFBLEVBQzFCLENBQUM7QUFDRCxjQUFZLGlCQUFpQixTQUFTLE1BQU07QUFDMUMsYUFBUyxZQUFZO0FBQUEsRUFDdkIsQ0FBQztBQUNILE9BQU87QUFDTCxVQUFRLEtBQUssaUNBQWlDO0FBQ2hEO0FBRUEsTUFBTSxl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