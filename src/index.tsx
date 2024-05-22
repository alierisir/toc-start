import * as OBC from "openbim-components";
import { FragmentsGroup } from "bim-fragment";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import * as Router from "react-router-dom";
import Sidebar from "./react-components/Sidebar";
import { TodoCreator } from "./bim-components/TodoCreator";
import { SimpleQto } from "./bim-components/SimpleQto";
import ProjectsPage from "./react-components/ProjectsPage";
import ProjectDetailsPage from "./react-components/ProjectDetailsPage";

const rootElement = document.getElementById("app") as HTMLDivElement;
const appRoot = ReactDOM.createRoot(rootElement);
appRoot.render(
  <>
    <Router.BrowserRouter>
      <Sidebar />
      <Router.Routes>
        <Router.Route path="/" element={<ProjectsPage />} />
        <Router.Route path="/details" element={<ProjectDetailsPage />} />
        <Router.Route
          path="/users"
          element={"Users Page Will be Implemented"}
        />
      </Router.Routes>
    </Router.BrowserRouter>
  </>
);

const projectsListUi = document.getElementById("projects-list") as HTMLElement;

//OPEN VIEWER

/** OPEN VIEWER Commended out

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

*/
