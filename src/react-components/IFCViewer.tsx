import React, { Children, ReactNode } from "react";
import * as OBC from "openbim-components";
import { FragmentsGroup } from "bim-fragment";
import { TodoCreator } from "../bim-components/TodoCreator";
import { SimpleQto } from "../bim-components/SimpleQto";
import * as Router from "react-router-dom";
import { ProjectsManager } from "../classes/ProjectsManager";
import { getCollection } from "../firebase";
import { IToDo } from "../bim-components/TodoCreator/src/ToDo";
import * as Firestore from "firebase/firestore";
import { monthsAfterToday } from "../classes/CustomFunctions";

interface Props {
  projectsManager: ProjectsManager;
}

interface IViewerContext {
  viewer: OBC.Components | null;
  setViewer: (viewer: OBC.Components | null) => void;
}

export const ViewerContext = React.createContext<IViewerContext>({
  viewer: null,
  setViewer: () => {},
});

export const ViewerProvider = ({ children }) => {
  const [viewer, setViewer] = React.useState<OBC.Components | null>(null);
  return (
    <ViewerContext.Provider value={{ viewer, setViewer }}>
      {children}
    </ViewerContext.Provider>
  );
};

const IFCViewer = ({ projectsManager }: Props) => {
  const routeParams = Router.useParams<{ id: string }>();
  if (!routeParams.id) return <>ID is invalid</>;
  const id = routeParams.id;
  const project = projectsManager.getProject(id);
  if (!project) return <>Project not found!</>;

  const { setViewer } = React.useContext(ViewerContext);

  let viewer: OBC.Components;
  const createViewer = async (id: string) => {
    viewer = new OBC.Components();
    setViewer(viewer);

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

    // TEST convertion functions

    //highlighter.events.select.onHighlight.add((fragmentIdMap) => {
    //  const mapObJ = fragmentMapToJSON(fragmentIdMap);
    //  console.log("Map OBJ: ", mapObJ, typeof mapObJ);
    //  const fragMap = jsonTofragmentMap(mapObJ);
    //  console.log("FragmentMap Obj: ", fragMap, typeof fragMap);
    //});

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
    simpleGrid.visible = true;
    toggleGridBtn.active = true;

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
      path: "https:unpkg.com/web-ifc@0.0.44/",
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

      selectMat
        ? (selectMat.depthTest = false)
        : "Can't find the select material";
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
      setupDepthTest();
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

    //const culler = new OBC.ScreenCuller(viewer);
    //cameraComponent.controls.addEventListener("sleep", () => {
    //  culler.needsUpdate = true;
    //});

    const onModelLoaded = async (model: FragmentsGroup) => {
      highlighter.update();
      //for (const fragment of model.items) {
      //  culler.add(fragment.mesh);
      //}
      //culler.needsUpdate = true;

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
      exportFragments(model);
      exportToJSON(model);
      await onModelLoaded(model);
    });

    fragmentManager.onFragmentsLoaded.add((model) => {
      alert(`${model.name} is loaded, please load properties manually.`);
      const loadPropBtn = new OBC.Button(viewer, {
        materialIconName: "upload",
        tooltip: "Load Properties",
      });
      loadPropBtn.onClick.add(() => {
        importFromJson(model);
        toolbar.removeChild(loadPropBtn);
        loadPropBtn.dispose();
      });
      toolbar.addChild(loadPropBtn);
    });

    const todoCreator = new TodoCreator(viewer);
    await todoCreator.setup(project);

    //TODO CREATOR WILL SYNCHRONIZE WITH FIREBASE DATA AT THIS POINT
    const todosCollection = getCollection<IToDo>("/todos");
    const firebaseTodos = await Firestore.getDocs(todosCollection);
    const todosDocs = firebaseTodos.docs;
    for (const doc of todosDocs) {
      if (doc.data().projectId !== project.id) continue;
      const data = doc.data();
      const deadline = data.deadline
        ? (data.deadline as unknown as Firestore.Timestamp).toDate()
        : monthsAfterToday(1);
      const itodo: IToDo = {
        ...data,
        deadline,
      };
      try {
        todoCreator.addTodo(itodo, doc.id);
      } catch (error) {
        const todo = project.getToDo(doc.id);
        //console.log("todo exists,", todo);
        if (!todo) throw new Error("Todo not found");
        todoCreator.createExistingCard(todo, highlighter, cameraComponent);
      }
    }

    todoCreator.onToDoCreated.add((todo) => {
      //console.log(todo.taskId);
    });
    //AFTER THIS LINE THE TODOCREATOR LIST WILL BE EQUAL TO FIREBASE

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
    toolbar.addChild(fragmentManager.uiElement.get("main"));
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
  };

  React.useEffect(() => {
    createViewer(id);
    //console.log("viewer created");
    return () => {
      viewer.dispose();
      setViewer(null);
      //console.log("viewer disposed");
    };
  }, []);

  return (
    <div
      id="viewer-container"
      className="dashboard-card"
      style={{ minWidth: 0, position: "relative" }}
    />
  );
};

export default IFCViewer;
