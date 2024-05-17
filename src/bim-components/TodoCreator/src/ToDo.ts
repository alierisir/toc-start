import { TodoCard } from "./TodoCard";
import * as OBC from "openbim-components";
import { generateUUID } from "three/src/math/MathUtils.js";
import * as THREE from "three";

type TodoPriority = "Low" | "Normal" | "High";

interface IToDo {
  id: string;
  description: string;
  date: Date;
  fragmentMap: OBC.FragmentIdMap;
  camera: { position: THREE.Vector3; target: THREE.Vector3 };
  priority: TodoPriority;
}

export class ToDo
  extends OBC.Component<ToDo>
  implements OBC.UI, OBC.Disposable
{
  enabled: boolean = true;
  task: IToDo | {};
  private _components: OBC.Components;
  uiElement: OBC.UIElement<{
    card: TodoCard;
  }>;

  async dispose() {
    this.uiElement.dispose();
    this.enabled = false;
    this.task = {};
  }

  get() {
    return this;
  }
  constructor(components: OBC.Components) {
    super(components);
    this._components = components;
  }

  async createTask(description: string, priority: TodoPriority) {
    const { position, target } = this.getCameraProps();
    const highlighter = await this._components.tools.get(
      OBC.FragmentHighlighter
    );
    const task: IToDo = {
      description,
      priority,
      id: generateUUID(),
      camera: { position, target },
      date: new Date(),
      fragmentMap: highlighter.selection.select,
    };
    this.task = task;
  }

  getCameraProps() {
    const camera = this._components.camera;
    if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
      throw new Error(
        "ToDo creator needs an orthoperspective camera in order to work!"
      );
    }
    const position = new THREE.Vector3();
    camera.controls.getPosition(position);
    const target = new THREE.Vector3();
    camera.controls.getTarget(target);
    return { position, target };
  }
}
